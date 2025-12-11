/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (updated syntax for Next.js 15)
  serverExternalPackages: ["mysql2"],

  // Image configuration for external domains
  images: {
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
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
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

  // Turbopack configuration (empty to silence error - webpack is still used)
  turbopack: {},

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
