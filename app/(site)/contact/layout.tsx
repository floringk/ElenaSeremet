import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: "Trimite-ne un mesaj — Pilates Studio Elena Seremet. Iti raspundem in cel mai scurt timp.",
  path: "/contact"
});

export default function ContactLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
