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
  // Reduce file watching to prevent EMFILE errors
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 2000, // Slower polling to reduce load
        aggregateTimeout: 500,
        followSymlinks: false,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/.vercel/**",
          "**/tmp/**",
          "**/scripts/**",
          "**/.cursor/**",
          "**/.vscode/**",
          "**/prisma/**",
          "**/public/images/**",
          "**/data/**",
          "**/.pnpm/**",
          "**/coverage/**",
          "**/dist/**",
          "**/build/**",
        ],
      };

      // Force webpack to only watch project directory, not parent directories
      config.resolve = config.resolve || {};
      config.resolve.symlinks = false;

      // Reduce the scope of what webpack watches
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
        immutablePaths: [],
        buildDependencies: {
          hash: true,
          timestamp: true,
        },
        module: {
          timestamp: true,
        },
        resolve: {
          timestamp: true,
        },
        resolveBuildDependencies: {
          hash: true,
          timestamp: true,
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
