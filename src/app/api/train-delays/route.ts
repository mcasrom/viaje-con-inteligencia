import { NextResponse } from 'next/server';

const TRAINS_BASE = 'https://trainstracking.com/api';

function getCountryInfo(country: string) {
  const info: Record<string, { name: string, stations: string[] }> = {
    germany: { name: 'Alemania', stations: ['Berlin HBF', 'Munich HBF', 'Frankfurt HBF', 'Hamburg HBF'] },
    ireland: { name: 'Irlanda', stations: ['Dublin Heuston', 'Dublin Connolly'] },
    austria: { name: 'Austria', stations: ['Vienna HBF', 'Salzburg HBF'] },
    netherlands: { name: 'Paises Bajos', stations: ['Amsterdam Centraal', 'Rotterdam Centraal'] },
    sweden: { name: 'Suecia', stations: ['Stockholm Central', 'Göteborg Central'] },
    norway: { name: 'Noruega', stations: ['Oslo S', 'Bergen'] },
    denmark: { name: 'Dinamarca', stations: ['Copenhagen Central'] },
    spain: { name: 'España', stations: ['Madrid Atocha', 'Barcelona Sants', 'Sevilla Santa Justa'] },
    italy: { name: 'Italia', stations: ['Roma Termini', 'Milano Centrale'] },
    france: { name: 'Francia', stations: ['Paris Gare du Nord', 'Paris Lyon'] },
  };
  return info[country] || { name: country, stations: ['Main Station'] };
}

function generateMockTrains(country: string) {
  const statuses = ['on_time', 'delayed', 'cancelled', 'on_time', 'on_time', 'delayed'];
  const stations = getCountryInfo(country).stations;
  
  return Array.from({ length: Math.min(stations.length * 2, 10) }, (_, i) => {
    const origin = stations[i % stations.length];
    const dest = stations[(i + 1) % stations.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const delay = status === 'delayed' ? Math.floor(Math.random() * 45) + 5 : 0;
    
    return {
      id: `${country.toUpperCase()}-${1000 + i}`,
      trainCode: `ICE/AVE ${100 + i}`,
      origin,
      destination: dest,
      scheduledTime: new Date(Date.now() + i * 1800000).toISOString(),
      delay: delay,
      status: status === 'cancelled' ? 'cancelled' : status === 'delayed' ? 'delayed' : 'on_time',
      platform: `${Math.floor(Math.random() * 20) + 1}`,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'all';
  const format = searchParams.get('format') || 'json';

  let countries: string[];
  
  if (country === 'all') {
    countries = ['germany', 'spain', 'france', 'netherlands', 'austria', 'italy'];
  } else {
    countries = [country.toLowerCase()];
  }

  const allTrains: any[] = [];
  
  for (const c of countries) {
    const trains = generateMockTrains(c);
    allTrains.push(...trains.map((t: any) => ({ ...t, country: c })));
  }

  if (format === 'text') {
    const lines = allTrains.map(t => 
      `${t.country.toUpperCase()} ${t.trainCode}: ${t.status === 'on_time' ? '✅' : `⚠️ ${t.delay}min`} ${t.origin} → ${t.destination}`
    );
    return NextResponse.json({
      text: lines.join('\n'),
      trains: allTrains.length,
    });
  }

  const summary = {
    total: allTrains.length,
    onTime: allTrains.filter(t => t.status === 'on_time').length,
    delayed: allTrains.filter(t => t.status === 'delayed').length,
    cancelled: allTrains.filter(t => t.status === 'cancelled').length,
    avgDelay: Math.round(
      allTrains.reduce((sum, t) => sum + (t.delay || 0), 0) / allTrains.length
    ),
    countries: countries.map(c => ({
      code: c,
      name: getCountryInfo(c).name,
    })),
  };

  return NextResponse.json({
    summary,
    data: allTrains,
    source: 'TrainsTracking API (mock)',
    timestamp: new Date().toISOString(),
  });
}