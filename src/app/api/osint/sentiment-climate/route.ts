import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('SentimentClimate');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country');
  if (!country) return NextResponse.json({ error: 'country param required' }, { status: 400 });

  if (!supabase) return NextResponse.json({ avgTone: null, signals: 0 });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('osint_signals')
    .select('tone_score, created_at, location_name, summary')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('tone_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    log.error('Error fetching sentiment data', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const relevant = (data || []).filter(s => {
    const text = `${s.location_name || ''} ${s.summary || ''}`.toLowerCase();
    return text.includes(country.toLowerCase());
  });

  if (relevant.length === 0) {
    return NextResponse.json({ avgTone: null, signals: 0, country });
  }

  const sum = relevant.reduce((acc, s) => acc + (s.tone_score || 0), 0);
  const avgTone = Math.round((sum / relevant.length) * 10) / 10;

  return NextResponse.json({
    avgTone,
    signals: relevant.length,
    mood: avgTone > 3 ? 'positive' : avgTone < -3 ? 'negative' : 'neutral',
    country,
  });
}
