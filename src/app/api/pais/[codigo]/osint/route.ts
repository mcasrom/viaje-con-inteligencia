import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { getCountryName } from '@/lib/country-name-map';

export const dynamic = 'force-dynamic';
const log = createLogger('PaisOsint');

const EN_NAMES: Record<string, string> = {
  cn: 'china', es: 'spain', fr: 'france', de: 'germany', it: 'italy', pt: 'portugal',
  gb: 'uk', ie: 'ireland', nl: 'netherlands', ch: 'switzerland', gr: 'greece',
  us: 'usa', ca: 'canada', mx: 'mexico', ar: 'argentina', br: 'brazil', co: 'colombia',
  pe: 'peru', cl: 'chile', ve: 'venezuela', jp: 'japan', kr: 'korea', ru: 'russia',
  in: 'india', tr: 'turkey', th: 'thailand', vn: 'vietnam', id: 'indonesia',
  eg: 'egypt', ma: 'morocco', za: 'south africa', ng: 'nigeria', il: 'israel',
  ae: 'uae', sa: 'saudi arabia', ir: 'iran', iq: 'iraq', sy: 'syria',
  au: 'australia', nz: 'new zealand', sg: 'singapore', my: 'malaysia',
  ua: 'ukraine', pl: 'poland', se: 'sweden', no: 'norway', dk: 'denmark',
  fi: 'finland', cz: 'czech', hu: 'hungary', ro: 'romania', at: 'austria',
  be: 'belgium', is: 'iceland',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  if (!supabase) return NextResponse.json({ signals: [] });

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const days = parseInt(searchParams.get('days') || '14');
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const name = getCountryName(codigo) || '';
  const enName = EN_NAMES[codigo] || '';
  const terms = [name, enName].filter(Boolean);
  if (terms.length === 0) return NextResponse.json({ signals: [], count: 0 });
  const filters = terms.map(t => `title.ilike.%${t}%,summary.ilike.%${t}%,location_name.ilike.%${t}%`).join(',');

  const { data: signals, error } = await supabase
    .from('osint_signals')
    .select('id, source, source_url, title, content, category, urgency, summary, tone_score, confidence, location_name, created_at, post_timestamp')
    .gte('created_at', cutoff)
    .or(filters)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    log.error('Error fetching OSINT signals', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduplicar por source_url para evitar noticias repetidas
  const seen = new Set<string>();
  const deduped = (signals || []).filter(s => {
    const key = s.source_url || s.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const enriched = deduped.map(s => ({
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
  const ts = new Date(dateStr).getTime();
  if (isNaN(ts)) return 'Fecha desconocida';
  const diff = Date.now() - ts;
  if (diff < 0) return 'Recién actualizado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
