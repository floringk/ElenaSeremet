import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Next may pick a parent folder if multiple lockfiles exist; keep resolution inside this app
  turbopack: {
    root: __dirname
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
      { source: "/contact-us", destination: "/contact", permanent: true }
    ];
  }
};

export default withPayload(nextConfig);
