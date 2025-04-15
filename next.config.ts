import type {NextConfig} from 'next';


const nextConfig: NextConfig = {
  output: 'export', // Required for static HTML export
  images: { unoptimized: true },
   // Optional: Add trailingSlash if links break
   trailingSlash: true,
   basePath: process.env.NODE_ENV === 'production' ? '/Cash-Calculator' : '',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
