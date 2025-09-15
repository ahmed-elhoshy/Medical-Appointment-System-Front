/**** next.config.js ****/
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: "https://localhost:7081/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
