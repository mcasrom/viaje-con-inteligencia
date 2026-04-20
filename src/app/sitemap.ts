import { MetadataRoute } from 'next';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';

const BASE_URL = 'https://viaje-con-inteligencia.vercel.app';

function buildAlternates(baseUrl: string) {
  return {
    languages: {
      es: baseUrl,
      en: `${baseUrl}/en`,
      pt: `${baseUrl}/pt`,
      'x-default': baseUrl,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paises = getTodosLosPaises();
  const paisEntries = paises.map((pais) => ({
    url: `${BASE_URL}/pais/${pais.codigo}`,
    lastModified: new Date(pais.ultimoInforme),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogSlugs = getPostSlugs();
  const blogEntries = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: BASE_URL, priority: 1.0, alternates: buildAlternates(BASE_URL) },
    { url: `${BASE_URL}/en`, priority: 0.9 },
    { url: `${BASE_URL}/pt`, priority: 0.9 },
    { url: `${BASE_URL}/premium`, priority: 0.8 },
    { url: `${BASE_URL}/checklist`, priority: 0.8 },
    { url: `${BASE_URL}/alertas`, priority: 0.8 },
    { url: `${BASE_URL}/blog`, priority: 0.8 },
    { url: `${BASE_URL}/relojes`, priority: 0.7 },
    { url: `${BASE_URL}/pwa`, priority: 0.7 },
    { url: `${BASE_URL}/contact`, priority: 0.6 },
    { url: `${BASE_URL}/legal`, priority: 0.5 },
    { url: `${BASE_URL}/metodologia`, priority: 0.5 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return [...staticPages, ...paisEntries, ...blogEntries];
}