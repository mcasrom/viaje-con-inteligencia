import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const ratings: Record<string, { total: number; count: number }> = {};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const rating = ratings[slug] || { total: 0, count: 0 };
  const average = rating.count > 0 ? Math.round((rating.total / rating.count) * 10) / 10 : 0;

  return NextResponse.json({
    slug,
    average,
    count: rating.count,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, rating } = body;

  if (!slug || !rating) {
    return NextResponse.json({ error: 'Slug and rating required' }, { status: 400 });
  }

  if (!ratings[slug]) {
    ratings[slug] = { total: 0, count: 0 };
  }

  ratings[slug].total += rating;
  ratings[slug].count += 1;

  return NextResponse.json({ success: true });
}