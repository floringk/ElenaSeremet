import { cache } from "react";

import { resolveMediaAlt, resolveMediaUrl } from "@/lib/media-url";
import {
  type AlbumInfo,
  type AlbumImage,
  getAlbumBySlug as getAlbumBySlugFs,
  getAlbumCoverImage as getAlbumCoverImageFs,
  getAlbumImages as getAlbumImagesFs,
  getAlbums as getAlbumsFs,
  getTotalGalleryImageCount as getTotalGalleryImageCountFs
} from "@/lib/new-gallery";

import { isPayloadEnvConfigured } from "@/lib/payload-database-url";

function isPayloadConfigured(): boolean {
  return isPayloadEnvConfigured();
}

type CmsAlbumDoc = {
  title?: string;
  slug?: string;
  published?: boolean;
  coverImage?: unknown;
  images?: Array<{ image?: unknown; alt?: string | null }>;
};

async function fetchCmsAlbums(): Promise<AlbumInfo[] | null> {
  if (!isPayloadConfigured()) return null;

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "gallery-albums",
      where: { published: { equals: true } },
      limit: 200,
      depth: 1,
      sort: "title"
    });

    if (!result.docs.length) return null;

    const albums: AlbumInfo[] = [];
    for (const raw of result.docs) {
      const doc = raw as CmsAlbumDoc;
      const slug = String(doc.slug || "")
        .trim()
        .toLowerCase();
      const title = doc.title?.trim();
      if (!slug || !title) continue;
      const count = Array.isArray(doc.images) ? doc.images.length : 0;
      albums.push({ slug, label: title, count });
    }
    return albums.length > 0 ? albums : null;
  } catch (error) {
    console.error("[cms-gallery] Failed to load albums:", error);
    return null;
  }
}

export const getAlbumsResolved = cache(async (): Promise<AlbumInfo[]> => {
  const cms = await fetchCmsAlbums();
  return cms ?? getAlbumsFs();
});

export async function getAlbumBySlugResolved(slug: string): Promise<AlbumInfo | null> {
  const albums = await getAlbumsResolved();
  return albums.find((a) => a.slug === slug) ?? getAlbumBySlugFs(slug);
}

async function fetchCmsAlbumImages(slug: string): Promise<AlbumImage[] | null> {
  if (!isPayloadConfigured()) return null;

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "gallery-albums",
      where: {
        and: [{ slug: { equals: slug } }, { published: { equals: true } }]
      },
      limit: 1,
      depth: 1
    });

    const doc = result.docs[0] as CmsAlbumDoc | undefined;
    if (!doc || !Array.isArray(doc.images) || doc.images.length === 0) {
      return null;
    }

    const images: AlbumImage[] = [];
    for (const row of doc.images) {
      const src = resolveMediaUrl(row.image, null);
      if (!src) continue;
      images.push({
        src,
        alt: (row.alt?.trim() || resolveMediaAlt(row.image, "Fotografie")).trim()
      });
    }
    return images.length > 0 ? images : null;
  } catch (error) {
    console.error("[cms-gallery] Failed to load album images:", error);
    return null;
  }
}

export async function getAlbumImagesResolved(slug: string): Promise<AlbumImage[]> {
  const cms = await fetchCmsAlbumImages(slug);
  if (cms) return cms;
  return getAlbumImagesFs(slug);
}

export async function getAlbumCoverImageResolved(slug: string): Promise<AlbumImage | null> {
  if (isPayloadConfigured()) {
    try {
      const { getPayloadClient } = await import("./payload");
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "gallery-albums",
        where: {
          and: [{ slug: { equals: slug } }, { published: { equals: true } }]
        },
        limit: 1,
        depth: 1
      });
      const doc = result.docs[0] as CmsAlbumDoc | undefined;
      if (doc) {
        const cover = resolveMediaUrl(doc.coverImage, null);
        if (cover) {
          return { src: cover, alt: resolveMediaAlt(doc.coverImage, doc.title || "Album") };
        }
        const images = await fetchCmsAlbumImages(slug);
        if (images?.[0]) return images[0];
      }
    } catch {
      /* fall through */
    }
  }
  return getAlbumCoverImageFs(slug);
}

export async function getTotalGalleryImageCountResolved(): Promise<number> {
  const albums = await getAlbumsResolved();
  return albums.reduce((sum, a) => sum + a.count, 0) || getTotalGalleryImageCountFs();
}
