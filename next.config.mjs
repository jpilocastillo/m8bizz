/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint error checking in production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking in production builds
  },
  images: {
    unoptimized: true,
  },
  // Enable Next.js instrumentation hook
  experimental: {
    instrumentationHook: true,
  },
}

export default nextConfig
