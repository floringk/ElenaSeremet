import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import type { ReactNode } from "react";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { absoluteUrl, defaultDescription, defaultOgImagePath, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsActivityLocation",
      name: siteName,
      description: defaultDescription,
      url: absoluteUrl("/"),
      image: absoluteUrl(defaultOgImagePath)
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/")
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} ${lora.variable}`}>
        <JsonLd data={structuredData} />
        <a href="#main-content" className="skip-link">
          Sari la continut
        </a>
        <AnalyticsTracker />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
