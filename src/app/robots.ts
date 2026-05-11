import { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generator for Next.js 14+
 * More reliable than static public/robots.txt on Vercel
 * 
 * Generated routes:
 * GET /robots.txt → this file
 * GET /api/robots → same content as JSON (optional)
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.viajeinteligencia.com';

  return {
    rules: [
      // Default rule: Allow everything except sensitive routes
      {
        userAgent: '*',
        allow: [
          '/',
          '/pais/',
          '/coste/',
          '/blog/',
          '/decidir/',
          '/analisis/',
          '/osint/',
          '/comparar/',
          '/viajes/',
          '/eventos/',
          '/turismo/',
          '/rutas/',
          '/destinos/',
          '/clustering/',
          '/indices/',
          '/stats/',
          '/transparencia/',
          '/metodologia/',
          '/manifiesto/',
          '/checklist/',
          '/alertas/',
          '/documentos/',
          '/reclamaciones/',
        ],
        disallow: [
          '/admin/',           // Admin dashboard
          '/api/',             // API routes
          '/auth/',            // Auth pages
          '/dashboard/',       // User dashboard
          '/profile/',         // User profile
          '/_next/',           // Next.js internals
          '/.*\.json$',        // JSON files
          '/api/cron/',        // Cron jobs
          '/api/admin/',       // Admin API
        ],
        crawlDelay: 2,
        userComment: 'Default crawling rules',
      },

      // More aggressive crawling for Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/', '/dashboard/'],
        crawlDelay: 0,
      },

      // Restrict Ahrefs
      {
        userAgent: 'AhrefsBot',
        allow: ['/blog/', '/pais/'],
        disallow: '/',
        crawlDelay: 10,
      },

      // Restrict Semrush
      {
        userAgent: 'SemrushBot',
        allow: ['/blog/'],
        disallow: '/',
        crawlDelay: 10,
      },

      // Block aggressive/bad bots
      {
        userAgent: ['MJ12bot', 'BLEXBot', 'Metauri.com', 'DotBot'],
        disallow: '/',
      },
    ],

    // Sitemap locations
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-0.xml`,
      `${baseUrl}/sitemap-1.xml`,
    ],

    // Host for canonical URL
    host: baseUrl,
  };
}
