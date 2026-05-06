import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

export interface INECountryData {
  arrivals: number;
  pernoctaciones: number;
  estanciaMedia: number;
  source: string;
}

const FALLBACK_DATA: Record<string, INECountryData> = {
  es: { arrivals: 85000000, pernoctaciones: 272000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  fr: { arrivals: 100000000, pernoctaciones: 430000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  us: { arrivals: 67000000, pernoctaciones: 450000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  it: { arrivals: 57000000, pernoctaciones: 210000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
  tr: { arrivals: 55000000, pernoctaciones: 190000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  mx: { arrivals: 42000000, pernoctaciones: 142000000, estanciaMedia: 6.5, source: 'INE/UNWTO' },
  gb: { arrivals: 38000000, pernoctaciones: 143000000, estanciaMedia: 7.1, source: 'INE/UNWTO' },
  de: { arrivals: 33000000, pernoctaciones: 98000000, estanciaMedia: 5.8, source: 'INE/UNWTO' },
  gr: { arrivals: 33000000, pernoctaciones: 95000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  pt: { arrivals: 25000000, pernoctaciones: 82000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  th: { arrivals: 28000000, pernoctaciones: 98000000, estanciaMedia: 10.2, source: 'INE/UNWTO' },
  jp: { arrivals: 25000000, pernoctaciones: 90000000, estanciaMedia: 8.5, source: 'INE/UNWTO' },
  cn: { arrivals: 29000000, pernoctaciones: 105000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  in: { arrivals: 18000000, pernoctaciones: 52000000, estanciaMedia: 11.5, source: 'INE/UNWTO' },
  eg: { arrivals: 14000000, pernoctaciones: 42000000, estanciaMedia: 9.2, source: 'INE/UNWTO' },
  ma: { arrivals: 13000000, pernoctaciones: 38000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  au: { arrivals: 9500000, pernoctaciones: 38000000, estanciaMedia: 10.2, source: 'INE/UNWTO' },
  ca: { arrivals: 23000000, pernoctaciones: 76000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  br: { arrivals: 6600000, pernoctaciones: 21000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  ar: { arrivals: 5700000, pernoctaciones: 15000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  kr: { arrivals: 17500000, pernoctaciones: 52000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
  vn: { arrivals: 16000000, pernoctaciones: 48000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  id: { arrivals: 15500000, pernoctaciones: 52000000, estanciaMedia: 10.5, source: 'INE/UNWTO' },
  nl: { arrivals: 22000000, pernoctaciones: 72000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  ch: { arrivals: 6200000, pernoctaciones: 19000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  pl: { arrivals: 21000000, pernoctaciones: 65000000, estanciaMedia: 6.2, source: 'INE/UNWTO' },
  se: { arrivals: 7000000, pernoctaciones: 21000000, estanciaMedia: 6.5, source: 'INE/UNWTO' },
  no: { arrivals: 6400000, pernoctaciones: 18500000, estanciaMedia: 6.2, source: 'INE/UNWTO' },
  hr: { arrivals: 17000000, pernoctaciones: 52000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  at: { arrivals: 31000000, pernoctaciones: 105000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  cz: { arrivals: 12000000, pernoctaciones: 38000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'Reino Unido': 'gb',
  'Francia': 'fr',
  'Alemania': 'de',
  'Italia': 'it',
  'Portugal': 'pt',
  'Países Bajos': 'nl',
  'Holanda': 'nl',
  'Suecia': 'se',
  'Bélgica': 'be',
  'Irlanda': 'ie',
  'Suiza': 'ch',
  'Noruega': 'no',
  'EE.UU.': 'us',
  'Estados Unidos': 'us',
  'China': 'cn',
  'Japón': 'jp',
  'Brasil': 'br',
  'Argentina': 'ar',
  'México': 'mx',
  'Canadá': 'ca',
  'Australia': 'au',
  'India': 'in',
  'Rusia': 'ru',
  'Corea del Sur': 'kr',
  'Polonia': 'pl',
  'Austria': 'at',
  'Grecia': 'gr',
  'Turquía': 'tr',
  'Tailandia': 'th',
  'Egipto': 'eg',
  'Marruecos': 'ma',
};

let cache: Record<string, INECountryData> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getINEData(): Promise<Record<string, INECountryData>> {
  const now = Date.now();

  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return cache;
  }

  if (!isSupabaseAdminConfigured()) {
    cache = FALLBACK_DATA;
    cacheTimestamp = now;
    return FALLBACK_DATA;
  }

  try {
    const { data: countryData, error } = await supabaseAdmin
      .from('ine_country_history')
      .select('country, tourists, avg_stay')
      .order('date', { ascending: false })
      .limit(100);

    if (error || !countryData || countryData.length === 0) {
      cache = FALLBACK_DATA;
      cacheTimestamp = now;
      return FALLBACK_DATA;
    }

    const result: Record<string, INECountryData> = { ...FALLBACK_DATA };

    for (const row of countryData) {
      const code = COUNTRY_NAME_TO_CODE[row.country]?.toLowerCase() || row.country.toLowerCase();

      if (result[code]) {
        result[code] = {
          arrivals: row.tourists,
          pernoctaciones: Math.round(row.tourists * (row.avg_stay || 7)),
          estanciaMedia: row.avg_stay || 7,
          source: 'INE-live',
        };
      } else {
        result[code] = {
          arrivals: row.tourists,
          pernoctaciones: Math.round(row.tourists * (row.avg_stay || 7)),
          estanciaMedia: row.avg_stay || 7,
          source: 'INE-live',
        };
      }
    }

    cache = result;
    cacheTimestamp = now;
    return result;
  } catch {
    cache = FALLBACK_DATA;
    cacheTimestamp = now;
    return FALLBACK_DATA;
  }
}

export async function getLatestINEData(): Promise<{
  totalTourists: number;
  variation: number;
  totalSpend: number;
  avgPerTourist: number;
  avgDaily: number;
  avgStay: number;
  date: string;
  source: string;
} | null> {
  if (!isSupabaseAdminConfigured()) return null;

  try {
    const { data } = await supabaseAdmin
      .from('ine_tourism_history')
      .select('date, total_tourists, variation, total_spend, avg_per_tourist, avg_daily, avg_stay, source')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    return {
      totalTourists: data.total_tourists,
      variation: data.variation,
      totalSpend: data.total_spend,
      avgPerTourist: data.avg_per_tourist,
      avgDaily: data.avg_daily,
      avgStay: data.avg_stay,
      date: data.date,
      source: data.source,
    };
  } catch {
    return null;
  }
}

export async function invalidateINECache() {
  cache = null;
  cacheTimestamp = 0;
}
