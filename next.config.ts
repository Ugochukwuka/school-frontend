import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  // Proxy API requests to backend to avoid CORS issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
