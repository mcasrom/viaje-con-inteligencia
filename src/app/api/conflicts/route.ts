import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '15';

  const url = `https://newsmcp.io/v1/news/?topics=politics,military&per_page=${limit}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`NewsMCP API error: ${response.status}`);
    }

    const data = await response.json();

    const conflicts = (data.events || []).map((event: any) => ({
      id: event.id,
      title: event.summary?.substring(0, 150) + (event.summary?.length > 150 ? '...' : ''),
      url: event.entries?.[0]?.url || '#',
      domain: event.entries?.[0]?.domain || 'news',
      date: event.last_seen_at,
      country: event.geo?.[0] || 'global',
      impact: event.impact_score,
    }));

    return NextResponse.json({
      count: conflicts.length,
      conflicts,
      source: 'NewsMCP',
      updated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Conflicts API error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conflict data' },
      { status: 500 }
    );
  }
}