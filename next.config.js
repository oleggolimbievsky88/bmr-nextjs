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
  },
  output: "standalone",
};

module.exports = nextConfig;
