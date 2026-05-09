import { MetadataRoute } from 'next';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';
import { SITE_URL as BASE_URL } from '@/lib/config';

const MONTHS: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
};

function parseLastModified(dateStr: string): Date {
  const parts = dateStr.toLowerCase().split(' ');
  if (parts.length === 2 && MONTHS[parts[0]]) {
    return new Date(`${parts[1]}-${MONTHS[parts[0]]}-01`);
  }
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paises = getTodosLosPaises();

  const paisEntries = paises.map((pais) => ({
    url: `${BASE_URL}/pais/${pais.codigo}`,
    lastModified: parseLastModified(pais.ultimoInforme),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const costeEntries = paises.map((pais) => ({
    url: `${BASE_URL}/coste/${pais.codigo}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const viajeCosteEntries = paises.map((pais) => ({
    url: `${BASE_URL}/viaje-coste/${pais.codigo}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const viajeClimaEntries = paises.map((pais) => ({
    url: `${BASE_URL}/viajes/clima/${pais.codigo}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogSlugs = getPostSlugs();
  const blogEntries = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly' as const, lastModified: new Date(), alternates: { languages: { es: BASE_URL, en: `${BASE_URL}/en`, 'x-default': BASE_URL } } },
    { url: `${BASE_URL}/en`, priority: 0.9, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/analisis`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/coste`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/decidir`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/viajes`, priority: 0.85, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/comparar`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/premium`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/checklist`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/alertas`, priority: 0.8, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/viaje-coste`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/documentos`, priority: 0.8, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/paises`, priority: 0.8, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/petroleo`, priority: 0.75, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/eventos`, priority: 0.75, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/turismo`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/indices`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/osint`, priority: 0.75, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/clustering`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/destinos`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/predicciones`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/viajes/clima`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/rutas`, priority: 0.75, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/chat`, priority: 0.7, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/contact`, priority: 0.7, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/free-trial`, priority: 0.7, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/stats`, priority: 0.7, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/diagnostico`, priority: 0.65, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/transparencia`, priority: 0.6, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/fuentes-osint`, priority: 0.6, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/legal`, priority: 0.5, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/metodologia`, priority: 0.5, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/manifiesto`, priority: 0.5, changeFrequency: 'monthly' as const, lastModified: new Date() },
    { url: `${BASE_URL}/afiliados`, priority: 0.4, changeFrequency: 'monthly' as const, lastModified: new Date() },
  ];

  return [
    ...staticPages,
    ...paisEntries,
    ...costeEntries,
    ...viajeCosteEntries,
    ...viajeClimaEntries,
    ...blogEntries,
  ];
}
