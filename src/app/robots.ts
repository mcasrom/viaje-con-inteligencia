import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/en/',
          '/api/',
          '/dashboard/',
          '/admin/',
          '/test-leaflet',
          '/api-endpoints',
          '/kpi',
          '/radius',
          '/relojes',
          '/lead-magnet',
          '/diagnostico',
          '/clustering',
          '/stats',
          '/precio-api',
          '/viaje-compartido',
          '/chat',
          '/alertas',
          '/comparar',
        ],
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: 'https://www.viajeinteligencia.com/sitemap.xml',
  }
}
