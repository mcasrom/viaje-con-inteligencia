import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiError } from '@/lib/api-schemas';
import { createLogger } from '@/lib/logger';

const log = createLogger('Posts');

const getQuerySchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

const postBodySchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  rating: z.number().int().min(1).max(5),
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  const parsed = getQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    log.error('GET /posts/rate validation failed', parsed.error.format());
    return apiError('Parámetros inválidos');
  }

  const { slug } = parsed.data;

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

  log.info(`GET /posts/rate - slug: ${slug}, count: ${count}, average: ${average}`);

  return NextResponse.json({ slug, average, count, userRating });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = postBodySchema.safeParse(body);
  if (!parsed.success) {
    log.error('POST /posts/rate validation failed', parsed.error.format());
    return apiError('Datos inválidos');
  }

  const { slug, rating } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    log.error('POST /posts/rate - unauthorized');
    return apiError('Debes iniciar sesión para valorar', undefined, 401);
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

  const { data: allRatings } = await supabaseAdmin
    .from('post_ratings')
    .select('rating, user_id')
    .eq('slug', slug);

  let average = 0;
  let count = 0;

  if (allRatings && allRatings.length > 0) {
    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    average = Math.round((total / allRatings.length) * 10) / 10;
    count = allRatings.length;
  }

  log.info(`POST /posts/rate - slug: ${slug}, rating: ${rating}, user: ${user.id}`);

  return NextResponse.json({ success: true, average, count, userRating: rating });
}
