import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: 'tripId required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: ratings, error: ratingsError } = await supabase
    .from('trip_ratings')
    .select('rating')
    .eq('trip_id', tripId);

  if (ratingsError) {
    return NextResponse.json({ error: ratingsError.message }, { status: 500 });
  }

  const count = ratings?.length || 0;
  const avg = count > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / count : 0;

  // Get current user's rating if logged in
  const { data: { user } } = await supabase.auth.getUser();
  let userRating = null;
  if (user) {
    const { data: userR } = await supabase
      .from('trip_ratings')
      .select('rating')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();
    userRating = userR?.rating || null;
  }

  return NextResponse.json({
    tripId,
    avg: Math.round(avg * 10) / 10,
    count,
    userRating,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { tripId, rating } = body;

  if (!tripId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid tripId or rating (1-5)' }, { status: 400 });
  }

  // Upsert: insert or update user's rating
  const { error } = await supabase
    .from('trip_ratings')
    .upsert(
      { trip_id: tripId, user_id: user.id, rating, updated_at: new Date().toISOString() },
      { onConflict: 'trip_id,user_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, rating });
}
