import Image from "next/image";

import type { AlbumImage } from "@/lib/new-gallery";

type AlbumMasonryProps = {
  images: AlbumImage[];
  albumLabel: string;
};

export function AlbumMasonry({ images, albumLabel }: AlbumMasonryProps) {
  if (images.length === 0) {
    return <p className="muted">Nu exista imagini in acest album.</p>;
  }

  return (
    <div className="album-masonry" role="list" aria-label={`Fotografii: ${albumLabel}`}>
      {images.map((img) => (
        <figure key={img.src} className="album-tile" role="listitem">
          <a href={img.src} className="album-tile-link" target="_blank" rel="noopener noreferrer">
            <Image
              src={img.src}
              alt={img.alt}
              width={640}
              height={480}
              sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
              className="album-tile-img"
              loading="lazy"
            />
          </a>
        </figure>
      ))}
    </div>
  );
}
