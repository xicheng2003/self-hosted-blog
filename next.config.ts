import type { NextConfig } from "next";

const isStandalone = process.env.STANDALONE === 'true';
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  ...(isStandalone ? { output: 'standalone' } : {}),
  images: {
    ...(isDev ? { dangerouslyAllowLocalIP: true } : {}),
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
