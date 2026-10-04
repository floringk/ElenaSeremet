import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlbumMasonry } from "@/components/gallery/AlbumMasonry";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getAlbumBySlugResolved,
  getAlbumImagesResolved,
  getAlbumsResolved
} from "@/lib/cms-gallery";
import { absoluteUrl, buildPageMetadata, defaultDescription } from "@/lib/seo";

type PageProps = {
  params: Promise<{ album: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const albums = await getAlbumsResolved();
  return albums.map((a) => ({ album: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { album: slug } = await params;
  const album = await getAlbumBySlugResolved(slug);
  if (!album) {
    return { title: "Album negasit" };
  }

  return buildPageMetadata({
    title: `Galerie: ${album.label}`,
    description: `${album.count} fotografii — ${album.label}. ${defaultDescription}`,
    path: `/galerie/${slug}`,
    ogImagePath: null
  });
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { album: slug } = await params;
  const album = await getAlbumBySlugResolved(slug);
  if (!album) {
    notFound();
  }

  const images = await getAlbumImagesResolved(slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Galerie foto", item: absoluteUrl("/galerie") },
      {
        "@type": "ListItem",
        position: 3,
        name: album.label,
        item: absoluteUrl(`/galerie/${slug}`)
      }
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <section className="page-section">
        <div className="container gallery-album-page">
          <nav className="gallery-back" aria-label="Navigare galerie">
            <Link href="/galerie" className="focus-ring gallery-back-link">
              ← Toate albumele
            </Link>
          </nav>

          <header className="legacy-page-header">
            <p className="section-label">Album</p>
            <h1>{album.label}</h1>
            <p className="legacy-intro muted">{album.count} fotografii</p>
          </header>

          <AlbumMasonry images={images} albumLabel={album.label} />

          <p className="muted gallery-note">
            Fotografiile se incarca lenes pentru performanta. Click pe o imagine pentru a o deschide la dimensiune
            completa.
          </p>
        </div>
      </section>
    </>
  );
}
