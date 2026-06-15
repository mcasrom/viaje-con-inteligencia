import { NextResponse } from 'next/server';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';
import { SITE_URL as BASE_URL } from '@/lib/config';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// 🔥 ECOSISTEMA (NUEVO)
const ECOSYSTEM = [
  'https://tools.viajeinteligencia.com',
  'https://georisk.viajeinteligencia.com',
  'https://gc.motors.viajeinteligencia.com'
];

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
  '/clustering',
  '/diagnostico',
  '/stats',
  '/precio-api',
  '/feed',
  '/viajes/clima',
  '/viaje-compartido',
  '/alertas',
  '/chat',
  '/comparar',
]);

let cachedXml: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000;

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
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Escanea rutas del proyecto WWW
function getStaticRoutes(): string[] {
  const appDir = path.join(process.cwd(), 'src/app');
  const routes: string[] = [];

  function scan(dir: string, base: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const name = entry.name;
      if (name.startsWith('[') || name.startsWith('(') || name === 'api' || name === 'admin') continue;

      const ruta = `${base}/${name}`;
      const pageFile = path.join(dir, name, 'page.tsx');

      if (fs.existsSync(pageFile) && !EXCLUIR.has(ruta)) {
        routes.push(ruta);
      }

      scan(path.join(dir, name), ruta);
    }
  }

  if (fs.existsSync(path.join(appDir, 'page.tsx'))) {
    routes.push('');
  }

  scan(appDir, '');
  return routes;
}

export async function GET() {
  const now = Date.now();

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

    // 1. WWW rutas
    const staticRoutes = getStaticRoutes();
    for (const ruta of staticRoutes) {
      urls += buildUrl(`${BASE_URL}${ruta}`, getPriority(ruta), getChangefreq(ruta), today) + '\n';
    }

    // 2. Países
    const paises = getTodosLosPaises();
    for (const pais of paises) {
      urls += buildUrl(`${BASE_URL}/pais/${pais.codigo}`, '0.8', 'weekly', today) + '\n';
      urls += buildUrl(`${BASE_URL}/coste/${pais.codigo}`, '0.85', 'weekly', today) + '\n';
    }

    // 3. Blog
    const blogSlugs = getPostSlugs();
    for (const slug of blogSlugs) {
      urls += buildUrl(`${BASE_URL}/blog/${slug}`, '0.7', 'monthly', today) + '\n';
    }

    // 🔥 4. ECOSISTEMA (NUEVO)
    for (const url of ECOSYSTEM) {
      urls += buildUrl(url, '0.95', 'daily', today) + '\n';
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

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
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
  </url>
</urlset>`,
      {
        status: 200,
        headers: { 'Content-Type': 'application/xml' }
      }
    );
  }
}
