import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const OSM_OVERPASS = 'https://overpass-api.de/api/interpreter';

const osmSearchAreas: Record<string, [number, number, number, number]> = {
  es: [36.0, -10.0, 44.0, 5.0],
  fr: [41.0, -6.0, 51.0, 10.0],
  it: [36.0, 6.0, 47.0, 19.0],
  pt: [36.5, -10.0, 42.5, -6.0],
  gr: [34.0, 19.0, 42.0, 30.0],
};

const poiTypes: Record<string, string> = {
  lighthouse: 'man_made=lighthouse',
  beach: 'natural=beach',
  viewpoint: 'tourism=viewpoint',
  museum: 'tourism=museum',
  park: 'leisure=park',
  castle: 'historic=castle',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'es';
  const type = searchParams.get('type') || 'lighthouse';
  const limit = parseInt(searchParams.get('limit') || '20');

  const bbox = osmSearchAreas[country.toLowerCase()] || osmSearchAreas.es;
  const tag = poiTypes[type] || poiTypes.lighthouse;

  const query = `
[out:json][timeout:25];
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
    
    const pois = osmData.elements.map((el: any) => ({
      id: el.id,
      name: el.tags?.name || el.tags?.operator || `${type} ${el.id}`,
      type: el.tags?.['man_made'] || el.tags?.natural || el.tags?.tourism || el.tags?.historic,
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      country: el.tags?.['addr:country'] || country.toUpperCase(),
    }));

    return NextResponse.json({
      source: 'OpenStreetMap',
      query: { country, type, bbox },
      timestamp: new Date().toISOString(),
      count: pois.length,
      pois: pois.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching OSM data', details: (error as Error).message },
      { status: 500 }
    );
  }
}