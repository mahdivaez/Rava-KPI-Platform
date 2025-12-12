/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: true, // Enable Server Actions for Next.js 14
  },
  ignoreBuildErrors: true,
};

module.exports = nextConfig;