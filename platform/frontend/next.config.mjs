/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to the backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
