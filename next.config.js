/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (updated syntax for Next.js 15)
  serverExternalPackages: ["mysql2"],

  // Suppress proxy deprecation warning (Next.js 16)
  experimental: {
    proxyPrefetch: "strict",
    // Allow larger form uploads for admin product creation (images, PDFs)
    serverActions: { bodySizeLimit: "20mb" },
  },

  // Image configuration for external domains
  // In development, use unoptimized images to avoid EACCES on .next/cache/images

  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bmrsuspension.com",
      },
      {
        protocol: "https",
        hostname: "www.bmrsuspension.com",
      },
      {
        protocol: "https",
        hostname: "legacy.bmrsuspension.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "legacy.bmrsuspension.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "www.paypalobjects.com",
      },
    ],
  },

  // Redirect old URLs to current pages
  async redirects() {
    return [
      { source: "/contact-1", destination: "/contact", permanent: true },
      { source: "/faq-1", destination: "/faq", permanent: true },
      { source: "/faq-2", destination: "/faq", permanent: true },
    ];
  },

  // Disable static optimization for API routes that use database
  async rewrites() {
    return [];
  },

  // Add webpack configuration to handle database connections
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle mysql2 for server-side rendering
      config.externals.push("mysql2");
    }
    return config;
  },

  // Turbopack: Next.js 16 aliases "next-auth" to "next/auth"; resolve to actual package
  turbopack: {
    resolveAlias: {
      "next/auth": "next-auth",
    },
  },

  // Disable static generation for specific pages that use database
  async headers() {
    return [
      {
        source: "/confirmation",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
      {
        source: "/checkout",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
