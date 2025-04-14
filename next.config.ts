import type {NextConfig} from 'next';
import { i18n } from './src/app/i18n/i18n-config';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  i18n,
};

export default nextConfig;
