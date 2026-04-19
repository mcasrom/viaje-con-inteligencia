import { NextRequest, NextResponse } from 'next/server';
import { getPostsPagination, getCategories } from '@/lib/posts';
import fs from 'fs';
import path from 'path';

const VIEWS_FILE = path.join(process.cwd(), 'data', 'views.json');

function loadViews(): Record<string, number> {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      return JSON.parse(fs.readFileSync(VIEWS_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

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
  const views = loadViews();

  const postsWithViews = posts.map((post: any) => ({
    ...post,
    views: views[post.slug] || 0,
  }));

  return NextResponse.json({
    posts: postsWithViews,
    totalPages,
    currentPage: page,
  });
}