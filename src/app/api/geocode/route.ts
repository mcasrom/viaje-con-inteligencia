import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const format = searchParams.get('format') || 'json';
  const limit = searchParams.get('limit') || '5';

  if (!q) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(q)}&format=${format}&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ViajeConInteligencia/1.0 (geocoding proxy)',
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }
}
