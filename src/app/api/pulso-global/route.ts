import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { detectHeatmap } from '@/lib/trend-detector';
import { extractCountryCodes, getCountryName } from '@/lib/country-name-map';
import rawData from '@/data/paises-data.json';

export const dynamic = 'force-dynamic';

const log = createLogger('PulsoGlobal');

const paises = (rawData as any).paisesData as Record<string, any>;
const coordCache = new Map<string, [number, number]>();
for (const [code, info] of Object.entries(paises)) {
  if (info.mapaCoordenadas) {
    coordCache.set(code, info.mapaCoordenadas as [number, number]);
  }
}

interface CountrySentiment {
  countryCode: string;
  countryName: string;
  coordinates: [number, number] | null;
  avgTone: number | null;
  signals: number;
  positive: number;
  negative: number;
  neutral: number;
  mood: 'positive' | 'negative' | 'neutral' | null;
  pinned: boolean;
}

const PINNED_COUNTRIES = ['ir', 'il', 'ru', 'ua', 've', 'lb', 'mm', 'af', 'sd', 'ye'];

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      sentimentRanking: [],
      heatmapAlerts: [],
      topDrops: [],
      summary: { totalSignals: 0, countriesTracked: 0, criticalAlerts: 0 },
      timestamp: new Date().toISOString(),
    });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const { data: signals, error } = await supabase
    .from('osint_signals')
    .select('tone_score, location_name, summary, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    log.error('Error fetching signals', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countryData = new Map<string, {
    tones: number[];
    recentTones: number[];  // last 3 days for delta
    olderTones: number[];   // 3-7 days ago
    signals: number;
    positive: number;
    negative: number;
    neutral: number;
  }>();

  for (const s of signals || []) {
    const text = `${s.location_name || ''} ${s.summary || ''}`;
    const codes = extractCountryCodes(text);
    if (codes.length === 0) continue;

    for (const code of codes) {
      if (!countryData.has(code)) {
        countryData.set(code, { tones: [], recentTones: [], olderTones: [], signals: 0, positive: 0, negative: 0, neutral: 0 });
      }
      const entry = countryData.get(code)!;
      entry.signals++;
      if (s.tone_score != null) {
        entry.tones.push(s.tone_score);
        if (new Date(s.created_at) >= threeDaysAgo) {
          entry.recentTones.push(s.tone_score);
        } else {
          entry.olderTones.push(s.tone_score);
        }
        if (s.tone_score > 3) entry.positive++;
        else if (s.tone_score < -3) entry.negative++;
        else entry.neutral++;
      }
    }
  }

  const sentimentRanking: CountrySentiment[] = [];
  const seenCodes = new Set<string>();
  for (const [code, data] of countryData) {
    if (data.signals < 2) continue;
    seenCodes.add(code);
    const avgTone = data.tones.length > 0
      ? Math.round((data.tones.reduce((a, b) => a + b, 0) / data.tones.length) * 10) / 10
      : null;
    const mood = avgTone == null ? null : avgTone > 3 ? 'positive' : avgTone < -3 ? 'negative' : 'neutral';
    sentimentRanking.push({
      countryCode: code,
      countryName: getCountryName(code) || code.toUpperCase(),
      coordinates: coordCache.get(code) ?? null,
      avgTone, signals: data.signals,
      positive: data.positive, negative: data.negative, neutral: data.neutral,
      mood, pinned: false,
    });
  }

  for (const code of PINNED_COUNTRIES) {
    if (!seenCodes.has(code) && getCountryName(code)) {
      sentimentRanking.push({
        countryCode: code,
        countryName: getCountryName(code) || code.toUpperCase(),
        coordinates: coordCache.get(code) ?? null,
        avgTone: null, signals: 0, positive: 0, negative: 0, neutral: 0,
        mood: null, pinned: true,
      });
    }
  }

  sentimentRanking.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? 1 : -1;
    return (b.avgTone ?? -999) - (a.avgTone ?? -999);
  });

  const topDrops: Array<{ countryCode: string; countryName: string; coordinates: [number, number] | null; drop: number; recentAvg: number; olderAvg: number }> = [];
  for (const [code, data] of countryData) {
    if (data.recentTones.length < 2 || data.olderTones.length < 2) continue;
    const recentAvg = data.recentTones.reduce((a, b) => a + b, 0) / data.recentTones.length;
    const olderAvg = data.olderTones.reduce((a, b) => a + b, 0) / data.olderTones.length;
    const drop = Math.round((olderAvg - recentAvg) * 10) / 10;
    if (drop > 1) {
      topDrops.push({
        countryCode: code,
        countryName: getCountryName(code) || code.toUpperCase(),
        coordinates: coordCache.get(code) ?? null,
        drop,
        recentAvg: Math.round(recentAvg * 10) / 10,
        olderAvg: Math.round(olderAvg * 10) / 10,
      });
    }
  }
  topDrops.sort((a, b) => b.drop - a.drop);

  let heatmapAlerts: any[] = [];
  try {
    const { getCountryCode: nameToCode } = await import('@/lib/country-name-map');
    heatmapAlerts = (await detectHeatmap()).map(h => {
      const code = nameToCode(h.country);
      return {
        country: h.country,
        countryCode: code ?? undefined,
        coordinates: code ? (coordCache.get(code) ?? null) : null,
        level: h.level,
        label: h.label,
        signals24h: h.signals24h,
        spike: h.spike,
        reasons: h.reasons,
        keywords: h.keywords,
      };
    });
  } catch (e) {
    log.error('Heatmap error', e);
  }

  return NextResponse.json({
    sentimentRanking,
    heatmapAlerts,
    topDrops: topDrops.slice(0, 10),
    summary: {
      totalSignals: signals?.length || 0,
      countriesTracked: sentimentRanking.length,
      criticalAlerts: heatmapAlerts.filter(h => h.level === 3).length,
    },
    timestamp: new Date().toISOString(),
  });
}
