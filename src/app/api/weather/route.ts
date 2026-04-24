import { NextResponse } from 'next/server';

const OPEN_METEO = 'https://api.open-meteo.com/v1';

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Despejado', icon: '☀️' },
  1: { desc: 'Mayormente despejado', icon: '🌤️' },
  2: { desc: 'Parcialmente nublado', icon: '⛅' },
  3: { desc: 'Nublado', icon: '☁️' },
  45: { desc: 'Niebla', icon: '🌫️' },
  48: { desc: 'Llovizna helada', icon: '🌫️' },
  51: { desc: 'Llovizna ligera', icon: '🌧️' },
  53: { desc: 'Llovizna moderada', icon: '🌧️' },
  55: { desc: 'Llovizna densa', icon: '🌧️' },
  61: { desc: 'Lluvia ligera', icon: '🌧️' },
  63: { desc: 'Lluvia moderada', icon: '🌧️' },
  65: { desc: 'Lluvia intensa', icon: '🌧️' },
  71: { desc: 'Nevada ligera', icon: '❄️' },
  73: { desc: 'Nevada moderada', icon: '❄️' },
  75: { desc: 'Nevada intensa', icon: '❄️' },
  77: { desc: 'Granizo', icon: '🌨️' },
  80: { desc: 'Chubascos ligeros', icon: '🌧️' },
  81: { desc: 'Chubascos moderados', icon: '🌧️' },
  82: { desc: 'Chubascos violentos', icon: '🌧️' },
  85: { desc: 'Chubascos de nieve', icon: '🌨️' },
  95: { desc: 'Tormenta', icon: '⛈️' },
  96: { desc: 'Tormenta con granizo', icon: '⛈️' },
  99: { desc: 'Tormenta severa', icon: '⛈️' },
};

const COUNTRY_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  es: { lat: 40.4168, lon: -3.7038, name: 'Madrid' },
  fr: { lat: 48.8566, lon: 2.3522, name: 'París' },
  de: { lat: 52.5200, lon: 13.4050, name: 'Berlín' },
  it: { lat: 41.9028, lon: 12.5964, name: 'Roma' },
  gb: { lat: 51.5074, lon: -0.1278, name: 'Londres' },
  pt: { lat: 38.7223, lon: -9.1393, name: 'Lisboa' },
  us: { lat: 38.9072, lon: -77.0369, name: 'Washington' },
  jp: { lat: 35.6762, lon: 139.6503, name: 'Tokio' },
  mx: { lat: 19.4326, lon: -99.1332, name: 'Ciudad de México' },
  ar: { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires' },
  br: { lat: -23.5505, lon: -46.6333, name: 'São Paulo' },
  cl: { lat: -33.4489, lon: -70.6693, name: 'Santiago' },
  co: { lat: 4.7110, lon: -74.0721, name: 'Bogotá' },
  pe: { lat: -12.0464, lon: -77.0428, name: 'Lima' },
  au: { lat: -33.8688, lon: 151.2093, name: 'Sídney' },
  nz: { lat: -36.8485, lon: 174.7633, name: 'Auckland' },
  nl: { lat: 52.3676, lon: 4.9041, name: 'Ámsterdam' },
  be: { lat: 50.8503, lon: 4.3517, name: 'Bruselas' },
  at: { lat: 48.2082, lon: 16.3738, name: 'Viena' },
  ch: { lat: 46.9480, lon: 7.4474, name: 'Ginebra' },
  gr: { lat: 37.9838, lon: 23.7275, name: 'Atenas' },
  tr: { lat: 39.9334, lon: 32.8597, name: 'Estambul' },
  eg: { lat: 30.0444, lon: 31.2357, name: 'El Cairo' },
  ma: { lat: 33.5731, lon: -7.5898, name: 'Casablanca' },
  za: { lat: -26.2041, lon: 28.0473, name: 'Johannesburgo' },
  th: { lat: 13.7563, lon: 100.5018, name: 'Bangkok' },
  vn: { lat: 21.0285, lon: 105.8542, name: 'Hanoi' },
  in: { lat: 28.6139, lon: 77.2090, name: 'Nueva Delhi' },
  cn: { lat: 39.9042, lon: 116.4074, name: 'Pekín' },
  kr: { lat: 37.5665, lon: 126.9780, name: 'Seúl' },
  ca: { lat: 45.4215, lon: -75.6972, name: 'Ottawa' },
};

function getWeatherInfo(code: number) {
  return WEATHER_CODES[code] || { desc: 'Desconocido', icon: '🌡️' };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get('code') || 'es').toLowerCase();
  const days = parseInt(searchParams.get('days') || '7');
  
  const country = COUNTRY_COORDS[code];
  if (!country) {
    return NextResponse.json(
      { error: 'País no soportado', supported: Object.keys(COUNTRY_COORDS) },
      { status: 400 }
    );
  }

  try {
    const url = `${OPEN_METEO}/forecast?latitude=${country.lat}&longitude=${country.lon}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&hourly=weather_code,temperature_2m` +
      `&forecast_days=${days}&timezone=auto`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    
    const data = await res.json();
    const daily = data.daily || {};
    
    const forecast = daily.time?.map((t: string, i: number) => {
      const code = daily.weather_code?.[i] || 0;
      const info = getWeatherInfo(code);
      return {
        date: t,
        code,
        ...info,
        tempMax: daily.temperature_2m_max?.[i],
        tempMin: daily.temperature_2m_min?.[i],
        precipitation: daily.precipitation_sum?.[i],
        windMax: daily.wind_speed_10m_max?.[i],
      };
    }) || [];

    const current = forecast[0] || {};
    
    return NextResponse.json({
      country: code.toUpperCase(),
      city: country.name,
      current: {
        code: current.code,
        desc: current.desc,
        icon: current.icon,
        temp: current.tempMax,
      },
      forecast,
      source: 'Open-Meteo',
      updated: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Weather] Error:', e);
    return NextResponse.json({ error: 'Error fetching weather' }, { status: 500 });
  }
}