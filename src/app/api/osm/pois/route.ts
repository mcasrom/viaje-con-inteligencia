import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const OSM_OVERPASS = 'https://overpass-api.de/api/interpreter';

const priorityCountries: Record<string, [number, number, number, number]> = {
  es: [36.0, -10.0, 44.0, 5.0],
  fr: [41.0, -6.0, 51.0, 10.0],
  it: [36.0, 6.0, 47.0, 19.0],
  pt: [36.5, -10.0, 42.5, -6.0],
  gr: [34.0, 19.0, 42.0, 30.0],
  tr: [35.0, 25.0, 42.0, 45.0],
  mx: [14.0, -120.0, 33.0, -86.0],
  jp: [24.0, 122.0, 46.0, 154.0],
  th: [5.0, 97.0, 21.0, 106.0],
  us: [24.0, -130.0, 50.0, -65.0],
};

const topTypes: Record<string, string> = {
  lighthouse: 'man_made=lighthouse',
  beach: 'natural=beach',
  museum: 'tourism=museum',
  castle: 'historic=castle',
};

const topTypeNames: Record<string, string> = {
  lighthouse: 'Faros',
  beach: 'Playas',
  museum: 'Museos',
  castle: 'Castillos',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = (searchParams.get('country') || 'es').toLowerCase();
  const type = searchParams.get('type') || 'lighthouse';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50);

  if (!priorityCountries[country]) {
    return NextResponse.json({
      error: 'País no soportado',
      validCountries: Object.keys(priorityCountries).sort(),
      message: 'Solo países top 10 turismo disponibles',
    }, { status: 400 });
  }

  if (!topTypes[type]) {
    return NextResponse.json({
      error: 'Tipo no válido',
      validTypes: Object.keys(topTypes),
      message: 'Solo lighthouse, beach, museum, castle',
    }, { status: 400 });
  }

  const bbox = priorityCountries[country];
  const tag = topTypes[type];

  const query = `
[out:json][timeout:30];
(
  node["${tag}"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
  way["${tag}"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
);
out center ${limit};
`.trim();

  try {
    const response = await fetch(OSM_OVERPASS, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      throw new Error('OSM API error');
    }

    const osmData = await response.json();
    
    const pois = osmData.elements.map((el: any) => {
      const tags = el.tags || {};
      return {
        id: el.id,
        name: tags.name || tags.operator || tags['official:name'] || null,
        type: topTypeNames[type] || type,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        country: country.toUpperCase(),
      };
    }).filter((p: any) => p.name && p.lat);

    return NextResponse.json({
      source: 'OpenStreetMap',
      sourceUrl: 'https://overpass-api.de',
      license: 'ODbL',
      query: { country, type, typeName: topTypeNames[type], limit },
      validCountries: Object.keys(priorityCountries),
      validTypes: Object.keys(topTypes),
      timestamp: new Date().toISOString(),
      count: pois.length,
      pois: pois.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching OSM', details: (error as Error).message },
      { status: 500 }
    );
  }
}