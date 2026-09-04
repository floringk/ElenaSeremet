import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.build.json"
  },
  poweredByHeader: false,
  /**
   * Album photos are copied to public/content at build (CDN). Keep them out of
   * lambdas. JSON + manifest stay in the bundle so dynamic `/[slug]` can render
   * when `?preview=true` or CONTENT_SOURCE=auto runs at request time.
   */
  outputFileTracingExcludes: {
    "/*": ["./mockups/content/images/**", "./mockups/*.html"]
  },
  outputFileTracingIncludes: {
    "/*": ["./mockups/content/raw/**", "./mockups/content/site_manifest.json"]
  },
  // Next may pick a parent folder if multiple lockfiles exist; keep resolution inside this app
  turbopack: {
    root: __dirname
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  },
  async redirects() {
    return [
      { source: "/despre", destination: "/despre-noi", permanent: true },
      { source: "/program", destination: "/schedules", permanent: true },
      { source: "/about", destination: "/despre-noi", permanent: true },
      { source: "/services", destination: "/servicii", permanent: true },
      { source: "/pricing", destination: "/preturi", permanent: true },
      { source: "/prices", destination: "/preturi", permanent: true },
      { source: "/schedule", destination: "/schedules", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/inregistrare-clienti", destination: "/inscriere", permanent: true },
      { source: "/wp-content/:path*", destination: "/", permanent: false },
      { source: "/wp-admin/:path*", destination: "/cms", permanent: false },
      { source: "/wp-login.php", destination: "/cms/login", permanent: false }
    ];
  }
};

export default withPayload(nextConfig);
