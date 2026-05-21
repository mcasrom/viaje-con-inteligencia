import { MetadataRoute } from 'next'
import { getTodosLosPaises } from '@/data/paises'
import { getAllPosts } from '@/lib/posts'

const BASE_URL = 'https://www.viajeinteligencia.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                            lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/blog`,                  lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/alertas`,               lastModified: now, changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE_URL}/stats`,                 lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/transparencia`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/rutas`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
  ]

  // Páginas de países /pais/[codigo]
  const paises = getTodosLosPaises()
  const paisRoutes: MetadataRoute.Sitemap = paises.map(p => ({
    url: `${BASE_URL}/pais/${p.codigo}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Páginas de coste /coste/[codigo]
  const costeRoutes: MetadataRoute.Sitemap = paises.map(p => ({
    url: `${BASE_URL}/coste/${p.codigo}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Posts del blog /blog/[slug]
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = getAllPosts()
    blogRoutes = posts
      
      .map(p => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
  } catch (e) {
    console.error('sitemap: error cargando posts', e)
  }

  return [...staticRoutes, ...paisRoutes, ...costeRoutes, ...blogRoutes]
}
