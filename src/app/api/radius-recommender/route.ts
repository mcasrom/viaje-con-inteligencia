import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const RISK_SCORES: Record<string, number> = {
  'sin-riesgo': 100,
  'bajo': 75,
  'medio': 50,
  'alto': 25,
  'muy-alto': 10,
};

interface POIResult {
  id: string;
  name: string;
  type: string;
  category: string;
  lat: number;
  lon: number;
  distance: number;
}

const POI_CATEGORIES: Record<string, { osm: string; icon: string; label: string }> = {
  museum: { osm: 'tourism=museum', icon: '🏛️', label: 'Museo' },
  attraction: { osm: 'tourism=attraction', icon: '🌟', label: 'Atracción' },
  viewpoint: { osm: 'tourism=viewpoint', icon: '👁️', label: 'Mirador' },
  artwork: { osm: 'tourism=artwork', icon: '🎨', label: 'Arte' },
  castle: { osm: 'historic=castle', icon: '🏰', label: 'Castillo' },
  monument: { osm: 'historic=monument', icon: '🗿', label: 'Monumento' },
  archaeological: { osm: 'historic=archaeological_site', icon: '🏺', label: 'Yacimiento' },
  beach: { osm: 'natural=beach', icon: '🏖️', label: 'Playa' },
  park: { osm: 'leisure=park', icon: '🌳', label: 'Parque' },
  library: { osm: 'amenity=library', icon: '📚', label: 'Biblioteca' },
};

async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch {
    return null;
  }
}

async function getPOIsInRadius(lat: number, lon: number, radiusKm: number, countryCode: string) {
  try {
    const response = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(`
        SELECT DISTINCT ?item ?itemLabel WHERE {
          { ?item wdt:P31/wdt:P279* wd:Q33506. } UNION
          { ?item wdt:P31/wdt:P279* wd:Q23424. } UNION
          { ?item wdt:P31/wdt:P279* wd:Q41176. }
          ?item wdt:P625 ?coords.
          ?item wdt:P17 ?country.
          VALUES ?country { wd:${countryCodeToWikidata(countryCode)} }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
        }
        LIMIT 20
      `)}`,
      { headers: { 'User-Agent': 'ViajeConInteligencia/1.0' } }
    );
    const data = await response.json();
    return data.results?.bindings?.length || 0;
  } catch {
    return 0;
  }
}

function countryCodeToWikidata(code: string): string {
  const mapping: Record<string, string> = {
    es: 'wd:Q29', fr: 'wd:Q142', it: 'wd:Q38', de: 'wd:Q183', pt: 'wd:Q45',
    gb: 'wd:Q145', gr: 'wd:Q41', ie: 'wd:Q27', nl: 'wd:Q55', be: 'wd:Q31',
    at: 'wd:Q40', ch: 'wd:Q39', pl: 'wd:Q36', cz: 'wd:Q213', hu: 'wd:Q28',
    ro: 'wd:Q218', hr: 'wd:Q224', bg: 'wd:Q219', sk: 'wd:Q214', si: 'wd:Q215',
    dk: 'wd:Q35', se: 'wd:Q34', no: 'wd:Q20', fi: 'wd:Q33', is: 'wd:Q189',
    ee: 'wd:Q191', lv: 'wd:Q211', lt: 'wd:Q37', mx: 'wd:Q96', us: 'wd:Q30',
    ca: 'wd:Q16', co: 'wd:Q739', pe: 'wd:Q419', ar: 'wd:Q414', cl: 'wd:Q298',
    ec: 'wd:Q736', cr: 'wd:Q800', pa: 'wd:Q804', gt: 'wd:Q774', uy: 'wd:Q77',
    py: 'wd:Q733', bo: 'wd:Q750', ve: 'wd:Q717', jp: 'wd:Q17', kr: 'wd:Q884',
    th: 'wd:Q869', in: 'wd:Q668', vn: 'wd:Q881', id: 'wd:Q252', ph: 'wd:Q928',
    my: 'wd:Q833', sg: 'wd:Q334', kh: 'wd:Q424', mm: 'wd:Q836', lk: 'wd:Q854',
    qa: 'wd:Q846', om: 'wd:Q842', tr: 'wd:Q43', il: 'wd:Q801', ae: 'wd:Q878',
    sa: 'wd:Q851', jo: 'wd:Q810', np: 'wd:Q837', pk: 'wd:Q843', ma: 'wd:Q1028',
    za: 'wd:Q258', eg: 'wd:Q79', tn: 'wd:Q948', ke: 'wd:Q114', et: 'wd:Q115',
    ng: 'wd:Q1033', gh: 'wd:Q117', dz: 'wd:Q262', tz: 'wd:Q924', rw: 'wd:Q1037',
    au: 'wd:Q408', nz: 'wd:Q664', fj: 'wd:Q712', lb: 'wd:Q822',
  };
  return mapping[code.toLowerCase()] || 'wd:Q1';
}

async function getPOIsForArea(lat: number, lon: number, radiusKm: number): Promise<POIResult[]> {
  try {
    const radiusMeters = radiusKm * 1000;
    const queries = Object.entries(POI_CATEGORIES)
      .map(([key, cfg]) => `  node(around:${radiusMeters},${lat},${lon})[${cfg.osm}];`).join('\n');

    const overpassQuery = `[out:json][timeout:10];(\n${queries}\n);out center 50;`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain', 'User-Agent': 'ViajeConInteligencia/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    const elements = data.elements || [];

    return elements
      .map((el: any) => {
        const tags = el.tags || {};
        const name = tags.name || tags['name:es'] || tags.short_name || '';
        if (!name) return null;
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (elLat == null || elLon == null) return null;

        const catEntry = Object.entries(POI_CATEGORIES).find(([_, cfg]) => {
          const [k, v] = cfg.osm.split('=');
          return tags[k] === v;
        });
        const category = catEntry?.[0] || 'attraction';
        const id = el.type === 'node' ? `n${el.id}` : `w${el.id}`;

        const dLat = elLat - lat;
        const dLon = elLon - lon;
        const distance = Math.round(Math.sqrt(dLat * dLat + dLon * dLon) * 111.32 * 10) / 10;

        return { id, name, type: el.type, category, lat: elLat, lon: elLon, distance };
      })
      .filter((p: POIResult | null): p is POIResult => p !== null)
      .slice(0, 50);
  } catch {
    return [];
  }
}

function calculateScore(place: any, weather: any, poiCount: number, distanceKm: number): number {
  const riskScore = RISK_SCORES[place.risk_level] || 50;
  const distanceScore = Math.max(0, 100 - (distanceKm / 2));
  const weatherScore = weather?.temp ? Math.max(0, Math.min(100, (weather.temp - 5) * 5)) : 50;
  const poiScore = Math.min(100, poiCount * 15);

  return (
    riskScore * 0.35 +
    distanceScore * 0.25 +
    poiScore * 0.20 +
    weatherScore * 0.20
  );
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon, radius = 100, preferences } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat y lon son requeridos' },
        { status: 400 }
      );
    }

    const radiusInDegrees = radius / 111.32;

    let admin;
    try { admin = supabaseAdmin; } catch { admin = null; }

    if (!admin) {
      return NextResponse.json(
        { error: 'Supabase no configurado', places: [], message: 'Modo local sin base de datos' },
        { status: 200 }
      );
    }

    const { data: places, error } = await admin
      .from('places')
      .select('*')
      .gte('lat', lat - radiusInDegrees)
      .lte('lat', lat + radiusInDegrees)
      .gte('lon', lon - radiusInDegrees)
      .lte('lon', lon + radiusInDegrees)
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { places: [], message: 'Error consultando datos, usando fallback' },
        { status: 200 }
      );
    }

    const scoredPlaces = await Promise.all(
      (places || []).map(async (place) => {
        const distance = Math.sqrt(
          Math.pow(place.lat - lat, 2) + Math.pow(place.lon - lon, 2)
        ) * 111.32;

        if (distance > radius) return null;

        const weather = await getWeather(place.lat, place.lon);
        const poiCount = await getPOIsInRadius(place.lat, place.lon, 20, place.country_code);
        const score = calculateScore(place, weather, poiCount, distance);

        return {
          ...place,
          distance: Math.round(distance * 10) / 10,
          weather,
          poiCount,
          score: Math.round(score * 10) / 10,
        };
      })
    );

    const validPlaces = scoredPlaces.filter(Boolean).sort((a, b) => b!.score - a!.score);

    const pois = await getPOIsForArea(lat, lon, radius);

    return NextResponse.json({
      center: { lat, lon },
      radius,
      count: validPlaces.length,
      places: validPlaces,
      pois,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Radius recommender error:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor', places: [] },
      { status: 500 }
    );
  }
}
