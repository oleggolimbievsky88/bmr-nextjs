// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     unoptimized: true,
//   },
// };

// // next.config.js
// module.exports = {
//   // Disable static generation errors temporarily
//   productionBrowserSourceMaps: true,
//   eslint: {
//     ignoreDuringBuilds: true, // Skip ESLint during production build
//   },
//   typescript: {
//     ignoreBuildErrors: true, // Ignore TypeScript errors during build
//   },
// };

// export default nextConfig;

export default {
  reactStrictMode: false, // Disable strict mode if needed
  swcMinify: true,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined, // Ensure compatibility with Vercel
};
