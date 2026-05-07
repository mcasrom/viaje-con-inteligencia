import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, Search } from 'lucide-react';
import { getAllPosts, getCategories, PostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
  description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT e inteligencia artificial.',
  keywords: 'blog viajes, análisis geopolítico, OSINT viajes, seguridad viajeros, tendencias viaje, inteligencia artificial viajes',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/blog',
  },
  openGraph: {
    title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
    description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT e inteligencia artificial.',
    url: 'https://www.viajeinteligencia.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog OSINT | Análisis de Viajes y Seguridad - Viaje con Inteligencia',
    description: 'Análisis geopolíticos, guías de seguridad y tendencias de viaje basadas en datos OSINT.',
  },
};

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      <div className="relative w-full h-48 bg-slate-700">
        {post.image && post.image.trim() !== '' ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover opacity-80 grayscale-[20%] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Tag className="w-12 h-12 text-slate-500" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-blue-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {post.excerpt || post.description || ''}
        </p>
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const category = searchParams.category;
  const search = searchParams.search;
  
  const posts = getAllPosts({
    category: category,
    search: search,
  });
  
  const categories = getCategories();
  const featuredPosts = posts.filter(p => (p as any).featured).slice(0, 3);
  const regularPosts = posts.filter(p => !(p as any).featured);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              Blog OSINT
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">
              Análisis de Viajes y Seguridad
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Guías prácticas, análisis geopolíticos y tendencias basadas en datos OSINT e inteligencia artificial para viajeros inteligentes.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <form className="flex-1 relative" action="/blog" method="GET">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="search"
                placeholder="Buscar artículos..."
                defaultValue={search || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              <button type="submit" className="sr-only">Buscar</button>
            </form>
            <div className="flex gap-2 flex-wrap justify-center">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !category
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && !category && !search && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {search ? `Resultados para "${search}"` : category ? category : 'Todos los artículos'}
            <span className="text-slate-500 text-sm font-normal">
              ({(category || search ? [...featuredPosts, ...regularPosts] : regularPosts).length} artículos)
            </span>
          </h2>
          
          {(category || search ? [...featuredPosts, ...regularPosts] : regularPosts).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(category || search ? [...featuredPosts, ...regularPosts] : regularPosts).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No se encontraron artículos</h3>
              <p className="text-slate-500">Prueba con otra búsqueda o categoría</p>
              <Link href="/blog" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
                Ver todos los artículos
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
