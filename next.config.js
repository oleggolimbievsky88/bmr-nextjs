/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add GLB/GLTF loader
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/',
          outputPath: 'static/',
        },
      },
    })

    return config
  },
  images: {
    domains: ['localhost', 'bmrsuspension.com'],
  },
}

module.exports = nextConfig