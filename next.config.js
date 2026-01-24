/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: false,
  },
  // Skip pre-rendering for API routes during build
  skipTrailingSlashRedirect: true,
  // Disable static optimization for all pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
