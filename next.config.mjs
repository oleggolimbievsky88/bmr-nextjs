/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "bmrsuspension.com", "localhost:3000"],
    unoptimized: true,
  },
  reactStrictMode: false, // Disable strict mode if needed
  swcMinify: true,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined, // Ensure compatibility with Vercel
};

export default nextConfig;
