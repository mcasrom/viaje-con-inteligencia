import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache e imágenes
  images: {
    minimumCacheTTL: 60 * 60 * 24, // 24 horas para imágenes
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'viaje-con-inteligencia.vercel.app' },
    ],
  },
  
  // Headers de caché
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/pais/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Generar rutas estáticas en build
  output: 'standalone',
};

export default nextConfig;
