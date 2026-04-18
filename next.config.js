/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone mode removed - using standard next start
  // output: 'standalone',
  
  // Generate unique build ID to prevent caching issues
  // This ensures each build has a unique identifier
  generateBuildId: async () => {
    // Use timestamp for unique build IDs
    return `build-${Date.now()}`
  },
  
  // Disable Next.js caching for HTML responses
  // This prevents serving stale HTML with old chunk references
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
