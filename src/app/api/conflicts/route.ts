import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maxrecords = searchParams.get('maxrecords') || '20';

  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=VIOLENT%20OR%20CONFLICT%20OR%20WAR%20OR%20CLASH&mode=artlist&maxrecords=${maxrecords}&format=json&sort=DateDesc`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }

    const data = await response.json();

    const conflicts = (data.articles || []).map((article: any) => ({
      id: article.seen_id || Math.random().toString(36),
      title: article.title,
      url: article.url,
      domain: article.domain,
      date: article.seendate,
      country: article.country,
      language: article.language,
    }));

    return NextResponse.json({
      count: conflicts.length,
      conflicts,
      source: 'GDELT',
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