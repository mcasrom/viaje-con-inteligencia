import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fallback data cuando OSM falla
const staticPOIs: Record<string, Record<string, Array<{name: string; lat: number; lon: number}>>> = {
  es: {
    lighthouse: [
      { name: 'Faro de Cabo Finisterre', lat: 42.8833, lon: -9.2667 },
      { name: 'Faro de Gando', lat: 27.9447, lon: -15.3761 },
      { name: 'Faro de Punta Orchilla', lat: 27.8497, lon: -17.9144 },
      { name: 'Faro de Tarifa', lat: 36.0022, lon: -5.6069 },
      { name: 'Faro de Cabo Peñas', lat: 43.6467, lon: -5.8553 },
    ],
    beach: [
      { name: 'Playa de la Concha', lat: 43.3269, lon: -1.9831 },
      { name: 'Playa de los大唐es', lat: 36.7131, lon: -3.4417 },
      { name: 'Playa de Cala Millor', lat: 39.6075, lon: 3.3803 },
      { name: 'Playa de la Mar Bella', lat: 37.2333, lon: -6.8833 },
    ],
    museum: [
      { name: 'Museo del Prado', lat: 40.4138, lon: -3.6921 },
      { name: 'Museo Thyssen', lat: 40.4156, lon: -3.6924 },
      { name: 'Museo Reina Sofía', lat: 40.4078, lon: -3.6919 },
    ],
    castle: [
      { name: 'Alcázar de Segovia', lat: 40.9486, lon: -4.1184 },
      { name: 'Alhambra', lat: 37.1760, lon: -3.5881 },
      { name: 'Castillo de Peñafiel', lat: 41.5939, lon: -4.1165 },
    ],
  },
  fr: {
    lighthouse: [
      { name: 'Phare de La Jument', lat: 48.8544, lon: -2.4317 },
      { name: 'Phare de Créac', lat: 47.6489, lon: -3.4942 },
    ],
    beach: [
      { name: 'Plage de Nice', lat: 43.6961, lon: 7.2714 },
      { name: 'Plage de Cannes', lat: 43.5523, lon: 7.0172 },
    ],
    museum: [
      { name: 'Louvre', lat: 48.8606, lon: 2.3376 },
      { name: 'Musée d\'Orsay', lat: 48.8600, lon: 2.3266 },
    ],
    castle: [
      { name: 'Château de Versailles', lat: 48.8049, lon: 2.1204 },
      { name: 'Château de Mont-Saint-Michel', lat: 48.6361, lon: -1.5114 },
    ],
  },
  it: {
    lighthouse: [
      { name: 'Faro di Capo Rizzuto', lat: 38.9225, lon: 17.0822 },
    ],
    beach: [
      { name: 'Spiaggia Rimini', lat: 44.0633, lon: 12.5654 },
    ],
    museum: [
      { name: 'Musei Vaticani', lat: 41.9042, lon: 12.4536 },
      { name: 'Uffizi', lat: 43.7687, lon: 11.2551 },
    ],
    castle: [
      { name: 'Castello Sforzesco', lat: 45.4654, lon: 9.1852 },
    ],
  },
  pt: {
    lighthouse: [
      { name: 'Faro de Sagres', lat: 37.0108, lon: -8.9408 },
    ],
    beach: [
      { name: 'Praia de Nazaré', lat: 39.6008, lon: -9.0708 },
    ],
    castle: [
      { name: 'Castelo de São Jorge', lat: 38.7137, lon: -9.1334 },
    ],
  },
  mx: {
    lighthouse: [
      { name: 'Faro de Progresso', lat: 21.2817, lon: -89.6658 },
    ],
    beach: [
      { name: 'Playa Cancún', lat: 21.1619, lon: -86.8515 },
    ],
    museum: [
      { name: 'Museo Antropología', lat: 19.4325, lon: -99.1334 },
    ],
    castle: [
      { name: 'Castillo San Felipe', lat: 19.8592, lon: -86.4408 },
    ],
  },
  jp: {
    lighthouse: [
      { name: 'Faro de Cape Nojima', lat: 35.2567, lon: 140.3086 },
    ],
    beach: [
      { name: 'Playa Shi', lat: 34.6892, lon: 135.4314 },
    ],
    museum: [
      { name: 'Museo Nacional Tokio', lat: 35.7156, lon: 139.7759 },
    ],
  },
  th: {
    lighthouse: [
      { name: 'Faro de Phuket', lat: 7.8829, lon: 98.4128 },
    ],
    beach: [
      { name: 'Patong Beach', lat: 7.8966, lon: 98.2967 },
    ],
  },
  us: {
    lighthouse: [
      { name: 'Cape Hatteras Lighthouse', lat: 35.2525, lon: -75.8335 },
    ],
    beach: [
      { name: 'Miami Beach', lat: 25.7907, lon: -80.1300 },
    ],
    museum: [
      { name: 'Metropolitan Museum', lat: 40.7794, lon: -73.9632 },
    ],
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = (searchParams.get('country') || 'es').toLowerCase();
  const type = searchParams.get('type') || 'lighthouse';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

  const validCountries = Object.keys(staticPOIs);
  const validTypes = ['lighthouse', 'beach', 'museum', 'castle'];

  if (!validCountries.includes(country)) {
    return NextResponse.json({
      error: 'País no soportado',
      validCountries,
    }, { status: 400 });
  }

  if (!validTypes.includes(type)) {
    return NextResponse.json({
      error: 'Tipo no válido',
      validTypes,
    }, { status: 400 });
  }

  const pois = staticPOIs[country]?.[type]?.slice(0, limit).map((p, i) => ({
    id: `${country}-${type}-${i}`,
    name: p.name,
    lat: p.lat,
    lon: p.lon,
    country: country.toUpperCase(),
  })) || [];

  return NextResponse.json({
    source: 'Wikidata fallback',
    sourceUrl: 'https://www.wikidata.org',
    license: 'CC0',
    query: { country, type, limit },
    validCountries: Object.keys(staticPOIs),
    validTypes,
    timestamp: new Date().toISOString(),
    count: pois.length,
    pois,
  });
}