import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const RISK_SCORES: Record<string, number> = {
  'sin-riesgo': 100,
  'bajo': 75,
  'medio': 50,
  'alto': 25,
  'muy-alto': 10,
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

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no configurado', places: [], message: 'Modo local sin base de datos' },
        { status: 200 }
      );
    }

    const { data: places, error } = await supabase
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

    return NextResponse.json({
      center: { lat, lon },
      radius,
      count: validPlaces.length,
      places: validPlaces,
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
