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
  tr: [35.0, 25.0, 42.0, 45.0],
  mx: [14.0, -120.0, 33.0, -86.0],
  jp: [24.0, 122.0, 46.0, 154.0],
  th: [5.0, 97.0, 21.0, 106.0],
  cn: [18.0, 73.0, 54.0, 135.0],
  us: [24.0, -130.0, 50.0, -65.0],
  au: [-44.0, 112.0, -10.0, 154.0],
  gb: [49.0, -8.0, 61.0, 2.0],
  de: [47.0, 5.0, 55.0, 16.0],
  nl: [50.0, 2.0, 54.0, 8.0],
  be: [49.0, 2.0, 52.0, 7.0],
  ch: [45.0, 5.0, 48.0, 11.0],
  at: [46.0, 9.0, 50.0, 17.0],
  pl: [49.0, 13.0, 55.0, 24.0],
  cz: [48.0, 12.0, 52.0, 19.0],
  hr: [42.0, 13.0, 47.0, 20.0],
  ma: [27.0, -14.0, 36.0, 0.0],
  eg: [22.0, 25.0, 32.0, 37.0],
  za: [-35.0, 16.0, -22.0, 34.0],
  br: [-35.0, -74.0, 6.0, -32.0],
  ar: [-56.0, -74.0, -22.0, -53.0],
  ca: [41.0, -141.0, 84.0, -52.0],
};

const poiTypes: Record<string, string> = {
  lighthouse: 'man_made=lighthouse',
  beach: 'natural=beach',
  beach_coast: 'natural=coastline',
  viewpoint: 'tourism=viewpoint',
  museum: 'tourism=museum',
  park: 'leisure=park',
  castle: 'historic=castle',
  ruins: 'historic=ruins',
  church: 'amenity=church',
  cathedral: 'amenity=place_of_worship',
  waterfall: 'natural=water',
  lake: 'natural=lake',
  mountain: 'natural=peak',
  ski_resort: 'piste= downhill',
  theme_park: 'tourism=theme_park',
  zoo: 'tourism=zoo',
  aquarium: 'tourism=aquarium',
  archaeological: 'historic=archaeological_site',
  monument: 'historic=monument',
};

const poiCategories = {
  coast: ['lighthouse', 'beach', 'beach_coast'],
  culture: ['museum', 'castle', 'ruins', 'church', 'cathedral', 'archaeological', 'monument'],
  nature: ['viewpoint', 'waterfall', 'lake', 'mountain'],
  leisure: ['park', 'theme_park', 'zoo', 'aquarium'],
  sports: ['ski_resort'],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'es';
  const type = searchParams.get('type') || 'lighthouse';
  const limit = parseInt(searchParams.get('limit') || '30');
  const category = searchParams.get('category');

  if (!country || !osmSearchAreas[country.toLowerCase()]) {
    return NextResponse.json({
      error: 'País no válido',
      validCountries: Object.keys(osmSearchAreas).sort(),
    }, { status: 400 });
  }

  const bbox = osmSearchAreas[country.toLowerCase()];
  const typesToQuery = category 
    ? poiCategories[category as keyof typeof poiCategories]?.map(t => poiTypes[t]) || [poiTypes[type]]
    : [poiTypes[type] || poiTypes.lighthouse].filter(Boolean);

  const queries = typesToQuery.map(tag => `
    node["${tag}"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
    way["${tag}"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
  `).join(' ');

  const query = `
[out:json][timeout:30];
(
${queries}
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
        name: tags.name || tags.operator || tags['official:name'] || `${type} ${el.id}`,
        type: tags['man_made'] || tags.natural || tags.tourism || tags.historic || tags.amenity || tags.leisure || tags.piste || 'poi',
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        country: tags['addr:country'] || country.toUpperCase(),
        wikipedia: tags.wikipedia || null,
        description: tags.description || tags['tourism:description'] || null,
        image: tags.image || null,
      };
    }).filter((p: any) => p.name && !p.name.match(/^\d+$/));

    return NextResponse.json({
      source: 'OpenStreetMap',
      query: { country, type, category, bbox, limit },
      validTypes: Object.keys(poiTypes),
      validCategories: Object.keys(poiCategories),
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