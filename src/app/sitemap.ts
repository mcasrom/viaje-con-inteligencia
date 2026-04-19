import { MetadataRoute } from 'next';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://viaje-con-inteligencia.vercel.app';

  const paises = getTodosLosPaises();
  const paisEntries = paises.map((pais) => ({
    url: `${baseUrl}/pais/${pais.codigo}`,
    lastModified: new Date(pais.ultimoInforme),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogSlugs = getPostSlugs();
  const blogEntries = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/premium`, priority: 0.9 },
    { url: `${baseUrl}/checklist`, priority: 0.8 },
    { url: `${baseUrl}/alertas`, priority: 0.8 },
    { url: `${baseUrl}/blog`, priority: 0.8 },
    { url: `${baseUrl}/relojes`, priority: 0.7 },
    { url: `${baseUrl}/pwa`, priority: 0.7 },
    { url: `${baseUrl}/contact`, priority: 0.6 },
    { url: `${baseUrl}/legal`, priority: 0.5 },
    { url: `${baseUrl}/metodologia`, priority: 0.5 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return [...staticPages, ...paisEntries, ...blogEntries];
}