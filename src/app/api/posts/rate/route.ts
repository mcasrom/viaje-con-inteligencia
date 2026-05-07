import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ average: 0, count: 0 });
  }

  const { data } = await supabase
    .from('post_ratings')
    .select('rating')
    .eq('slug', slug);

  if (!data || data.length === 0) {
    return NextResponse.json({ slug, average: 0, count: 0 });
  }

  const total = data.reduce((sum, r) => sum + r.rating, 0);
  const average = Math.round((total / data.length) * 10) / 10;

  return NextResponse.json({ slug, average, count: data.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, rating } = body;

  if (!slug || !rating) {
    return NextResponse.json({ error: 'Slug and rating required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from('post_ratings')
    .select('id, rating')
    .eq('slug', slug)
    .eq('user_ip', request.headers.get('x-forwarded-for') || 'unknown')
    .single();

  if (existing) {
    await supabase
      .from('post_ratings')
      .update({ rating, created_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('post_ratings')
      .insert({ 
        slug, 
        rating, 
        user_ip: request.headers.get('x-forwarded-for') || 'unknown' 
      });
  }

  return NextResponse.json({ success: true });
}
