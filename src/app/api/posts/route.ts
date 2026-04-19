import { NextRequest, NextResponse } from 'next/server';
import { getPostsPagination, getCategories } from '@/lib/posts';

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

  return NextResponse.json({
    posts,
    totalPages,
    currentPage: page,
  });
}