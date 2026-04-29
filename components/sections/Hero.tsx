import { Button } from "@/components/ui/Button";
import Image from "next/image";

type HeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
};

export function Hero({ title, subtitle, ctaLabel, ctaHref, imageSrc, imageAlt }: HeroProps) {
  return (
    <section className="page-section">
      <div className="container hero">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <Button href={ctaHref}>{ctaLabel}</Button>
        </div>
        <Image src={imageSrc} alt={imageAlt} className="hero-media" width={680} height={420} priority />
      </div>
    </section>
  );
}
