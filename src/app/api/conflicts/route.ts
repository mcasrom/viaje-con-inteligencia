import { NextResponse } from 'next/server';

const FALLBACK_CONFLICTS = [
  {
    id: '1',
    title: 'Tensiones en Oriente Medio: Situación humanitaria crítica en Gaza - Estados Unidos y aliados discuten nuevas propuestas de cessfire',
    url: 'https://news.google.com/rss/search?q=middle+east+conflict',
    domain: 'news.google.com',
    date: '2026-04-21T10:00:00Z',
    country: 'Oriente Medio',
    impact: 'alto',
  },
  {
    id: '2',
    title: 'Guerra en Ucrania: Continúan los combates en el frente oriental - Negociaciones de paz en punto muerto',
    url: 'https://news.google.com/rss/search?q=ukraine+war',
    domain: 'news.google.com',
    date: '2026-04-21T08:00:00Z',
    country: 'Ucrania',
    impact: 'alto',
  },
  {
    id: '3',
    title: 'Elecciones en Francia: Manifestaciones anticipate sobre reformas laborales',
    url: 'https://news.google.com/rss/search?q=france+protests',
    domain: 'news.google.com',
    date: '2026-04-20T15:00:00Z',
    country: 'Francia',
    impact: 'medio',
  },
  {
    id: '4',
    title: 'Inestabilidad en Sudán: Crisis humanitaria se agrava - Conflictos étnicos continúan',
    url: 'https://news.google.com/rss/search?q=sudan+conflict',
    domain: 'news.google.com',
    date: '2026-04-20T12:00:00Z',
    country: 'Sudán',
    impact: 'alto',
  },
  {
    id: '5',
    title: 'Tensiones en Venezuela: Situación económica genera protestas',
    url: 'https://news.google.com/rss/search?q=venezuela+crisis',
    domain: 'news.google.com',
    date: '2026-04-19T18:00:00Z',
    country: 'Venezuela',
    impact: 'medio',
  },
  {
    id: '6',
    title: 'Colombia: FARC disidentes perpetúan ataques en zonas rurales',
    url: 'https://news.google.com/rss/search?q=colombia+conflict',
    domain: 'news.google.com',
    date: '2026-04-19T10:00:00Z',
    country: 'Colombia',
    impact: 'medio',
  },
  {
    id: '7',
    title: 'Myanmar: Conflicto civil continúa tras golpe de estado - Situación humanitaria crítica',
    url: 'https://news.google.com/rss/search?q=myanmar+conflict',
    domain: 'news.google.com',
    date: '2026-04-18T20:00:00Z',
    country: 'Myanmar',
    impact: 'alto',
  },
  {
    id: '8',
    title: 'Manifestaciones en Israel: Protestas por situación en Gaza afectan ciudades principales',
    url: 'https://news.google.com/rss/search?q=israel+protests',
    domain: 'news.google.com',
    date: '2026-04-18T14:00:00Z',
    country: 'Israel',
    impact: 'medio',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '15');
  const useFallback = searchParams.get('fallback') === 'true';

  const url = `https://newsmcp.io/v1/news/?topics=politics,military&per_page=${limit}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'ViajeConInteligencia/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    const conflicts = (data.events || data.articles || []).map((event: any) => ({
      id: event.id || event.url,
      title: (event.summary || event.title || '').substring(0, 150),
      url: event.entries?.[0]?.url || event.url || '#',
      domain: event.entries?.[0]?.domain || 'news',
      date: event.last_seen_at || event.published_at || new Date().toISOString(),
      country: event.geo?.[0] || 'global',
      impact: event.impact_score || 'medio',
    }));

    return NextResponse.json({
      count: conflicts.length,
      conflicts,
      source: 'NewsMCP',
      updated: new Date().toISOString(),
      status: 'live',
    });
  } catch (error: any) {
    console.error('Conflicts API error:', error.message || error);
    
    const fallbackData = FALLBACK_CONFLICTS.slice(0, limit);
    const lastUpdate = fallbackData[0]?.date;
    
    return NextResponse.json({
      count: fallbackData.length,
      conflicts: fallbackData,
      source: 'Fallback - NewsMCP no disponible',
      updated: lastUpdate,
      status: 'fallback',
      error: 'API externa no disponible. Mostrando últimos datos disponibles.',
      lastRealUpdate: lastUpdate,
    });
  }
}
