import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const OSM_OVERPASS = 'https://overpass-api.de/api/interpreter';

export const maxDuration = 60;

// In-memory cache (per-process, survives between requests)
const MEMORY_CACHE = new Map<string, { data: any; ts: number }>();
const MEMORY_TTL = 6 * 60 * 60 * 1000; // 6 hours

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
  airport:       { osm: 'aeroway=aerodrome',         label: 'Aeropuertos',      icon: '✈️' },
  border:        { osm: 'barrier=border_control',    label: 'Fronteras',        icon: '🛂' },
  police:        { osm: 'amenity=police',            label: 'Comisaría',        icon: '👮' },
  hospital:      { osm: 'amenity=hospital',          label: 'Hospital',         icon: '🏥' },
  pharmacy:      { osm: 'amenity=pharmacy',          label: 'Farmacia',         icon: '💊' },
  fuel:          { osm: 'amenity=fuel',              label: 'Gasolinera',       icon: '⛽' },
};

const COUNTRY_ISO_OVERRIDES: Record<string, string> = {
  gb: 'GB', gr: 'GR', kr: 'KR', us: 'US', ae: 'AE',
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
    return `\n  node["${key}"="${val}"](area.searchArea);\n  way["${key}"="${val}"](area.searchArea);`;
  }).join('');
  return `[out:json][timeout:15];\narea["ISO3166-1"="${iso}"]->.searchArea;\n(\n${queries}\n);\nout center ${limit};\n`;
}

function buildOverpassRadiusQuery(lat: number, lon: number, radius: number, types: string[], limit: number): string {
  const filters = types.map(t => POI_TYPES[t]).filter(Boolean);
  if (filters.length === 0) return '';
  const queries = filters.map(f => {
    const [key, val] = f.osm.split('=');
    return `\n  node["${key}"="${val}"](around:${radius},${lat},${lon});\n  way["${key}"="${val}"](around:${radius},${lat},${lon});`;
  }).join('');
  return `[out:json][timeout:15];\n(\n${queries}\n);\nout center ${limit};\n`;
}

function parseCoord(el: any): { lat: number; lon: number } | null {
  const lat = el.lat || el.center?.lat;
  const lon = el.lon || el.center?.lon;
  if (lat != null && lon != null) return { lat, lon };
  return null;
}

const PROFILE_WEIGHTS: Record<string, Record<string, number>> = {
  mochilero:  { museum: 0.3, heritage: 0.4, beach: 0.8, lighthouse: 0.5, nature: 1.0, viewpoint: 0.9, castle: 0.4, archaeological: 0.5, airport: 0.1, border: 0.2, police: 0.1, hospital: 0.1, pharmacy: 0.1, fuel: 0.2 },
  lujo:       { museum: 1.0, heritage: 1.0, beach: 0.7, lighthouse: 0.5, nature: 0.4, viewpoint: 0.5, castle: 0.9, archaeological: 0.6, airport: 0.8, border: 0.1, police: 0.1, hospital: 0.1, pharmacy: 0.1, fuel: 0.1 },
  familiar:   { museum: 0.6, heritage: 0.5, beach: 1.0, lighthouse: 0.4, nature: 0.8, viewpoint: 0.6, castle: 0.7, archaeological: 0.3, airport: 0.5, border: 0.1, police: 0.3, hospital: 0.4, pharmacy: 0.5, fuel: 0.3 },
  aventura:   { museum: 0.2, heritage: 0.3, beach: 0.6, lighthouse: 0.4, nature: 1.0, viewpoint: 1.0, castle: 0.3, archaeological: 0.4, airport: 0.2, border: 0.3, police: 0.2, hospital: 0.4, pharmacy: 0.2, fuel: 0.5 },
  negocios:   { museum: 0.3, heritage: 0.3, beach: 0.2, lighthouse: 0.1, nature: 0.2, viewpoint: 0.2, castle: 0.2, archaeological: 0.2, airport: 1.0, border: 0.4, police: 0.5, hospital: 0.3, pharmacy: 0.2, fuel: 0.3 },
};

// Static fallback POIs for key countries (used when Overpass fails)
const FALLBACK_POIS: Record<string, Array<{ name: string; type: string; lat: number; lon: number; icon: string; typeName: string }>> = {
  es: [
    { name: 'Museo del Prado', type: 'museum', lat: 40.4138, lon: -3.6921, icon: '🏛️', typeName: 'Museos' },
    { name: 'Sagrada Familia', type: 'heritage', lat: 41.4036, lon: 2.1744, icon: '🏰', typeName: 'Patrimonio' },
    { name: 'Playa de la Concha', type: 'beach', lat: 43.3183, lon: -2.0015, icon: '🏖️', typeName: 'Playas' },
    { name: 'Alhambra', type: 'castle', lat: 37.1769, lon: -3.5892, icon: '🏯', typeName: 'Castillos' },
    { name: 'Aeropuerto Madrid-Barajas', type: 'airport', lat: 40.4719, lon: -3.5626, icon: '✈️', typeName: 'Aeropuertos' },
    { name: 'Hospital Clínico San Carlos', type: 'hospital', lat: 40.4382, lon: -3.7245, icon: '🏥', typeName: 'Hospital' },
  ],
  fr: [
    { name: 'Musée du Louvre', type: 'museum', lat: 48.8606, lon: 2.3376, icon: '🏛️', typeName: 'Museos' },
    { name: 'Tour Eiffel', type: 'heritage', lat: 48.8584, lon: 2.2945, icon: '🏰', typeName: 'Patrimonio' },
    { name: 'Plage de Nice', type: 'beach', lat: 43.6961, lon: 7.2656, icon: '🏖️', typeName: 'Playas' },
    { name: 'Aéroport CDG', type: 'airport', lat: 49.0097, lon: 2.5479, icon: '✈️', typeName: 'Aeropuertos' },
    { name: 'Hôpital Pitié-Salpêtrière', type: 'hospital', lat: 48.8423, lon: 2.3619, icon: '🏥', typeName: 'Hospital' },
  ],
  it: [
    { name: 'Coliseo', type: 'heritage', lat: 41.8902, lon: 12.4922, icon: '🏰', typeName: 'Patrimonio' },
    { name: 'Museos Vaticanos', type: 'museum', lat: 41.9065, lon: 12.4536, icon: '🏛️', typeName: 'Museos' },
    { name: 'Playa de Amalfi', type: 'beach', lat: 40.6340, lon: 14.6027, icon: '🏖️', typeName: 'Playas' },
    { name: 'Aeropuerto Fiumicino', type: 'airport', lat: 41.8003, lon: 12.2389, icon: '✈️', typeName: 'Aeropuertos' },
  ],
  pt: [
    { name: 'Torre de Belém', type: 'heritage', lat: 38.6977, lon: -9.2156, icon: '🏰', typeName: 'Patrimonio' },
    { name: 'Museo Nacional de Arte Antiguo', type: 'museum', lat: 38.7047, lon: -9.1606, icon: '🏛️', typeName: 'Museos' },
    { name: 'Playa de Algarve', type: 'beach', lat: 37.0896, lon: -8.6740, icon: '🏖️', typeName: 'Playas' },
    { name: 'Aeropuerto Lisboa', type: 'airport', lat: 38.7742, lon: -9.1342, icon: '✈️', typeName: 'Aeropuertos' },
  ],
  mx: [
    { name: 'Chichén Itzá', type: 'archaeological', lat: 20.6843, lon: -88.5678, icon: '🔍', typeName: 'Yacimientos' },
    { name: 'Museo Nacional de Antropología', type: 'museum', lat: 19.4260, lon: -99.1863, icon: '🏛️', typeName: 'Museos' },
    { name: 'Playa del Carmen', type: 'beach', lat: 20.6274, lon: -87.0799, icon: '🏖️', typeName: 'Playas' },
    { name: 'Aeropuerto CDMX', type: 'airport', lat: 19.4363, lon: -99.0721, icon: '✈️', typeName: 'Aeropuertos' },
  ],
};

function getFallbackPOIs(country: string, typeList: string[], limit: number, profile: string) {
  const fallback = FALLBACK_POIS[country] || [];
  const filtered = typeList === 'all' || typeList.length > 8
    ? fallback
    : fallback.filter(p => typeList.includes(p.type));
  const weights = PROFILE_WEIGHTS[profile];
  const scored = filtered.map(p => ({
    ...p,
    relevance: weights ? Math.round((weights[p.type] ?? 0.5) * 100) : 50,
    id: `fallback-${p.name}`,
    description: null,
    website: null,
    opening_hours: null,
    phone: null,
  }));
  if (weights) scored.sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, limit);
}

function buildFallbackResponse(country: string, typeList: string[], limit: number, profile: string, isRadiusMode: boolean) {
  const pois = getFallbackPOIs(country, typeList, limit, profile);
  return {
    source: 'fallback-static',
    url: 'https://overpass-api.de',
    license: 'ODbL',
    query: { country, profile: profile || 'none', types: typeList, limit },
    count: pois.length,
    radius_mode: isRadiusMode,
    types_available: Object.keys(POI_TYPES).map(k => ({ type: k, ...POI_TYPES[k] })),
    pois,
    timestamp: new Date().toISOString(),
    cached: false,
    fallback: true,
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const country = (params.get('country') || 'es').toLowerCase();
  const type = params.get('type') || 'all';
  const limit = Math.min(parseInt(params.get('limit') || '30', 10), 50);
  const profile = params.get('profile') || '';
  const lat = params.get('lat') ? parseFloat(params.get('lat')!) : null;
  const lon = params.get('lon') ? parseFloat(params.get('lon')!) : null;
  const radius = Math.min(parseInt(params.get('radius') || '5000', 10), 50000);

  const isRadiusMode = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

  let typeList: string[];
  if (type === 'all') {
    typeList = Object.keys(POI_TYPES);
  } else if (type === 'disruption') {
    typeList = ['airport', 'border', 'police', 'hospital', 'pharmacy', 'fuel'];
  } else if (type === 'tourist') {
    typeList = ['museum', 'heritage', 'beach', 'lighthouse', 'nature', 'viewpoint', 'castle', 'archaeological'];
  } else if (type === 'emergency') {
    typeList = ['hospital', 'pharmacy', 'fuel', 'police'];
  } else if (POI_TYPES[type]) {
    typeList = [type];
  } else {
    return NextResponse.json({ error: `Tipo no válido. Válidos: ${Object.keys(POI_TYPES).join(', ')}` }, { status: 400 });
  }

  // 1️⃣ Check in-memory cache (fastest)
  const cacheKey = `${country}_${type}_${profile}`;
  const memCached = MEMORY_CACHE.get(cacheKey);
  if (memCached && Date.now() - memCached.ts < MEMORY_TTL) {
    return NextResponse.json({ ...memCached.data, cached: true, cacheAge: Math.round((Date.now() - memCached.ts) / 60000) + 'm', source: 'memory-cache' });
  }

  // 2️⃣ Check Supabase cache
  try {
    if (supabaseAdmin && !isRadiusMode) {
      const { data: cached } = await supabaseAdmin
        .from('pois_cache')
        .select('data, updated_at')
        .eq('country_code', country)
        .eq('poi_type', type)
        .eq('profile', profile)
        .maybeSingle();

      if (cached && cached.updated_at) {
        const age = Date.now() - new Date(cached.updated_at).getTime();
        if (age < MEMORY_TTL) {
          MEMORY_CACHE.set(cacheKey, { data: cached.data, ts: Date.now() });
          return NextResponse.json({ ...cached.data, cached: true, cacheAge: Math.round(age / 60000) + 'm' });
        }
      }
    }
  } catch {}

  // 3️⃣ Try Overpass API with reduced timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s instead of 30s

  const query = isRadiusMode
    ? buildOverpassRadiusQuery(lat!, lon!, radius, typeList, limit)
    : buildOverpassQuery(country, typeList, limit);

  if (!query) {
    return NextResponse.json(buildFallbackResponse(country, typeList, limit, profile, isRadiusMode));
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
      // Overpass returned error → use fallback
      const fallback = buildFallbackResponse(country, typeList, limit, profile, isRadiusMode);
      MEMORY_CACHE.set(cacheKey, { data: fallback, ts: Date.now() });
      return NextResponse.json(fallback);
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

        const poi: any = {
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

        if (isRadiusMode) {
          const dlat = lat! - coord.lat;
          const dlon = lon! - coord.lon;
          const dist = Math.sqrt(dlat * dlat + dlon * dlon) * 111320;
          poi.distance_m = Math.round(dist);
        }

        return poi;
      })
      .filter((p: any) => p && p.name)
      .slice(0, limit);

    const weights = PROFILE_WEIGHTS[profile];
    const scored = pois.map((p: any) => {
      const score = weights ? (weights[p.type] ?? 0.5) : 0.5;
      return { ...p, relevance: Math.round(score * 100) };
    });
    if (weights) scored.sort((a: any, b: any) => b.relevance - a.relevance);

    // If Overpass returns 0 results, use fallback
    if (scored.length === 0) {
      const fallback = buildFallbackResponse(country, typeList, limit, profile, isRadiusMode);
      MEMORY_CACHE.set(cacheKey, { data: fallback, ts: Date.now() });
      return NextResponse.json(fallback);
    }

    const response = {
      source: 'openstreetmap-overpass',
      url: 'https://overpass-api.de',
      license: 'ODbL',
      query: isRadiusMode ? { lat, lon, radius, profile: profile || 'none', types: typeList, limit } : { country, profile: profile || 'none', types: typeList, limit },
      count: scored.length,
      radius_mode: isRadiusMode,
      types_available: Object.keys(POI_TYPES).map((k: any) => ({ type: k, ...POI_TYPES[k] })),
      pois: scored,
      timestamp: new Date().toISOString(),
    };

    // Save to both caches
    MEMORY_CACHE.set(cacheKey, { data: response, ts: Date.now() });
    try {
      if (supabaseAdmin && !isRadiusMode) {
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
    // Overpass timeout/error → use fallback
    const fallback = buildFallbackResponse(country, typeList, limit, profile, isRadiusMode);
    MEMORY_CACHE.set(cacheKey, { data: fallback, ts: Date.now() });
    return NextResponse.json(fallback);
  }
}
