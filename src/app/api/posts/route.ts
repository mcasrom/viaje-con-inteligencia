import { NextRequest, NextResponse } from 'next/server';
import { getPostsPagination, getCategories } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '10');
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'recent';

  const filter = category && category !== 'all' 
    ? { category, sort: sort as 'recent' | 'oldest' }
    : { sort: sort as 'recent' | 'oldest' };

  const { posts, totalPages } = getPostsPagination(page, perPage, filter);
  
  let postsWithViews = posts.map((post: any) => ({ ...post, views: 0 }));
  
  if (supabase) {
    const { data } = await supabase.from('post_views').select('slug, views');
    const viewsMap: Record<string, number> = {};
    data?.forEach((row: any) => { viewsMap[row.slug] = row.views; });
    postsWithViews = posts.map((post: any) => ({
      ...post,
      views: viewsMap[post.slug] || 0,
    }));
  }

  return NextResponse.json({
    posts: postsWithViews,
    totalPages,
    currentPage: page,
  });
}