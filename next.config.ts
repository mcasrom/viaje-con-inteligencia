import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'viaje-con-inteligencia.vercel.app' },
      { hostname: 'www.viajeinteligencia.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/pais/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  output: 'standalone',
};
export default nextConfig;
