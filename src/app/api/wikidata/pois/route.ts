import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COUNTRY_OSM: Record<string, string> = {
  es: 'Spain',
  fr: 'France', 
  gb: 'United Kingdom',
  de: 'Germany',
  it: 'Italy',
  gr: 'Greece',
  pt: 'Portugal',
  nl: 'Netherlands',
  be: 'Belgium',
  us: 'United States',
  mx: 'Mexico',
  jp: 'Japan',
  th: 'Thailand',
  ie: 'Ireland',
};

const TYPE_QUERY: Record<string, string> = {
  museum: '?item wdt:P31/wdt:P279* wd:Q33506.',
  castle: '?item wdt:P31/wdt:P279* wd:Q23424. ?item wdt:P131* ?region.',
  lighthouse: '?item wdt:P31/wdt:P279* wd:Q39730.',
  beach: '?item wdt:P31/wdt:P279* wd:Q39130.|?item wdt:P31/wdt:P279* wd:Q219028.',
};

async function fetchFromWikidataSPARQL(country: string, type: string, limit: number) {
  const countryName = COUNTRY_OSM[country.toLowerCase()] || country;
  const typeFilter = TYPE_QUERY[type] || TYPE_QUERY.museum;
  
  const query = `
    SELECT DISTINCT ?item ?itemLabel ?coords ?regionLabel WHERE {
      ${typeFilter}
      OPTIONAL { ?item wdt:P131 ?region. }
      OPTIONAL { ?item wdt:P625 ?coords. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
    }
    LIMIT ${limit}
  `;
  
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0' },
    });
    const data = await res.json();
    
    return data.results?.bindings?.map((b: any) => ({
      name: b.itemLabel?.value,
      lat: b.coords?.value?.lat,
      lon: b.coords?.value?.lon,
    })).filter((p: any) => p.lat && p.lon) || [];
  } catch (e) {
    console.error('Wikidata SPARQL error:', e);
    return [];
  }
}

const staticPOIs: Record<string, Record<string, Array<{name: string; lat: number; lon: number}>>> = {
  es: {
    lighthouse: [
      { name: 'Faro de Cabo Finisterre', lat: 42.8833, lon: -9.2667 },
      { name: 'Faro de Gando', lat: 27.9447, lon: -15.3761 },
      { name: 'Faro de Punta Orchilla', lat: 27.8497, lon: -17.9144 },
      { name: 'Faro de Tarifa', lat: 36.0022, lon: -5.6069 },
      { name: 'Faro de Cabo Peñas', lat: 43.6467, lon: -5.8553 },
      { name: 'Faro de Mouro', lat: 43.4689, lon: -3.0814 },
      { name: 'Faro de Capicorp', lat: 39.8725, lon: 3.0104 },
      { name: 'Faro de Sant Joan', lat: 41.2233, lon: 1.8431 },
      { name: 'Faro de Cadaqués', lat: 42.2881, lon: 3.3031 },
      { name: 'Faro de Estaca de Bares', lat: 43.7928, lon: -7.7114 },
      { name: 'Faro de Formentor', lat: 39.9558, lon: 3.1508 },
      { name: 'Faro de Maspalomas', lat: 27.7355, lon: -15.5856 },
      { name: 'Faro de Castro', lat: 43.3708, lon: -3.2108 },
      { name: 'Faro de Ribadesella', lat: 43.4656, lon: -5.0597 },
      { name: 'Faro de SantaMaría', lat: 39.5347, lon: 2.7264 },
    ],
    beach: [
      { name: 'Playa de la Concha', lat: 43.3269, lon: -1.9831 },
      { name: 'Playa de los大唐es', lat: 36.7131, lon: -3.4417 },
      { name: 'Playa de Cala Millor', lat: 39.6075, lon: 3.3803 },
      { name: 'Playa de la Mar Bella', lat: 37.2333, lon: -6.8833 },
      { name: 'Playa de Rodas', lat: 42.2361, lon: -8.8086 },
      { name: 'Playa del Silencio', lat: 43.5447, lon: -6.9325 },
      { name: 'Playa de Olette', lat: 42.5394, lon: 3.1183 },
      { name: 'Playa de Cofete', lat: 28.0778, lon: -14.5092 },
      { name: 'Playa de los Cristianos', lat: 28.0672, lon: -16.6357 },
      { name: 'Playa de Maspalomas', lat: 27.7600, lon: -15.5861 },
      { name: 'Playa de la Barrosa', lat: 36.3689, lon: -6.1628 },
      { name: 'Playa de Torimbia', lat: 43.5447, lon: -4.9008 },
      { name: 'Playa de Gulpiliers', lat: 37.6253, lon: -0.7225 },
      { name: 'Playa de Benicassim', lat: 40.0583, lon: 0.0614 },
      { name: 'Playa de Zarautz', lat: 43.2828, lon: -2.1742 },
    ],
    museum: [
      { name: 'Museo del Prado', lat: 40.4138, lon: -3.6921 },
      { name: 'Museo Thyssen', lat: 40.4156, lon: -3.6924 },
      { name: 'Museo Reina Sofía', lat: 40.4078, lon: -3.6919 },
      { name: 'Museo Guggenheim Bilbao', lat: 43.2686, lon: -2.9844 },
      { name: 'Museo Picasso Málaga', lat: 36.7218, lon: -4.4217 },
      { name: 'Museo de Ciencias Valencia', lat: 39.4092, lon: -0.5283 },
      { name: 'Museo Arqueológico Nacional', lat: 40.4058, lon: -3.6922 },
      { name: 'Museo Dalí Figueres', lat: 42.2664, lon: 3.0128 },
      { name: 'CaixaForum Madrid', lat: 40.4203, lon: -3.6949 },
      { name: 'Museo de Andalucía', lat: 37.3924, lon: -5.9942 },
    ],
    castle: [
      { name: 'Alcázar de Segovia', lat: 40.9486, lon: -4.1184 },
      { name: 'Alhambra', lat: 37.176, lon: -3.5881 },
      { name: 'Castillo de Peñafiel', lat: 41.5939, lon: -4.1165 },
      { name: 'Castillo de Gibralfaro', lat: 36.7217, lon: -4.4058 },
      { name: 'Alcázar de Sevilla', lat: 37.3828, lon: -5.9928 },
      { name: 'Castillo de Krak', lat: 37.6042, lon: -2.8717 },
      { name: 'Castillo de Bellver', lat: 39.6219, lon: 2.6208 },
      { name: 'Castillo de San Servando', lat: 39.8586, lon: -4.0225 },
      { name: 'Alcázar de Toledo', lat: 39.8581, lon: -4.0186 },
      { name: 'Castillo de Montjuïc', lat: 41.3633, lon: 2.1628 },
    ],
  },
  fr: {
    lighthouse: [
      { name: 'Phare de La Jument', lat: 48.8544, lon: -2.4317 },
      { name: 'Phare de Créac', lat: 47.6489, lon: -3.4942 },
      { name: 'Phare d\'Eckmühl', lat: 47.7958, lon: -4.3333 },
      { name: 'Phare de La Vieille', lat: 48.0325, lon: -5.1392 },
      { name: 'Phare de La Planier', lat: 43.1964, lon: 5.2311 },
    ],
    beach: [
      { name: 'Plage de Nice', lat: 43.6961, lon: 7.2714 },
      { name: 'Plage de Cannes', lat: 43.5523, lon: 7.0172 },
      { name: 'Plage de Biarritz', lat: 43.5114, lon: -1.5547 },
      { name: 'Plage de Deauville', lat: 49.3658, lon: 0.0644 },
      { name: 'Plage de Saint-Tropez', lat: 43.2692, lon: 6.6394 },
    ],
    museum: [
      { name: 'Louvre', lat: 48.8606, lon: 2.3376 },
      { name: 'Musée d\'Orsay', lat: 48.86, lon: 2.3266 },
      { name: 'Musée de l\'Orangerie', lat: 48.8536, lon: 2.3222 },
      { name: 'Centre Pompidou', lat: 48.8606, lon: 2.3522 },
      { name: 'Musée du Quai Branly', lat: 48.8544, lon: 2.3164 },
    ],
    castle: [
      { name: 'Château de Versailles', lat: 48.8049, lon: 2.1204 },
      { name: 'Château de Mont-Saint-Michel', lat: 48.6361, lon: -1.5114 },
      { name: 'Château de Chambord', lat: 47.6161, lon: 1.517 },
      { name: 'Château de Chenonceau', lat: 47.3253, lon: 1.1736 },
      { name: 'Château de Fontainebleau', lat: 48.402, lon: 2.6989 },
    ],
  },
  gb: {
    lighthouse: [
      { name: 'Eddystone Lighthouse', lat: 50.1774, lon: -4.1353 },
      { name: 'Lizard Point Lighthouse', lat: 49.9704, lon: -5.2046 },
      { name: 'Needles Lighthouse', lat: 50.6599, lon: -1.8573 },
      { name: 'Whitby Lighthouse', lat: 54.5397, lon: -0.636 },
      { name: 'Dungeness Lighthouse', lat: 50.9186, lon: 0.9642 },
    ],
    beach: [
      { name: 'Brighton Beach', lat: 50.8225, lon: -0.1372 },
      { name: 'Bournemouth Beach', lat: 50.7192, lon: -1.8782 },
      { name: 'Blackpool Beach', lat: 53.8104, lon: -3.0557 },
      { name: 'Whitby Beach', lat: 54.4886, lon: -0.6139 },
      { name: 'Cornwall Beach', lat: 50.2667, lon: -5.5167 },
    ],
    museum: [
      { name: 'British Museum', lat: 51.5194, lon: -0.127 },
      { name: 'Natural History Museum', lat: 51.4964, lon: -0.1762 },
      { name: 'V&A Museum', lat: 51.498, lon: -0.1731 },
      { name: 'Science Museum', lat: 51.4978, lon: -0.1764 },
      { name: 'National Gallery', lat: 51.5089, lon: -0.1283 },
    ],
    castle: [
      { name: 'Tower of London', lat: 51.5081, lon: -0.0759 },
      { name: 'Windsor Castle', lat: 51.4844, lon: -0.6069 },
      { name: 'Edinburgh Castle', lat: 55.9486, lon: -3.1991 },
      { name: 'Alnwick Castle', lat: 55.4158, lon: -1.7061 },
      { name: 'Warwick Castle', lat: 52.2825, lon: -1.5847 },
    ],
  },
  us: {
    lighthouse: [
      { name: 'Cape Hatteras Lighthouse', lat: 35.2525, lon: -75.8335 },
      { name: 'Statue of Liberty', lat: 40.6892, lon: -74.0445 },
      { name: 'Cape Cod Lighthouse', lat: 41.9108, lon: -69.9656 },
    ],
    beach: [
      { name: 'Miami Beach', lat: 25.7907, lon: -80.13 },
      { name: 'Waikiki Beach', lat: 21.2793, lon: -157.8292 },
      { name: 'Santa Monica Beach', lat: 34.0094, lon: -118.4972 },
    ],
    museum: [
      { name: 'Metropolitan Museum', lat: 40.7794, lon: -73.9632 },
      { name: 'Smithsonian', lat: 38.8881, lon: -77.0261 },
      { name: 'MoMA', lat: 40.7614, lon: -73.9776 },
    ],
    castle: [
      { name: 'Belmont Castle', lat: 45.6526, lon: -121.9336 },
      { name: 'Biltmore Estate', lat: 35.1347, lon: -82.467 },
      { name: 'Hearst Castle', lat: 36.6735, lon: -121.1683 },
    ],
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = (searchParams.get('country') || 'es').toLowerCase();
  const type = searchParams.get('type') || 'museum';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);
  const useSPARQL = searchParams.get('sparql') === 'true';

  const validCountries = [...new Set([...Object.keys(staticPOIs), ...Object.keys(COUNTRY_OSM)])];
  const validTypes = ['lighthouse', 'beach', 'museum', 'castle'];

  let pois: any[] = [];
  let source = 'none';

  if (useSPARQL) {
    const wikiData = await fetchFromWikidataSPARQL(country, type, limit);
    if (wikiData.length > 0) {
      pois = wikiData.map((p: any, i: number) => ({
        id: `${country}-${type}-${i}`,
        name: p.name,
        lat: p.lat,
        lon: p.lon,
        country: country.toUpperCase(),
      }));
      source = 'wikidata-sparql';
    }
  }

  if (pois.length === 0) {
    pois = staticPOIs[country]?.[type]?.slice(0, limit).map((p, i) => ({
      id: `${country}-${type}-${i}`,
      name: p.name,
      lat: p.lat,
      lon: p.lon,
      country: country.toUpperCase(),
    })) || [];
    source = pois.length > 0 ? 'static' : 'none';
  }

  return NextResponse.json({
    source,
    sourceUrl: source === 'static' ? 'https://www.wikidata.org' : 'https://query.wikidata.org',
    license: 'CC0',
    query: { country, type, limit, useSPARQL: useSPARQL },
    validCountries,
    validTypes,
    timestamp: new Date().toISOString(),
    count: pois.length,
    pois,
  });
}