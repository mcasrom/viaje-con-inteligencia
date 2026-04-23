import { NextResponse } from 'next/server';

const OPEN_METEO = 'https://api.open-meteo.com/v1';

const EXTREME_CONDITIONS: Record<number, { level: string, icon: string, desc: string }> = {
  95: { level: 'extreme', icon: '🌪️', desc: 'Tormenta de nieve intensa' },
  96: { level: 'extreme', icon: '🌪️', desc: 'Tormenta con granizo' },
  99: { level: 'extreme', icon: '🌪️', desc: 'Tormenta de nieve extrema' },
  80: { level: 'high', icon: '🌧️', desc: 'Lluvia torrencial' },
  81: { level: 'high', icon: '🌧️', desc: 'Lluvia moderada' },
  82: { level: 'high', icon: '🌧️', desc: 'Lluvia violenta' },
  71: { level: 'medium', icon: '❄️', desc: 'Nevada ligera' },
  72: { level: 'medium', icon: '❄️', desc: 'Nevada moderada' },
  73: { level: 'medium', icon: '❄️', desc: 'Nevada intensa' },
  61: { level: 'low', icon: '🌧️', desc: 'Lluvia ligera' },
  63: { level: 'low', icon: '🌧️', desc: 'Lluvia moderada' },
  65: { level: 'high', icon: '🌧️', desc: 'Lluvia intensos' },
  45: { level: 'medium', icon: '🌫️', desc: 'Niebla' },
  48: { level: 'low', icon: '🌫️', desc: 'Llovizna helada' },
  0: { level: 'clear', icon: '☀️', desc: 'Despejado' },
  1: { level: 'clear', icon: '🌤️', desc: 'Mayormente despejado' },
};

function getWeatherAlerts(weatherCode: number) {
  const alert = EXTREME_CONDITIONS[weatherCode] || { level: 'normal', icon: '🌤️', desc: 'Normal' };
  
  if (alert.level === 'extreme' || alert.level === 'high') {
    return { ...alert, alert: true };
  }
  return { ...alert, alert: false };
}

function getCoordinate(countryCode: string): [number, number] | null {
  const coords: Record<string, [number, number]> = {
    ES: [40.416775, -3.703790],
    UK: [51.507400, -0.127800],
    FR: [48.856600, 2.352200],
    DE: [52.520000, 13.405000],
    IT: [41.902800, 12.596400],
    PT: [38.722300, -9.139300],
    NL: [52.367600, 4.904100],
    AT: [48.208200, 16.373800],
    CH: [46.948000, 7.447400],
    US: [38.907200, -77.036900],
    JP: [35.676200, 139.650300],
    GR: [37.983800, 23.727500],
    TR: [39.933400, 32.859700],
  };
  return coords[countryCode] || null;
}

async function fetchExtremeWeather(lat: number, lon: number, country: string) {
  try {
    const response = await fetch(
      `${OPEN_METEO}/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&forecast_days=3&timezone=auto`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const alerts: any[] = [];
    
    for (let i = 0; i < Math.min(24, data.hourly?.time?.length || 0); i++) {
      const code = data.hourly?.weather_code?.[i] || 0;
      if (code >= 61 || code >= 71 || code >= 80 || code >= 95) {
        const weather = getWeatherAlerts(code);
        if (weather.alert) {
          alerts.push({
            time: data.hourly?.time?.[i],
            code,
            ...weather,
            temp: data.hourly?.temperature_2m_max?.[i],
            wind: data.hourly?.wind_speed_10m_max?.[i],
          });
        }
      }
    }
    
    return { alerts, hourly: data.hourly };
  } catch (e) {
    console.log('[Weather] Error:', e);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'ES';
  const format = searchParams.get('format') || 'json';

  const coords = getCoordinate(country.toUpperCase());
  
  if (!coords) {
    return NextResponse.json({ error: 'Pais no soportado' }, { status: 400 });
  }

  const weatherData = await fetchExtremeWeather(coords[0], coords[1], country.toUpperCase());
  
  const currentAlerts: any[] = [];
  const critical: any[] = [];
  const warning: any[] = [];
  
  if (weatherData?.alerts) {
    for (const alert of weatherData.alerts) {
      if (alert.level === 'extreme') critical.push(alert);
      else if (alert.level === 'high') warning.push(alert);
      else currentAlerts.push(alert);
    }
  }

  if (format === 'text') {
    const lines = [
      ...critical.map(c => `${c.icon}⚠️ EXTREMO: ${c.desc} - ${c.temp}°C`),
      ...warning.map(w => `${w.icon}⚠️ AVISO: ${w.desc} - ${w.temp}°C`),
      ...currentAlerts.map(a => `${a.icon} INFO: ${a.desc} - ${a.temp}°C`),
    ];
    return NextResponse.json({
      text: lines.length ? lines.join('\n') : 'Sin alertas meteorologicas extremas',
      alertCount: critical.length + warning.length,
    });
  }

  return NextResponse.json({
    country: country.toUpperCase(),
    critical: critical.length,
    warning: warning.length,
    alerts: [...critical, ...warning],
    source: 'Open-Meteo API',
    timestamp: new Date().toISOString(),
  });
}