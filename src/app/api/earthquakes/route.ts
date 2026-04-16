import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || 'week';
  const minMagnitude = searchParams.get('minMagnitude') || '4.5';
  const limit = searchParams.get('limit') || '50';

  const timeframes: Record<string, string> = {
    day: '86400',
    week: '604800',
    month: '2592000',
  };

  const startTime = Math.floor(Date.now() / 1000) - parseInt(timeframes[timeframe] || timeframes.week);

  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&minmagnitude=${minMagnitude}&orderby=magnitude&limit=${limit}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0 (contact@viajeconinteligencia.com)' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }

    const data = await response.json();

    const earthquakes = data.features.map((eq: any) => ({
      id: eq.id,
      magnitude: eq.properties.mag,
      place: eq.properties.place,
      time: eq.properties.time,
      url: eq.properties.url,
      tsunami: eq.properties.tsunami,
      lat: eq.geometry.coordinates[1],
      lng: eq.geometry.coordinates[0],
      depth: eq.geometry.coordinates[2],
      significance: eq.properties.sig,
    }));

    return NextResponse.json({
      count: earthquakes.length,
      earthquakes,
      source: 'USGS',
      updated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Earthquake API error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earthquake data', url },
      { status: 500 }
    );
  }
}
