import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // CMS image validation permits 5 MB; allow a little multipart overhead.
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
