import { NextResponse } from 'next/server';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';
import { SITE_URL as BASE_URL } from '@/lib/config';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Páginas a excluir del sitemap (privadas, dev, internas)
const EXCLUIR = new Set([
  '/dashboard',
  '/dashboard/kpis',
  '/dashboard/radar',
  '/dashboard/seguros',
  '/dashboard/subscription',
  '/admin',
  '/api-endpoints',
  '/test-leaflet',
  '/pwa',
  '/kpi',
  '/radius',
  '/relojes',
  '/lead-magnet',
]);

// Cache en memoria para el sitemap (se regenera cada 6h)
let cachedXml: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

// Prioridad por ruta
function getPriority(ruta: string): string {
  if (ruta === '') return '1.0';
  if (['/blog', '/alertas', '/analisis', '/paises', '/en'].includes(ruta)) return '0.9';
  if (ruta.startsWith('/pais/') || ruta.startsWith('/coste/') || ruta.startsWith('/blog/')) return '0.8';
  if (['/travel-risk-intelligence', '/osint-para-viajeros', '/geopolitica-y-viajes'].includes(ruta)) return '0.9';
  if (ruta.startsWith('/en/')) return '0.85';
  if (['/ecosistema', '/mapa', '/reporte-riesgo', '/infografias'].includes(ruta)) return '0.8';
  if (['/premium', '/free-trial', '/rutas', '/destinos', '/viajes', '/precio-api', '/newsletter'].includes(ruta)) return '0.75';
  if (['/legal', '/metodologia', '/manifiesto', '/afiliados', '/colaborar'].includes(ruta)) return '0.4';
  return '0.6';
}

function getChangefreq(ruta: string): string {
  if (ruta === '' || ruta === '/alertas') return 'daily';
  if (ruta.startsWith('/pais/') || ruta.startsWith('/coste/') || ruta === '/blog') return 'weekly';
  if (ruta.startsWith('/blog/')) return 'monthly';
  return 'weekly';
}

function buildUrl(loc: string, priority: string, changefreq: string, lastmod: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

// Escanea src/app buscando page.tsx estáticos automáticamente
function getStaticRoutes(): string[] {
  const appDir = path.join(process.cwd(), 'src/app');
  const routes: string[] = [];

  function scan(dir: string, base: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      // Saltar rutas dinámicas, api, privadas
      if (name.startsWith('[') || name.startsWith('(') || name === 'api' || name === 'admin') continue;
      const ruta = `${base}/${name}`;
      const pageFile = path.join(dir, name, 'page.tsx');
      if (fs.existsSync(pageFile) && !EXCLUIR.has(ruta)) {
        routes.push(ruta);
      }
      // Recursivo para subrutas
      scan(path.join(dir, name), ruta);
    }
  }

  // Raíz
  if (fs.existsSync(path.join(appDir, 'page.tsx'))) {
    routes.push('');
  }
  scan(appDir, '');
  return routes;
}

export async function GET() {
  const now = Date.now();

  // Servir cache si está fresco
  if (cachedXml && (now - cacheTimestamp) < CACHE_TTL) {
    return new NextResponse(cachedXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    let urls = '';

    // 1. Rutas estáticas — escaneadas automáticamente del filesystem
    const staticRoutes = getStaticRoutes();
    for (const ruta of staticRoutes) {
      const loc = `${BASE_URL}${ruta}`;
      urls += buildUrl(loc, getPriority(ruta), getChangefreq(ruta), today) + '\n';
    }

    // 2. Páginas de países /pais/[codigo] y /coste/[codigo]
    const paises = getTodosLosPaises();
    for (const pais of paises) {
      urls += buildUrl(`${BASE_URL}/pais/${pais.codigo}`, '0.8', 'weekly', today) + '\n';
      urls += buildUrl(`${BASE_URL}/coste/${pais.codigo}`, '0.85', 'weekly', today) + '\n';
    }

    // 3. Posts del blog /blog/[slug]
    const blogSlugs = getPostSlugs();
    for (const slug of blogSlugs) {
      urls += buildUrl(`${BASE_URL}/blog/${slug}`, '0.7', 'monthly', today) + '\n';
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

    // Guardar en cache
    cachedXml = xml;
    cacheTimestamp = now;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${BASE_URL}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } }
    );
  }
}
