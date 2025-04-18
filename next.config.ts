import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Cash-Calculator', // Remove process.env check - always use in production
  assetPrefix: '/Cash-Calculator/', // Add trailing slash for consistency
  trailingSlash: true, // Helps with path resolution
  images: { unoptimized: true }, // Required for static export
  // Optional build-time overrides (keep if needed)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;