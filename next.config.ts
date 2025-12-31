import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '64.112.40.12',
        port: '9000',
        pathname: '/blog-images/**',
      },
      {
        protocol: 'http',
        hostname: 'oss.auradawn.cn',
        pathname: '/blog-images/**',
      },
    ],
  },
};

export default nextConfig;
