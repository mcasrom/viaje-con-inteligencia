import { NextResponse } from 'next/server';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';
import { SITE_URL as BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

const MONTHS: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
};

function parseLastModified(dateStr: string): string {
  try {
    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length === 2 && MONTHS[parts[0]]) {
      return `${parts[1]}-${MONTHS[parts[0]]}-01`;
    }
  } catch {}
  return new Date().toISOString().split('T')[0];
}

function buildUrl(loc: string, priority: string, changefreq: string, lastmod?: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod || new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0];

  try {
    let urls = '';

    // Static pages
    const staticPages: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      { loc: BASE_URL, priority: '1.0', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/analisis`, priority: '0.85', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/coste`, priority: '0.85', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/decidir`, priority: '0.85', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/viajes`, priority: '0.85', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/comparar`, priority: '0.8', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/premium`, priority: '0.8', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/checklist`, priority: '0.8', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/alertas`, priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/blog`, priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/documentos`, priority: '0.8', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/paises`, priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/petroleo`, priority: '0.75', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/eventos`, priority: '0.75', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/turismo`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/indices`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/osint`, priority: '0.75', changefreq: 'weekly', lastmod: today },
      { loc: `${BASE_URL}/clustering`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/destinos`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/predicciones`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/rutas`, priority: '0.75', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/chat`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/contact`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/free-trial`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/stats`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/diagnostico`, priority: '0.65', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/ecosistema`, priority: '0.65', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/seguridad`, priority: '0.65', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/transparencia`, priority: '0.6', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/fuentes-osint`, priority: '0.6', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/travel-risk-intelligence`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/osint-para-viajeros`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/geopolitica-y-viajes`, priority: '0.7', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/legal`, priority: '0.5', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/metodologia`, priority: '0.5', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/manifiesto`, priority: '0.5', changefreq: 'monthly', lastmod: today },
      { loc: `${BASE_URL}/afiliados`, priority: '0.4', changefreq: 'monthly', lastmod: today },
    ];

    for (const p of staticPages) {
      urls += buildUrl(p.loc, p.priority, p.changefreq, p.lastmod) + '\n';
    }

    // Country pages
    const paises = getTodosLosPaises();
    for (const pais of paises) {
      const lastmod = parseLastModified(pais.ultimoInforme);
      urls += buildUrl(`${BASE_URL}/pais/${pais.codigo}`, '0.8', 'weekly', lastmod) + '\n';
      urls += buildUrl(`${BASE_URL}/coste/${pais.codigo}`, '0.85', 'weekly', today) + '\n';
    }

    // Blog posts
    const blogSlugs = getPostSlugs();
    for (const slug of blogSlugs) {
      urls += buildUrl(`${BASE_URL}/blog/${slug}`, '0.7', 'monthly', today) + '\n';
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${BASE_URL}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml' } }
    );
  }
}
