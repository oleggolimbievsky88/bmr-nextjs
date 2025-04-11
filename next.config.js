/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/prisma/**",
        ],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bmrsuspension.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bmrsuspension.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: [
      "i.ytimg.com",
      "img.youtube.com",
      "localhost",
      "131.153.149.105",
      "bmrsuspension.com",
      "www.bmrsuspension.com",
    ],
    unoptimized: true,
  },
  output: "standalone",
  experimental: {},
  poweredByHeader: false,
};

module.exports = nextConfig;
