import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/test-leaflet',
          '/api-endpoints',
          '/kpi',
          '/radius',
          '/relojes',
          '/lead-magnet',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://www.viajeinteligencia.com/sitemap.xml',
  }
}
