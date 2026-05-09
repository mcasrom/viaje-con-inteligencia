import { MetadataRoute } from 'next';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';

import { SITE_URL as BASE_URL } from '@/lib/config';

function buildAlternates(baseUrl: string) {
  return {
    languages: {
      es: baseUrl,
      en: `${baseUrl}/en`,
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

  const costeEntries = paises.filter(p => p.codigo !== 'cu').map((pais) => ({
    url: `${BASE_URL}/coste/${pais.codigo}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const staticPages = [
    { url: BASE_URL, priority: 1.0, alternates: buildAlternates(BASE_URL) },
    { url: `${BASE_URL}/en`, priority: 0.9 },
    { url: `${BASE_URL}/coste`, priority: 0.85 },
    { url: `${BASE_URL}/decidir`, priority: 0.85 },
    { url: `${BASE_URL}/analisis`, priority: 0.85 },
    { url: `${BASE_URL}/viajes`, priority: 0.85 },
    { url: `${BASE_URL}/comparar`, priority: 0.8 },
    { url: `${BASE_URL}/premium`, priority: 0.8 },
    { url: `${BASE_URL}/checklist`, priority: 0.8 },
    { url: `${BASE_URL}/alertas`, priority: 0.8 },
    { url: `${BASE_URL}/blog`, priority: 0.8 },
    { url: `${BASE_URL}/viaje-coste`, priority: 0.8 },
    { url: `${BASE_URL}/documentos`, priority: 0.8 },
    { url: `${BASE_URL}/rutas`, priority: 0.75 },
    { url: `${BASE_URL}/eventos`, priority: 0.75 },
    { url: `${BASE_URL}/turismo`, priority: 0.75 },
    { url: `${BASE_URL}/indices`, priority: 0.75 },
    { url: `${BASE_URL}/osint`, priority: 0.75 },
    { url: `${BASE_URL}/stats`, priority: 0.7 },
    { url: `${BASE_URL}/transparencia`, priority: 0.6 },
    { url: `${BASE_URL}/fuentes-osint`, priority: 0.6 },
    { url: `${BASE_URL}/metodologia`, priority: 0.5 },
    { url: `${BASE_URL}/manifiesto`, priority: 0.5 },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return [...staticPages, ...paisEntries, ...costeEntries, ...blogEntries];
}