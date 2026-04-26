import { logScraperSuccess, logScraperError } from './audit';

const WB_API = 'https://api.worldbank.org/v2';
const CACHE_DURATION = 1000 * 60 * 60 * 24;
const SCRAPER_NAME = 'wb';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface WBIndicator {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

export interface WBIPCRow {
  country: string;
  code: string;
  ipc: number;
  year: number;
  nivel: string;
  region: string;
}

const nivelMap = (ipc: number): string => {
  if (ipc < 2) return 'Muy Bajo';
  if (ipc < 4) return 'Bajo';
  if (ipc < 6) return 'Medio';
  if (ipc < 10) return 'Alto';
  return 'Extremo';
};

const codeMap: Record<string, string> = {
  España: 'ES',
  Portugal: 'PT',
  Francia: 'FR',
  Italia: 'IT',
  Alemania: 'DE',
  'Reino Unido': 'GB',
  'Estados Unidos': 'US',
  México: 'MX',
  Brasil: 'BR',
  Argentina: 'AR',
  Chile: 'CL',
  Colombia: 'CO',
  Perú: 'PE',
  Japón: 'JP',
  China: 'CN',
  India: 'IN',
  Australia: 'AU',
  Canadá: 'CA',
  Rusia: 'RU',
  Turquía: 'TR',
  Grecia: 'GR',
  Polonia: 'PL',
  'Países Bajos': 'NL',
  'Bélgica': 'BE',
  Suiza: 'CH',
  Austria: 'AT',
  Suecia: 'SE',
  Noruega: 'NO',
  Dinamarca: 'DK',
  Finlandia: 'FI',
  Irlanda: 'IE',
  'República Checa': 'CZ',
  Hungría: 'HU',
  Rumanía: 'RO',
  Bulgaria: 'BG',
  Croacia: 'HR',
  Serbia: 'RS',
  Eslovenia: 'SI',
  Eslovaquia: 'SK',
  Luxemburgo: 'LU',
  Egipto: 'EG',
  Marruecos: 'MA',
  Túnez: 'TN',
  Sudáfrica: 'ZA',
  Nigeria: 'NG',
  Kenia: 'KE',
  Tailandia: 'TH',
  Vietnam: 'VN',
  Indonesia: 'ID',
  Malasia: 'MY',
  Filipinas: 'PH',
  Singapur: 'SG',
  'Corea del Sur': 'KR',
  'Emiratos Árabes Unidos': 'AE',
  'Arabia Saudita': 'SA',
  Israel: 'IL',
  'Nueva Zelandia': 'NZ',
};

const regionMap: Record<string, string> = {
  ES: 'Europa', PT: 'Europa', FR: 'Europa', IT: 'Europa', DE: 'Europa',
  GB: 'Europa', US: 'Norteamérica', MX: 'Latinoamérica', BR: 'Latinoamérica',
  AR: 'Latinoamérica', CL: 'Latinoamérica', CO: 'Latinoamérica', PE: 'Latinoamérica',
  JP: 'Asia', CN: 'Asia', IN: 'Asia', AU: 'Oceanía', CA: 'Norteamérica',
  RU: 'Europa', TR: 'Europa', GR: 'Europa', PL: 'Europa', NL: 'Europa',
  BE: 'Europa', CH: 'Europa', AT: 'Europa', SE: 'Europa', NO: 'Europa',
  DK: 'Europa', FI: 'Europa', IE: 'Europa', CZ: 'Europa', HU: 'Europa',
  RO: 'Europa', BG: 'Europa', HR: 'Europa', RS: 'Europa', SI: 'Europa',
  SK: 'Europa', LU: 'Europa', EG: 'África', MA: 'África', TN: 'África',
  ZA: 'África', NG: 'África', KE: 'África', TH: 'Asia', VN: 'Asia',
  ID: 'Asia', MY: 'Asia', PH: 'Asia', SG: 'Asia', KR: 'Asia',
  AE: 'Oriente Medio', SA: 'Oriente Medio', IL: 'Oriente Medio', NZ: 'Oceanía',
};

export async function getWBIPC(countryCode: string): Promise<WBIPCRow | null> {
  const cacheKey = `ipc ${countryCode}`;
  const cached = getCached<WBIPCRow>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${WB_API}/country/${countryCode}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1&date=2024`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WB API ${res.status}`);
    const json = await res.json();
    
    if (!json[1] || !json[1][0] || json[1][0].value === null) {
      return null;
    }
    
    const data: WBIndicator = json[1][0];
    const ipc = data.value;
    const country = data.country.value;
    const code = data.countryiso3code || countryCode;
    
    const result: WBIPCRow = {
      country,
      code,
      ipc: ipc ?? 0,
      year: parseInt(data.date),
      nivel: nivelMap(ipc ?? 0),
      region: regionMap[code] || 'Otro',
    };
    
    setCache(cacheKey, result);
    logScraperSuccess(SCRAPER_NAME, `IPC ${code}: ${ipc}%`);
    return result;
  } catch (error) {
    logScraperError(SCRAPER_NAME, `IPC ${countryCode}: ${error}`);
    return null;
  }
}

export async function getAllWBIPC(): Promise<WBIPCRow[]> {
  const cached = getCached<WBIPCRow[]>('all ipc');
  if (cached) return cached;

  const codes = Object.keys(codeMap);
  const results: WBIPCRow[] = [];
  
  for (const code of codes) {
    const data = await getWBIPC(code);
    if (data) results.push(data);
  }
  
  setCache('all ipc', results);
  return results;
}