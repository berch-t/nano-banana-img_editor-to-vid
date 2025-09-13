import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
