import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '64.112.40.12',
        port: '9000',
        pathname: '/blog-images/**',
      },
      {
        protocol: 'https',
        hostname: 'oss.auradawn.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
