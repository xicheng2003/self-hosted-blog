import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: process.env.STATIC_EXPORT === "true",
  },
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    workerThreads: false,
  },
}

export default nextConfig
