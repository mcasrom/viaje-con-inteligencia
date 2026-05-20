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
  const threeHalfDaysAgo = new Date();
  threeHalfDaysAgo.setDate(threeHalfDaysAgo.getDate() - 3);

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
    const match = text.includes(country.toLowerCase());
    if (!match && s.summary) {
      const words = country.toLowerCase().split(/\s+/);
      return words.some(w => w.length > 3 && text.includes(w));
    }
    return match;
  });

  if (relevant.length === 0) {
    return NextResponse.json({ avgTone: null, signals: 0, country });
  }

  const valid = relevant.filter(s => s.tone_score != null && !isNaN(Number(s.tone_score)));
  if (valid.length === 0) {
    return NextResponse.json({ avgTone: null, signals: 0, country });
  }

  const sum = valid.reduce((acc, s) => acc + Number(s.tone_score), 0);
  const avgTone = Math.round((sum / valid.length) * 10) / 10;

  const recent = valid.filter(s => new Date(s.created_at) >= threeHalfDaysAgo);
  const older = valid.filter(s => new Date(s.created_at) < threeHalfDaysAgo);
  let toneTrend7d: number | null = null;
  if (recent.length >= 2 && older.length >= 2) {
    const avgRecent = recent.reduce((a, s) => a + Number(s.tone_score), 0) / recent.length;
    const avgOlder = older.reduce((a, s) => a + Number(s.tone_score), 0) / older.length;
    toneTrend7d = Math.round((avgRecent - avgOlder) * 100) / 100;
  }

  return NextResponse.json({
    avgTone,
    signals: valid.length,
    toneTrend7d,
    mood: avgTone > 3 ? 'positive' : avgTone < -3 ? 'negative' : 'neutral',
    country,
  });
}
