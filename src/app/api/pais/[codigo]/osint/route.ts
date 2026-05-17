import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
const log = createLogger('PaisOsint');

export async function GET(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  if (!supabase) return NextResponse.json({ signals: [] });

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const days = parseInt(searchParams.get('days') || '14');
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: signals, error } = await supabase
    .from('osint_signals')
    .select('id, source, source_url, title, content, category, urgency, summary, tone_score, confidence, location_name, created_at, post_timestamp')
    .gte('created_at', cutoff)
    .or(`location_name.ilike.%${codigo}%,summary.ilike.%${codigo}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    log.error('Error fetching OSINT signals', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = (signals || []).map(s => ({
    ...s,
    sourceIcon: sourceIcon(s.source),
    timeAgo: timeAgo(s.created_at),
  }));

  return NextResponse.json({ signals: enriched, count: enriched.length });
}

function sourceIcon(source: string): string {
  const icons: Record<string, string> = {
    reddit: '🤖', gdelt: '📡', rss: '📰',
    gdacs: '⚠️', usgs: '🌍',
  };
  return icons[source] || '📡';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
