/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add webpack configuration
    config.watchOptions = {
      poll: false, // Disable polling
      followSymlinks: false, // Don't follow symlinks
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/public/**',
        '**/cache/**',
        '**/.cache/**',
        '**/coverage/**',
        '**/logs/**',
        '**/temp/**',
        '**/tmp/**'
      ],
    };

    // Optimize chunk loading
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          }
        }
      }
    };

    return config;
  },
  // Disable file system watching for static files
  onDemandEntries: {
    maxInactiveAge: 15 * 1000, // 15 seconds
    pagesBufferLength: 1,
  },
  // Disable unnecessary features
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: false,
  // Add performance optimizations
  swcMinify: true,
  // Strict production optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig 