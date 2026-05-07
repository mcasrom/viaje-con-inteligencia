import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('type');
  const entityId = searchParams.get('id');

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'type and id required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ average: 0, count: 0 });
  }

  const { data: ratings } = await supabase
    .from('data_ratings')
    .select('rating')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (!ratings || ratings.length === 0) {
    return NextResponse.json({ entityType, entityId, average: 0, count: 0 });
  }

  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const average = Math.round((total / ratings.length) * 10) / 10;

  return NextResponse.json({ entityType, entityId, average, count: ratings.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { entityType, entityId, rating, comment } = body;

  if (!entityType || !entityId || !rating) {
    return NextResponse.json({ error: 'entityType, entityId, and rating required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const userIp = request.headers.get('x-forwarded-for') || 'unknown';

  const { data: existing } = await supabase
    .from('data_ratings')
    .select('id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_ip', userIp)
    .single();

  if (existing) {
    await supabase
      .from('data_ratings')
      .update({ rating, comment, created_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('data_ratings')
      .insert({ entityType, entityId, rating, comment, user_ip: userIp });
  }

  return NextResponse.json({ success: true });
}
