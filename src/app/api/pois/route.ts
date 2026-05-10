import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const OSM_OVERPASS = 'https://overpass-api.de/api/interpreter';

export const maxDuration = 60;

const FETCH_HEADERS = {
  'User-Agent': 'ViajeConInteligencia/1.0 (travel intelligence platform; admin@viajeinteligencia.com)',
  'Accept': '*/*',
  'Content-Type': 'text/plain',
};

const POI_TYPES: Record<string, { osm: string; label: string; icon: string }> = {
  museum:        { osm: 'tourism=museum',           label: 'Museos',           icon: '🏛️' },
  heritage:      { osm: 'historic=monument',         label: 'Patrimonio',       icon: '🏰' },
  beach:         { osm: 'natural=beach',             label: 'Playas',           icon: '🏖️' },
  lighthouse:    { osm: 'man_made=lighthouse',       label: 'Faros',            icon: '🗼' },
  nature:        { osm: 'leisure=nature_reserve',    label: 'Naturaleza',       icon: '🌿' },
  viewpoint:     { osm: 'tourism=viewpoint',         label: 'Miradores',        icon: '👁️' },
  castle:        { osm: 'historic=castle',           label: 'Castillos',        icon: '🏯' },
  archaeological:{ osm: 'historic=archaeological_site', label: 'Yacimientos',  icon: '🔍' },
  // Tourism-disruptive POIs
  airport:       { osm: 'aeroway=aerodrome',         label: 'Aeropuertos',      icon: '✈️' },
  border:        { osm: 'barrier=border_control',    label: 'Fronteras',        icon: '🛂' },
  police:        { osm: 'amenity=police',            label: 'Comisaría',        icon: '👮' },
  hospital:      { osm: 'amenity=hospital',          label: 'Hospital',         icon: '🏥' },
};

const COUNTRY_ISO_OVERRIDES: Record<string, string> = {
  gb: 'GB',
  gr: 'GR',
  kr: 'KR',
  us: 'US',
  ae: 'AE',
};

function toOSMCountry(cc: string): string {
  return COUNTRY_ISO_OVERRIDES[cc] || cc.toUpperCase();
}

function buildOverpassQuery(country: string, types: string[], limit: number): string {
  const iso = toOSMCountry(country);
  const filters = types.map(t => POI_TYPES[t]).filter(Boolean);
  if (filters.length === 0) return '';

  const queries = filters.map(f => {
    const [key, val] = f.osm.split('=');
    return `
  node["${key}"="${val}"](area.searchArea);
  way["${key}"="${val}"](area.searchArea);`;
  }).join('');

  return `[out:json][timeout:25];
area["ISO3166-1"="${iso}"]->.searchArea;
(
${queries}
);
out center ${limit};
`;
}

function parseCoord(el: any): { lat: number; lon: number } | null {
  const lat = el.lat || el.center?.lat;
  const lon = el.lon || el.center?.lon;
  if (lat != null && lon != null) return { lat, lon };
  return null;
}

const PROFILE_WEIGHTS: Record<string, Record<string, number>> = {
  mochilero:  { museum: 0.3, heritage: 0.4, beach: 0.8, lighthouse: 0.5, nature: 1.0, viewpoint: 0.9, castle: 0.4, archaeological: 0.5, airport: 0.1, border: 0.2, police: 0.1, hospital: 0.1 },
  lujo:       { museum: 1.0, heritage: 1.0, beach: 0.7, lighthouse: 0.5, nature: 0.4, viewpoint: 0.5, castle: 0.9, archaeological: 0.6, airport: 0.8, border: 0.1, police: 0.1, hospital: 0.1 },
  familiar:   { museum: 0.6, heritage: 0.5, beach: 1.0, lighthouse: 0.4, nature: 0.8, viewpoint: 0.6, castle: 0.7, archaeological: 0.3, airport: 0.5, border: 0.1, police: 0.3, hospital: 0.4 },
  aventura:   { museum: 0.2, heritage: 0.3, beach: 0.6, lighthouse: 0.4, nature: 1.0, viewpoint: 1.0, castle: 0.3, archaeological: 0.4, airport: 0.2, border: 0.3, police: 0.2, hospital: 0.4 },
  negocios:   { museum: 0.3, heritage: 0.3, beach: 0.2, lighthouse: 0.1, nature: 0.2, viewpoint: 0.2, castle: 0.2, archaeological: 0.2, airport: 1.0, border: 0.4, police: 0.5, hospital: 0.3 },
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const country = (params.get('country') || 'es').toLowerCase();
  const type = params.get('type') || 'all';
  const limit = Math.min(parseInt(params.get('limit') || '30', 10), 50);
  const profile = params.get('profile') || '';

  // Timeout controller (AbortSignal.timeout no disponible en todas las versiones)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let typeList: string[];
  if (type === 'all') {
    typeList = Object.keys(POI_TYPES);
  } else if (type === 'disruption') {
    typeList = ['airport', 'border', 'police', 'hospital'];
  } else if (type === 'tourist') {
    typeList = ['museum', 'heritage', 'beach', 'lighthouse', 'nature', 'viewpoint', 'castle', 'archaeological'];
  } else if (POI_TYPES[type]) {
    typeList = [type];
  } else {
    return NextResponse.json({ error: `Tipo no válido. Válidos: ${Object.keys(POI_TYPES).join(', ')}` }, { status: 400 });
  }

  // Check cache first
  const cacheKey = `${country}_${type}_${profile}`;
  try {
    if (supabaseAdmin) {
      const { data: cached } = await supabaseAdmin
        .from('pois_cache')
        .select('data, updated_at')
        .eq('country_code', country)
        .eq('poi_type', type)
        .eq('profile', profile)
        .maybeSingle();

      if (cached && cached.updated_at) {
        const age = Date.now() - new Date(cached.updated_at).getTime();
        if (age < 6 * 60 * 60 * 1000) {
          return NextResponse.json({ ...cached.data, cached: true, cacheAge: Math.round(age / 60000) + 'm' });
        }
      }
    }
  } catch {}

  const query = buildOverpassQuery(country, typeList, limit);
  if (!query) {
    return NextResponse.json({ error: 'Error construyendo query' }, { status: 500 });
  }

  try {
    const res = await fetch(OSM_OVERPASS, {
      method: 'POST',
      body: query,
      headers: FETCH_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        source: 'error',
        error: 'OSM Overpass error',
        count: 0,
        pois: [],
      });
    }

    const data = await res.json();
    const elements = data.elements || [];

    const pois = elements
      .map((el: any) => {
        const tags = el.tags || {};
        const coord = parseCoord(el);
        if (!coord) return null;

        const osmType = typeList.find(t => {
          const f = POI_TYPES[t];
          if (!f) return false;
          const [k, v] = f.osm.split('=');
          return tags[k] === v;
        }) || 'unknown';

        return {
          id: el.id,
          name: tags.name || tags.operator || tags.short_name || tags['official:name'] || tags.alt_name || null,
          type: osmType === 'unknown' ? typeList[0] : osmType,
          typeName: POI_TYPES[osmType]?.label || osmType,
          icon: POI_TYPES[osmType]?.icon || '📍',
          lat: coord.lat,
          lon: coord.lon,
          description: tags.description || tags.wikipedia || null,
          website: tags.website || null,
          opening_hours: tags.opening_hours || null,
          phone: tags.phone || null,
        };
      })
      .filter((p: any) => p && p.name)
      .slice(0, limit);

    const weights = PROFILE_WEIGHTS[profile];
    const scored = pois.map((p: any) => {
      const score = weights ? (weights[p.type] ?? 0.5) : 0.5;
      return { ...p, relevance: Math.round(score * 100) };
    });
    if (weights) scored.sort((a: any, b: any) => b.relevance - a.relevance);

    const response = {
      source: 'openstreetmap-overpass',
      url: 'https://overpass-api.de',
      license: 'ODbL',
      query: { country, profile: profile || 'none', types: typeList, limit },
      count: scored.length,
      types_available: Object.keys(POI_TYPES).map((k: any) => ({ type: k, ...POI_TYPES[k] })),
      pois: scored,
      timestamp: new Date().toISOString(),
    };

    // Save to cache (async, don't block response)
    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from('pois_cache').upsert({
          country_code: country,
          poi_type: type,
          profile: profile || '',
          data: response,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {}

    return NextResponse.json(response);
  } catch (err: any) {
    clearTimeout(timeoutId);
    return NextResponse.json({
      source: 'error',
      error: err.message,
      count: 0,
      pois: [],
    });
  }
}
