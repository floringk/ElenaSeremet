import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buildMetadataForRoute } from "@/lib/page-metadata";
import { getAlbumCoverImage, getAlbums, getTotalGalleryImageCount } from "@/lib/new-gallery";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForRoute("/galerie", {
    title: "Galerie foto",
    description:
      "Galerie foto — studio Pilates Elena Seremet, ședințe și echipamente. Albume din shooting-uri profesionale.",
    path: "/galerie",
    ogImagePath: "/og-default.jpg"
  });
}

export default function GalleryIndexPage() {
  const albums = getAlbums();
  const total = getTotalGalleryImageCount();

  return (
    <section className="page-section gallery-page">
      <div className="container gallery-index">
        <header className="legacy-page-header gallery-index-header">
          <p className="section-label">Galerie</p>
          <h1>Galerie foto</h1>
          <p className="legacy-intro">
            {albums.length === 0
              ? "Nu sunt albume în mockups/content/images/new."
              : `${albums.length} albume · ${total} fotografii în total.`}
          </p>
        </header>

        {albums.length > 0 ? (
          <ul className="gallery-album-grid">
            {albums.map((a) => {
              const cover = getAlbumCoverImage(a.slug);
              return (
                <li key={a.slug}>
                  <Link href={`/galerie/${a.slug}`} className="gallery-album-tile focus-ring">
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        width={640}
                        height={480}
                        className="gallery-album-tile-img"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="gallery-album-tile-placeholder" aria-hidden />
                    )}
                    <span className="gallery-album-tile-overlay">
                      <span className="gallery-album-title">{a.label}</span>
                      <span className="gallery-album-count">{a.count} fotografii</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
