module.exports = {
  async redirects() {
    return [
      {
        source: "/old-url/:path*",
        destination: "/new-url/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bmrsuspension.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};
