import { getPostSlugs } from '@/lib/posts';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://viaje-con-inteligencia.vercel.app';

const staticPages = [
  '',
  '/checklist',
  '/blog',
  '/premium',
  '/dashboard',
  '/legal',
  '/metodologia',
  '/relojes',
  '/alertas',
  '/en',
  '/pt',
  '/contact',
  '/premium',
  '/pwa',
];

export async function GET() {
  const posts = getPostSlugs();
  const countries = Object.keys(paisesData);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${posts
    .map(
      (slug) => `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${countries
    .map(
      (code) => `
  <url>
    <loc>${BASE_URL}/pais/${code}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}