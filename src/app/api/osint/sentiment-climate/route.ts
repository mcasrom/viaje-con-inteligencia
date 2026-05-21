import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('SentimentClimate');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country');
  const code = request.nextUrl.searchParams.get('code');
  if (!country) return NextResponse.json({ error: 'country param required' }, { status: 400 });

  if (!supabase) return NextResponse.json({ avgTone: null, signals: 0, country, code });

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 14);
  const threeHalfDaysAgo = new Date();
  threeHalfDaysAgo.setDate(threeHalfDaysAgo.getDate() - 3);

  // Phase 1: search by full country name (most accurate)
  let data = await querySignals(country, daysAgo);

  // Phase 2: if no results and code is available, broaden search with code
  if ((!data || data.length === 0) && code) {
    data = await querySignals(` ${code} `, daysAgo);
  }

  const relevant = (data || []).filter(s => {
    const text = `${s.title || ''} ${s.summary || ''} ${s.location_name || ''} ${s.content || ''}`.toLowerCase();
    const countryLower = country.toLowerCase();
    if (text.includes(countryLower)) return true;
    const words = countryLower.split(/\s+/);
    return words.some(w => w.length > 3 && text.includes(w));
  });

  if (relevant.length === 0) {
    return NextResponse.json({ avgTone: null, signals: 0, country, code });
  }

  const valid = relevant.filter(s => s.tone_score != null && !isNaN(Number(s.tone_score)));
  if (valid.length === 0) {
    return NextResponse.json({ avgTone: null, signals: 0, country, code });
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
    code,
  });
}

async function querySignals(searchTerm: string, since: Date) {
  const { data, error } = await supabase!
    .from('osint_signals')
    .select('tone_score, created_at, location_name, summary, title, content')
    .gte('created_at', since.toISOString())
    .not('tone_score', 'is', null)
    .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,location_name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    log.error('Error fetching sentiment data', error);
    return [];
  }
  return data || [];
}
