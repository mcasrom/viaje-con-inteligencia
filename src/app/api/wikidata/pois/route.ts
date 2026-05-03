import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COUNTRY_WIKIDATA: Record<string, string> = {
  es: 'wd:Q29', fr: 'wd:Q142', gb: 'wd:Q145', de: 'wd:Q183', it: 'wd:Q38',
  pt: 'wd:Q45', nl: 'wd:Q55', be: 'wd:Q31', gr: 'wd:Q41', ie: 'wd:Q27',
  at: 'wd:Q40', ch: 'wd:Q39', pl: 'wd:Q36', cz: 'wd:Q213', ro: 'wd:Q218',
  hu: 'wd:Q28', bg: 'wd:Q219', hr: 'wd:Q224', sk: 'wd:Q214', si: 'wd:Q215',
  dk: 'wd:Q35', no: 'wd:Q20', se: 'wd:Q34', fi: 'wd:Q33', is: 'wd:Q189',
  ee: 'wd:Q191', lv: 'wd:Q211', lt: 'wd:Q37', ru: 'wd:Q159', ua: 'wd:Q212',
  tr: 'wd:Q43', eg: 'wd:Q79', ma: 'wd:Q1028', dz: 'wd:Q262', tn: 'wd:Q948',
  za: 'wd:Q258', ke: 'wd:Q114', ng: 'wd:Q1033', gh: 'wd:Q117', et: 'wd:Q115',
  mx: 'wd:Q96', ar: 'wd:Q414', br: 'wd:Q155', co: 'wd:Q739', pe: 'wd:Q419',
  cl: 'wd:Q298', ec: 'wd:Q736', ve: 'wd:Q717', uy: 'wd:Q77', py: 'wd:Q733',
  bo: 'wd:Q750', pa: 'wd:Q804', cr: 'wd:Q800', gt: 'wd:Q774',
  do: 'wd:Q786', pr: 'wd:Q1183', jm: 'wd:Q766', tt: 'wd:Q754',
  jp: 'wd:Q17', kr: 'wd:Q884', cn: 'wd:Q148', in: 'wd:Q668', th: 'wd:Q869',
  vn: 'wd:Q881', id: 'wd:Q252', ph: 'wd:Q928', my: 'wd:Q833', sg: 'wd:Q334',
  au: 'wd:Q408', nz: 'wd:Q664',
  us: 'wd:Q30', ca: 'wd:Q16',
  sa: 'wd:Q851', ae: 'wd:Q878', il: 'wd:Q801', jo: 'wd:Q810',
  iq: 'wd:Q796', ir: 'wd:Q794', pk: 'wd:Q843', bd: 'wd:Q902',
  lk: 'wd:Q854', np: 'wd:Q837', af: 'wd:Q889',
  cy: 'wd:Q229', mt: 'wd:Q233', lu: 'wd:Q32', ad: 'wd:Q228',
  mc: 'wd:Q235', sm: 'wd:Q238', va: 'wd:Q237',
};

function buildQuery(country: string, type: string, limit: number): string | null {
  const countryItem = COUNTRY_WIKIDATA[country.toLowerCase()];
  if (!countryItem) return null;

  let typeFilter = '';
  switch (type) {
    case 'museum':
      typeFilter = '?item wdt:P31/wdt:P279* wd:Q33506.';
      break;
    case 'heritage':
      typeFilter = `
        { ?item wdt:P31/wdt:P279* wd:Q23424. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q16560. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q133056. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q585219. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q1789245. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q839955. }
      `;
      break;
    case 'lighthouse':
      typeFilter = '?item wdt:P31/wdt:P279* wd:Q39730.';
      break;
    case 'beach':
      typeFilter = `
        { ?item wdt:P31/wdt:P279* wd:Q39130. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q219028. }
      `;
      break;
    case 'nature':
      typeFilter = `
        { ?item wdt:P31/wdt:P279* wd:Q1120719. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q16611. } UNION
        { ?item wdt:P31/wdt:P279* wd:Q3347286. }
      `;
      break;
    default:
      return null;
  }

  return `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?coords ?image WHERE {
      ${typeFilter}
      ?item wdt:P17 ${countryItem}.
      OPTIONAL { ?item wdt:P625 ?coords. }
      OPTIONAL { ?item wdt:P18 ?image. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en,[AUTO_LANGUAGE]". }
    }
    LIMIT ${limit}
  `;
}

function parseCoords(coordsStr: string | null): { lat: number; lon: number } | null {
  if (!coordsStr) return null;
  const match = coordsStr.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;
  return { lon: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

async function fetchFromWikidataSPARQL(country: string, type: string, limit: number) {
  const query = buildQuery(country, type, limit);
  if (!query) return [];

  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0 (https://viajeinteligencia.com; mailto:contacto@viajeinteligencia.com)' },
    });

    if (!res.ok) {
      console.error('Wikidata SPARQL HTTP error:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    const bindings = data.results?.bindings || [];

    return bindings
      .map((b: any) => {
        const coords = parseCoords(b.coords?.value);
        return {
          name: b.itemLabel?.value || '',
          description: b.itemDescription?.value || '',
          lat: coords?.lat,
          lon: coords?.lon,
          image: b.image?.value || null,
          url: b.item?.value || null,
        };
      })
      .filter((p: any) => p.name && p.lat && p.lon);
  } catch (e) {
    console.error('Wikidata SPARQL error:', e);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = (searchParams.get('country') || 'es').toLowerCase();
  const type = searchParams.get('type') || 'museum';
  const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 30);

  const pois = await fetchFromWikidataSPARQL(country, type, limit);

  return NextResponse.json({
    source: pois.length > 0 ? 'wikidata-sparql' : 'none',
    sourceUrl: 'https://query.wikidata.org',
    license: 'CC0',
    query: { country, type, limit },
    count: pois.length,
    pois,
  });
}
