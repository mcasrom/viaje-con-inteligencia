import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: allRatings } = await supabaseAdmin
    .from('post_ratings')
    .select('rating, user_id')
    .eq('slug', slug);

  let average = 0;
  let count = 0;
  let userRating = 0;

  if (allRatings && allRatings.length > 0) {
    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    average = Math.round((total / allRatings.length) * 10) / 10;
    count = allRatings.length;
    const mine = allRatings.find(r => r.user_id === user?.id);
    if (mine) userRating = mine.rating;
  }

  return NextResponse.json({ slug, average, count, userRating });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, rating } = body;

  if (!slug || !rating) {
    return NextResponse.json({ error: 'Slug and rating required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión para valorar' }, { status: 401 });
  }

  const { data: existing } = await supabaseAdmin
    .from('post_ratings')
    .select('id')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('post_ratings')
      .update({ rating })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('post_ratings')
      .insert({ slug, rating, user_id: user.id });
  }

  return NextResponse.json({ success: true });
}
