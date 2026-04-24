import { NextRequest, NextResponse } from 'next/server';

const METAR_API = 'https://aviationweather.gov/api/data/metar';

const ICAO_ALPHA: Record<string, { icao: string; name: string; lat: number; lon: number }> = {
  es: { icao: 'LEMD', name: 'Madrid-Barajas', lat: 40.4983, lon: -3.5676 },
  fr: { icao: 'LFPG', name: 'París-CDGs', lat: 49.0097, lon: 2.5479 },
  de: { icao: 'EDDF', name: 'Fráncfort', lat: 50.0379, lon: 8.5622 },
  it: { icao: 'LIRF', name: 'Roma-Fiumicino', lat: 41.8003, lon: 12.2389 },
  gb: { icao: 'EGLL', name: 'Londres-Heathrow', lat: 51.4700, lon: -0.4503 },
  pt: { icao: 'LPPT', name: 'Lisboa', lat: 38.7742, lon: -9.1342 },
  us: { icao: 'KJFK', name: 'NYC-JFK', lat: 40.6413, lon: -73.7781 },
  mx: { icao: 'MMMX', name: 'Ciudad México', lat: 19.4361, lon: -99.0721 },
  ar: { icao: 'SAEZ', name: 'Buenos Aires', lat: -34.8222, lon: -58.5658 },
  br: { icao: 'SBGR', name: 'São Paulo', lat: -23.4356, lon: -46.4731 },
  jp: { icao: 'RJTT', name: 'Tokio-Haneda', lat: 35.5494, lon: 139.7798 },
  cn: { icao: 'ZBAA', name: 'Pekín', lat: 40.0799, lon: 116.6031 },
  au: { icao: 'YSSY', name: 'Sídney', lat: -33.9399, lon: 151.1753 },
  nl: { icao: 'EHAM', name: 'Ámsterdam', lat: 52.3105, lon: 4.7683 },
  be: { icao: 'EBBR', name: 'Bruselas', lat: 50.9014, lon: 4.4845 },
  at: { icao: 'LOWW', name: 'Viena', lat: 48.1103, lon: 16.5697 },
  ch: { icao: 'LSZH', name: 'Zúrich', lat: 47.4647, lon: 8.5492 },
  gr: { icao: 'LGAV', name: 'Atenas', lat: 37.9364, lon: 23.9445 },
  tr: { icao: 'LTBA', name: 'Estambul', lat: 40.9718, lon: 28.8246 },
  eg: { icao: 'HECA', name: 'El Cairo', lat: 30.1219, lon: 31.4056 },
  ma: { icao: 'GMMN', name: 'Casablanca', lat: 33.3675, lon: -7.5898 },
  th: { icao: 'VTBD', name: 'Bangkok', lat: 13.9126, lon: 100.6067 },
  in: { icao: 'VIDP', name: 'Nueva Delhi', lat: 28.5662, lon: 77.1031 },
  cl: { icao: 'SCEL', name: 'Santiago', lat: -33.3930, lon: -70.7858 },
  ca: { icao: 'CYYZ', name: 'Toronto', lat: 43.6777, lon: -79.6248 },
  co: { icao: 'SKBO', name: 'Bogotá', lat: 4.7016, lon: -74.1469 },
  pe: { icao: 'SPIM', name: 'Lima', lat: -12.0219, lon: -77.1143 },
  za: { icao: 'FAOR', name: 'Johannesburgo', lat: -26.1392, lon: 28.246 },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get('code') || 'es').toLowerCase();

  const airport = ICAO_ALPHA[code];
  if (!airport) {
    return NextResponse.json(
      { error: 'Aeropuerto no soportado', supported: Object.keys(ICAO_ALPHA) },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${METAR_API}?ids=${airport.icao}&format=json`
    );
    
    if (!res.ok) {
      const fallback = getMockMetar(airport);
      return NextResponse.json({
        ...fallback,
        source: 'fallback',
      });
    }
    
    const data = await res.json();
    const metar = data[0] || {};
    
    return NextResponse.json({
      icao: airport.icao,
      name: airport.name,
      country: code.toUpperCase(),
      observed: metar.reportTime || new Date().toISOString(),
      temp: metar.temp || null,
      dewp: metar.dewp || null,
      humidity: metar.relh || null,
      wind: {
        speed: metar.wspd || 0,
        gust: metar.wgst || null,
        dir: metar.wdir || null,
      },
      visibility: metar.visib || null,
      pressure: metar.altim || null,
      clouds: metar.clouds?.map((c: any) => ({ type: c.cover, base: c.base })) || [],
      weather: metar.weather || null,
      raw: metar.rawOb || '',
      flightCategory: getFlightCategory(metar),
      source: 'aviationweather.gov',
    });
  } catch (e) {
    console.error('[METAR] Error:', e);
    const fallback = getMockMetar(airport);
    return NextResponse.json({
      ...fallback,
      source: 'fallback-error',
    });
  }
}

function getFlightCategory(metar: any): string {
  const vis = metar.visib || 10;
  const ceill = metar.clouds?.[0]?.base || 100;
  
  if (vis < 1 || ceill < 300) return 'LIFR';
  if (vis < 3 || ceill < 1000) return 'IFR';
  if (vis < 5 || ceill < 3000) return 'MVFR';
  return 'VFR';
}

function getMockMetar(airport: any) {
  return {
    icao: airport.icao,
    name: airport.name,
    country: airport.icao.slice(0, 2).toUpperCase(),
    observed: new Date().toISOString(),
    temp: 18,
    dewp: 12,
    humidity: 68,
    wind: { speed: 12, gust: null, dir: 270 },
    visibility: 10,
    pressure: 1013,
    clouds: [{ type: 'FEW', base: 4500 }],
    weather: null,
    raw: `${airport.icao} 241200Z 27012KT 10SM FEW045 18/12 A3000`,
    flightCategory: 'VFR',
  };
}