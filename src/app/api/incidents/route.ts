import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const country = searchParams.get('country');
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!supabase) {
    return NextResponse.json({ incidents: [], source: 'No database' });
  }

  let query = supabase
    .from('incidents')
    .select('*')
    .eq('is_active', true)
    .order('severity', { ascending: false })
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('type', type);
  if (country) query = query.eq('country_code', country);
  if (severity) query = query.eq('severity', severity);

  const { data: incidents, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const withRatings = await Promise.all(
    (incidents || []).map(async (inc) => {
      const { data: ratings } = await supabase
        .from('incident_ratings')
        .select('rating')
        .eq('incident_id', inc.id);

      const avg = ratings && ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
        : 0;

      return { ...inc, rating: avg, ratingCount: ratings?.length || 0 };
    })
  );

  return NextResponse.json({
    incidents: withRatings,
    total: withRatings.length,
    timestamp: new Date().toISOString(),
  });
}
