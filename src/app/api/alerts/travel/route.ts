import { NextResponse } from 'next/server';

const OPEN_METEO = 'https://api.open-meteo.com/v1';

const FLIGHT_STATUS = {
  on_time: { status: 'on_time', emoji: '✅', label: 'Sin retrasos' },
  delayed: { status: 'delayed', emoji: '⚠️', label: 'Retrasado' },
  cancelled: { status: 'cancelled', emoji: '❌', label: 'Cancelado' },
};

function generateAirportAlerts() {
  const airports = ['MAD', 'BCN', 'AGP', 'ALC', 'PMI', 'LHR', 'CDG', 'FRA', 'AMS', 'JFK', 'LAX'];
  return airports.map(code => {
    const statuses = ['on_time', 'delayed', 'delayed', 'on_time', 'on_time'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const delay = status === 'delayed' ? Math.floor(Math.random() * 90) + 15 : 0;
    
    return {
      type: 'airport',
      code,
      name: getAirportName(code),
      status: status === 'on_time' ? 'ok' : status === 'delayed' ? 'warning' : 'critical',
      delay,
      emoji: FLIGHT_STATUS[status as keyof typeof FLIGHT_STATUS]?.emoji || '❓',
      lastUpdated: new Date().toISOString(),
    };
  });
}

function getAirportName(code: string): string {
  const names: Record<string, string> = {
    MAD: 'Madrid-Barajas', BCN: 'Barcelona-El Prat', AGP: 'Málaga',
    ALC: 'Alicante', PMI: 'Palma Mallorca', LHR: 'Heathrow London',
    CDG: 'Paris Charles de Gaulle', FRA: 'Frankfurt', AMS: 'Amsterdam Schiphol',
    JFK: 'JFK New York', LAX: 'Los Angeles', ORD: "O'Hare Chicago",
  };
  return names[code] || `${code} Airport`;
}

function generateTrainAlerts() {
  const countries = ['ES', 'DE', 'FR', 'UK', 'IT'];
  const trains: any[] = [];
  
  for (const country of countries) {
    const statuses = ['on_time', 'delayed', 'on_time', 'on_time'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const delay = status === 'delayed' ? Math.floor(Math.random() * 45) + 5 : 0;
    
    trains.push({
      type: 'train',
      country,
      status: status === 'on_time' ? 'ok' : 'warning',
      delay,
      emoji: status === 'on_time' ? '✅' : '⚠️',
    });
  }
  return trains;
}

function getCountryCoords(code: string): [number, number] | null {
  const coords: Record<string, [number, number]> = {
    ES: [40.416775, -3.703790], UK: [51.507400, -0.127800],
    FR: [48.856600, 2.352200], DE: [52.520000, 13.405000],
    IT: [41.902800, 12.596400], GR: [37.983800, 23.727500],
    US: [38.907200, -77.036900], TR: [39.933400, 32.859700],
  };
  return coords[code] || null;
}

async function fetchWeatherAlerts(country: string) {
  const coords = getCountryCoords(country);
  if (!coords) return [];
  
  try {
    const res = await fetch(
      `${OPEN_METEO}/forecast?latitude=${coords[0]}&longitude=${coords[1]}` +
      `&hourly=weather_code,temperature_2m_max,wind_speed_10m_max&forecast_days=2&timezone=auto`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const alerts: any[] = [];
    const extremeCodes = [61, 63, 65, 71, 73, 80, 82, 95, 96, 99];
    
    for (let i = 0; i < Math.min(24, data.hourly?.time?.length || 0); i++) {
      const code = data.hourly?.weather_code?.[i] || 0;
      if (extremeCodes.includes(code) || code >= 71) {
        alerts.push({
          type: 'weather',
          country,
          code,
          temp: data.hourly?.temperature_2m_max?.[i],
          emoji: getWeatherEmoji(code),
          level: code >= 80 ? 'critical' : code >= 61 ? 'warning' : 'low',
          lastUpdated: new Date().toISOString(),
        });
      }
    }
    return alerts;
  } catch {
    return [];
  }
}

function getWeatherEmoji(code: number): string {
  if (code >= 95) return '🌪️';
  if (code >= 80) return '🌧️';
  if (code >= 71) return '❄️';
  if (code >= 61) return '🌧️';
  if (code >= 45) return '🌫️';
  return '☀️';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  
  const [airports, trains, weather] = await Promise.all([
    generateAirportAlerts(),
    generateTrainAlerts(),
    fetchWeatherAlerts('ES'),
  ]);
  
  const allAlerts = [...airports, ...trains, ...weather];
  
  const grouped = {
    airports: airports.filter(a => a.status !== 'ok'),
    trains: trains.filter(t => t.status !== 'ok'),
    weather: weather.filter(w => w.level !== 'low'),
  };
  
  const summary = {
    total: allAlerts.length,
    critical: allAlerts.filter(a => a.status === 'critical' || a.level === 'critical').length,
    warning: allAlerts.filter(a => a.status === 'warning' || a.level === 'warning').length,
    ok: allAlerts.filter(a => a.status === 'ok' || a.level === 'ok').length,
  };

  if (type === 'summary') {
    return NextResponse.json({ summary, grouped: { critical: summary.critical, warning: summary.warning } });
  }

  if (type === 'airports') return NextResponse.json({ data: airports });
  if (type === 'trains') return NextResponse.json({ data: trains });
  if (type === 'weather') return NextResponse.json({ data: weather });

  return NextResponse.json({
    summary,
    grouped,
    allAlerts,
    timestamp: new Date().toISOString(),
  });
}