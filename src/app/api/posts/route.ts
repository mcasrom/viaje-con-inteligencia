import { NextRequest, NextResponse } from 'next/server';
import { getPostsPagination, getCategories } from '@/lib/posts';
import { supabase } from '@/lib/supabase';
import { isSupabaseAdminConfigured } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const INFOGRAFIA_CATEGORY = 'Infografía';

async function fetchInfografiasAsPosts(page: number, perPage: number) {
  if (!isSupabaseAdminConfigured()) return [];
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data } = await supabase
    .from('infografias')
    .select('*')
    .eq('is_published', true)
    .order('week_start', { ascending: false })
    .range(from, to);

  return (data || []).map((inf: any) => ({
    slug: `infografia-${inf.id}`,
    title: inf.title,
    date: inf.week_start,
    author: 'Viaje con Inteligencia',
    category: INFOGRAFIA_CATEGORY,
    readTime: '3 min',
    image: inf.image_url || '/og-infografias.png',
    keywords: [...(inf.top_risk_countries || []).map((c: string) => c.toLowerCase()), 'infografía semanal', 'riesgo global', 'GWI'],
    excerpt: `Edición #${inf.edition} — GWI: ${inf.gwi_score?.toFixed(1) || '—'}. ${inf.country_count || 111} países monitoreados.`,
    description: `Infografía semanal de riesgos globales. GWI: ${inf.gwi_score?.toFixed(1) || '—'}. Semana del ${inf.week_start}.`,
    tags: ['infografía', 'riesgo global', 'GWI', `edición-${inf.edition}`],
    featured: false,
    isInfografia: true,
    infografiaId: inf.id,
    gwi_score: inf.gwi_score,
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '20');
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'recent';
  const search = searchParams.get('search') || undefined;

  // Merge infografias when requesting "all" or "Infografía" category
  const includeInfografias = !category || category === 'all' || category === INFOGRAFIA_CATEGORY;

  if (sort === 'popular') {
    const { posts, totalPages } = getPostsPagination(page, perPage, { category, sort: 'recent', skip: 0 });

    let postsWithViews: any[] = posts.map((post: any) => ({ ...post, views: 0 }));

    if (supabase) {
      const { data } = await supabase.from('post_views').select('slug, views').order('views', { ascending: false });
      const viewsMap: Record<string, number> = {};
      data?.forEach((row: any) => { viewsMap[row.slug] = row.views; });
      postsWithViews = posts.map((post: any) => ({
        ...post,
        views: viewsMap[post.slug] || 0,
      })).sort((a, b) => b.views - a.views);
    }

    let result = postsWithViews;
    if (includeInfografias) {
      const infografias = await fetchInfografiasAsPosts(page, perPage);
      result = [...infografias, ...postsWithViews];
    }

    return NextResponse.json({
      posts: result,
      totalPages,
      currentPage: page,
    });
  }

  const filter = category && category !== 'all' && category !== INFOGRAFIA_CATEGORY
    ? { category, sort: sort as 'recent' | 'oldest', search, skip: 0 }
    : { sort: sort as 'recent' | 'oldest', search, skip: 0 };

  const { posts, totalPages } = getPostsPagination(page, perPage, filter);

  let postsWithViews = posts.map((post: any) => ({ ...post, views: 0 }));

  if (supabase) {
    try {
      const t = new Promise<null>(r => setTimeout(() => r(null), 3000));
      const q = supabase.from('post_views').select('slug, views');
      const res = await Promise.race([q, t]) as any;
      if (res?.data) {
        const m: Record<string, number> = {};
        res.data.forEach((r: any) => { m[r.slug] = r.views; });
        postsWithViews = posts.map((p: any) => ({ ...p, views: m[p.slug] || 0 }));
      }
    } catch {}
  }

  let result = postsWithViews;
  if (includeInfografias) {
    const infografias = await fetchInfografiasAsPosts(page, 8);
    result = [...infografias, ...postsWithViews];
  }

  return NextResponse.json({
    posts: result,
    totalPages,
    currentPage: page,
  });
}
