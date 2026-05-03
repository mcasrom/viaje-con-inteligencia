import { Suspense } from 'react';
import { getPostsPagination, getCategories, PostMeta } from '@/lib/posts';
import BlogClient from '@/components/BlogClient';

export const revalidate = 3600; // ISR: regenera cada hora

export const metadata = {
  title: 'Blog de Viajes - Consejos, Guías y Seguridad | Viaje con Inteligencia',
  description: 'Artículos para viajar smarter: consejos prácticos, guías de destinos, análisis de riesgos y planificación de viajes con seguridad.',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; sort?: string; tab?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const category = params.category || 'all';
  const sort = params.sort || 'recent';
  const tab = params.tab || 'recientes';
  const search = params.search || '';

  const { posts, totalPages, currentPage, featuredPosts } = getPostsPagination(page, 50, {
    skip: 2,
    category: category !== 'all' ? category : undefined,
    sort: tab === 'populares' ? 'recent' : sort as 'recent' | 'oldest',
    search: search.length >= 2 ? search : undefined,
  });

  const categories = getCategories();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <BlogClient
        initialPosts={posts}
        initialCategories={categories}
        initialTotalPages={totalPages}
        initialPage={currentPage}
        initialCategory={category}
        initialSort={sort}
        initialTab={tab}
        initialSearch={search}
        initialFeaturedPosts={featuredPosts}
      />
    </Suspense>
  );
}
