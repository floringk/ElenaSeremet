import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import type { ReactNode } from "react";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { PreviewBanner } from "@/components/layout/PreviewBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  absoluteUrl,
  buildRootStructuredDataGraph,
  defaultDescription,
  defaultOgImagePath,
  siteName,
  siteUrl
} from "@/lib/seo";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: absoluteUrl("/"),
    siteName,
    locale: "ro_RO",
    type: "website",
    images: [{ url: defaultOgImagePath, width: 1200, height: 630, alt: siteName }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: [defaultOgImagePath]
  },
  robots: {
    index: true,
    follow: true
  }
};

const structuredData = buildRootStructuredDataGraph();

/** Root layout for the public marketing site (separate from Payload `/cms`). */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} ${lora.variable}`}>
        <JsonLd data={structuredData} />
        <a href="#main-content" className="skip-link">
          Sari la conținut
        </a>
        <AnalyticsTracker />
        <SiteHeader />
        <PreviewBanner />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
