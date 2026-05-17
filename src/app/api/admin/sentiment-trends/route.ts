import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { extractCountryCodes, getCountryName } from '@/lib/country-name-map';

export const dynamic = 'force-dynamic';
const log = createLogger('SentimentTrends');

export async function GET() {
  if (!supabase) return NextResponse.json({ trends: [] });

  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const { data: signals } = await supabase
    .from('osint_signals')
    .select('tone_score, location_name, summary, created_at')
    .gte('created_at', lastWeek.toISOString())
    .not('tone_score', 'is', null)
    .limit(3000);

  if (!signals) return NextResponse.json({ trends: [] });

  const byCountry = new Map<string, { current: number[]; previous: number[] }>();

  for (const s of signals) {
    if (s.tone_score == null) continue;
    const text = `${s.location_name || ''} ${s.summary || ''}`;
    const codes = extractCountryCodes(text);
    const isCurrent = new Date(s.created_at) >= thisWeek;
    for (const code of codes) {
      if (!byCountry.has(code)) byCountry.set(code, { current: [], previous: [] });
      const entry = byCountry.get(code)!;
      if (isCurrent) entry.current.push(s.tone_score);
      else entry.previous.push(s.tone_score);
    }
  }

  const trends: Array<{
    countryCode: string;
    countryName: string;
    currentAvg: number | null;
    previousAvg: number | null;
    delta: number | null;
    currentSignals: number;
    previousSignals: number;
    direction: 'up' | 'down' | 'stable' | null;
  }> = [];

  for (const [code, data] of byCountry) {
    if (data.current.length < 2 && data.previous.length < 2) continue;
    const currentAvg = data.current.length > 0
      ? Math.round((data.current.reduce((a, b) => a + b, 0) / data.current.length) * 10) / 10
      : null;
    const previousAvg = data.previous.length > 0
      ? Math.round((data.previous.reduce((a, b) => a + b, 0) / data.previous.length) * 10) / 10
      : null;
    let delta: number | null = null;
    let direction: 'up' | 'down' | 'stable' | null = null;
    if (currentAvg != null && previousAvg != null) {
      delta = Math.round((currentAvg - previousAvg) * 10) / 10;
      direction = delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'stable';
    }

    trends.push({
      countryCode: code,
      countryName: getCountryName(code) || code.toUpperCase(),
      currentAvg, previousAvg, delta, direction,
      currentSignals: data.current.length,
      previousSignals: data.previous.length,
    });
  }

  trends.sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));

  return NextResponse.json({
    trends,
    summary: {
      totalTracked: trends.length,
      improving: trends.filter(t => t.direction === 'up').length,
      worsening: trends.filter(t => t.direction === 'down').length,
      stable: trends.filter(t => t.direction === 'stable').length,
    },
    timestamp: now.toISOString(),
  });
}
