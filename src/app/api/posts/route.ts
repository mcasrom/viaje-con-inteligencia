import { NextRequest, NextResponse } from 'next/server';
import { getPostsPagination, getCategories } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '20');
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'recent';

  if (sort === 'popular') {
    const { posts, totalPages } = getPostsPagination(page, perPage, { category, sort: 'recent' });
    
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

    return NextResponse.json({
      posts: postsWithViews,
      totalPages,
      currentPage: page,
    });
  }

  const filter = category && category !== 'all' 
    ? { category, sort: sort as 'recent' | 'oldest' }
    : { sort: sort as 'recent' | 'oldest' };

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

  return NextResponse.json({
    posts: postsWithViews,
    totalPages,
    currentPage: page,
  });
}