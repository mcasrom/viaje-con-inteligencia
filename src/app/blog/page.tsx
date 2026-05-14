import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, Search, ChevronLeft, ChevronRight, ChevronDown, List, Grid } from 'lucide-react';
import { getAllPosts, getCategories, getPostsPagination, PostMeta } from '@/lib/posts';
import BlogSearch from './BlogSearch';

const POSTS_PER_PAGE = 10;
const CATEGORY_ICONS: Record<string, string> = {
  Destinos: '🗺️',
  Tecnología: '💻',
  Estrategia: '♟️',
  Seguridad: '🛡️',
  Recursos: '🧰',
  Consejos: '💡',
  Básicos: '📖',
};
const CATEGORY_COLORS: Record<string, string> = {
  Destinos: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  Tecnología: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  Estrategia: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  Seguridad: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  Recursos: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  Consejos: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  Básicos: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
};

export const revalidate = 300;

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

function PostListItem({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:bg-slate-800/80">
      <div className="relative w-32 h-24 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
        {post.image && post.image.trim() !== '' ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover opacity-80 grayscale-[20%] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
            loading="lazy"
            sizes="128px"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Tag className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
              {post.category}
            </span>
            <h3 className="text-base font-semibold text-white mt-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0 mt-1 group-hover:text-blue-400 transition-colors" />
        </div>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
          {post.excerpt || post.description || ''}
        </p>
        <div className="flex items-center gap-3 text-slate-500 text-xs mt-2">
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

interface BlogPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string; view?: string; show?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;
  const page = parseInt(params.page || '1') || 1;
  const view = params.view || 'list';
  const showAll = params.show === 'all' || !!search || !!category;
  
  const allPosts = getAllPosts({
    category: category,
    search: search,
  });
  
  const categories = getCategories();
  
  const { posts, totalPages } = getPostsPagination(page, POSTS_PER_PAGE, {
    category: category,
    search: search,
    skip: 0,
  });

  const categoryCounts = new Map<string, number>();
  const allPostsUnfiltered = getAllPosts();
  allPostsUnfiltered.forEach(p => {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
  });
  const smallCats: { name: string; count: number }[] = [];
  const mainCats: { name: string; count: number }[] = [];
  categoryCounts.forEach((count, name) => {
    const entry = { name, count };
    if (count >= 2 || CATEGORY_ICONS[name]) mainCats.push(entry);
    else smallCats.push(entry);
  });
  mainCats.sort((a, b) => b.count - a.count);
  if (smallCats.length > 0) mainCats.push({ name: 'Otros', count: smallCats.reduce((s, c) => s + c.count, 0) });

  const paginationLinks = (p: number, opts?: { resetCategory?: boolean; resetSearch?: boolean }) => {
    const qs = new URLSearchParams();
    if (category && !opts?.resetCategory) qs.set('category', category);
    if (search && !opts?.resetSearch) qs.set('search', search);
    if (view === 'grid') qs.set('view', 'grid');
    if (p > 1) qs.set('page', String(p));
    return `/blog${qs.toString() ? '?' + qs.toString() : ''}`;
  };

  const allLink = paginationLinks(1, { resetCategory: true, resetSearch: true });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              Blog OSINT
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">
              Análisis de Viajes y Seguridad
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Guías prácticas, análisis geopolíticos y tendencias basadas en datos OSINT para viajeros inteligentes.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <BlogSearch initialSearch={search || ''} category={category} view={view} />
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={allLink}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !category && !search
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}${view === 'grid' ? '&view=grid' : ''}`}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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

          {/* View Toggle */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <Link
                href={(() => {
                  const qs = new URLSearchParams();
                  if (category) qs.set('category', category);
                  if (search) qs.set('search', search);
                  return `/blog${qs.toString() ? '?' + qs.toString() : ''}`;
                })()}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  view === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </Link>
              <Link
                href={(() => {
                  const qs = new URLSearchParams();
                  if (category) qs.set('category', category);
                  if (search) qs.set('search', search);
                  qs.set('view', 'grid');
                  return `/blog?${qs.toString()}`;
                })()}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  view === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grid
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Category Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mainCats.map(({ name, count }) => {
              const isActive = category === name;
              const color = CATEGORY_COLORS[name] || 'from-slate-500/20 to-slate-600/10 border-slate-500/30';
              const icon = CATEGORY_ICONS[name] || '📌';
              return (
                <Link
                  key={name}
                  href={isActive ? allLink : `/blog?category=${encodeURIComponent(name)}`}
                  className={`bg-gradient-to-br ${color} rounded-xl border p-4 hover:scale-[1.02] transition-all duration-200 ${
                    isActive ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : ''
                  }`}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-white text-sm font-medium truncate">{name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{count} artículo{count !== 1 ? 's' : ''}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {search ? `Resultados para "${search}"` : category ? category : 'Todos los artículos'}
            <span className="text-slate-500 text-sm font-normal">
              ({allPosts.length} artículo{allPosts.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <span className="text-slate-500 text-sm">
            Página {page} de {totalPages}
          </span>
        </div>
        
        {posts.length > 0 ? (
          <>
            {!showAll && posts.length > 3 && (
              <div className="flex flex-col gap-3 mb-3">
                {posts.slice(0, 3).map((post) => (
                  <PostListItem key={post.slug} post={post} />
                ))}
              </div>
            )}
            {!showAll && posts.length > 3 ? (
              <div className="text-center py-8">
                <Link
                  href="/blog?show=all"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                  Mostrar todos ({allPosts.length} artículos)
                </Link>
              </div>
            ) : (
              <>
                {view === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {posts.map((post) => (
                      <PostListItem key={post.slug} post={post} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <Link
                        href={paginationLinks(page - 1)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-blue-500/30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={paginationLinks(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500/30'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link
                        href={paginationLinks(page + 1)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-blue-500/30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </>
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
      </main>
    </div>
  );
}
