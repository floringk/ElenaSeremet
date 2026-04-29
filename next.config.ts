import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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

export default nextConfig;
