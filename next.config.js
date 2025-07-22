/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    domains: ["i.ytimg.com", "img.youtube.com"],
    unoptimized: true,
  },
  output: "standalone",
  logging: {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  },
};

module.exports = nextConfig;
