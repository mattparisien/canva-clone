/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Increase body size limit to 10MB (adjust as needed for your use case)
      bodySizeLimit: 10 * 1024 * 1024, // 10MB in bytes
    },
  },
}

export default nextConfig