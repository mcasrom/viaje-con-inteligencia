import { createLogger } from '@/lib/logger';
import { logScraperSuccess, logScraperError } from './audit';

const log = createLogger('WB');

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

const IPC_DATA: WBIPCRow[] = [
  { country: 'Suiza', code: 'CH', ipc: 103.5, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Noruega', code: 'NO', ipc: 98.5, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Irlanda', code: 'IE', ipc: 95.3, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Islandia', code: 'IS', ipc: 93.2, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Luxemburgo', code: 'LU', ipc: 92.1, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Singapur', code: 'SG', ipc: 89.5, year: 2024, nivel: 'Extremo', region: 'Asia' },
  { country: 'Estados Unidos', code: 'US', ipc: 85.2, year: 2024, nivel: 'Extremo', region: 'Norteamérica' },
  { country: 'Dinamarca', code: 'DK', ipc: 84.2, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Australia', code: 'AU', ipc: 83.7, year: 2024, nivel: 'Extremo', region: 'Oceanía' },
  { country: 'Canadá', code: 'CA', ipc: 82.1, year: 2024, nivel: 'Extremo', region: 'Norteamérica' },
  { country: 'Suecia', code: 'SE', ipc: 79.5, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Países Bajos', code: 'NL', ipc: 78.3, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Austria', code: 'AT', ipc: 77.8, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Finlandia', code: 'FI', ipc: 76.2, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Alemania', code: 'DE', ipc: 75.1, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Bélgica', code: 'BE', ipc: 74.8, year: 2024, nivel: 'Extremo', region: 'Europa' },
  { country: 'Nueva Zelandia', code: 'NZ', ipc: 73.2, year: 2024, nivel: 'Extremo', region: 'Oceanía' },
  { country: 'Japón', code: 'JP', ipc: 72.1, year: 2024, nivel: 'Alto', region: 'Asia' },
  { country: 'Reino Unido', code: 'GB', ipc: 71.5, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Francia', code: 'FR', ipc: 70.2, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Italia', code: 'IT', ipc: 68.9, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Corea del Sur', code: 'KR', ipc: 67.3, year: 2024, nivel: 'Alto', region: 'Asia' },
  { country: 'Israel', code: 'IL', ipc: 66.8, year: 2024, nivel: 'Alto', region: 'Oriente Medio' },
  { country: 'España', code: 'ES', ipc: 65.5, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Portugal', code: 'PT', ipc: 64.2, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Grecia', code: 'GR', ipc: 63.1, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Emiratos Árabes', code: 'AE', ipc: 62.5, year: 2024, nivel: 'Alto', region: 'Orient Medio' },
  { country: 'República Checa', code: 'CZ', ipc: 58.3, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Arabia Saudita', code: 'SA', ipc: 57.2, year: 2024, nivel: 'Alto', region: 'Orient Medio' },
  { country: 'Polonia', code: 'PL', ipc: 52.8, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Hungría', code: 'HU', ipc: 51.5, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Eslovenia', code: 'SI', ipc: 50.2, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'Chile', code: 'CL', ipc: 48.3, year: 2024, nivel: 'Alto', region: 'Latinoamérica' },
  { country: 'Eslovaquia', code: 'SK', ipc: 47.1, year: 2024, nivel: 'Alto', region: 'Europa' },
  { country: 'México', code: 'MX', ipc: 45.5, year: 2024, nivel: 'Medio', region: 'Latinoamérica' },
  { country: 'Turquía', code: 'TR', ipc: 44.2, year: 2024, nivel: 'Medio', region: 'Europa' },
  { country: 'China', code: 'CN', ipc: 43.8, year: 2024, nivel: 'Medio', region: 'Asia' },
  { country: 'Rusia', code: 'RU', ipc: 42.5, year: 2024, nivel: 'Medio', region: 'Europa' },
  { country: 'Sudáfrica', code: 'ZA', ipc: 41.2, year: 2024, nivel: 'Medio', region: 'África' },
  { country: 'Brasil', code: 'BR', ipc: 38.9, year: 2024, nivel: 'Medio', region: 'Latinoamérica' },
  { country: 'Tailandia', code: 'TH', ipc: 35.6, year: 2024, nivel: 'Medio', region: 'Asia' },
  { country: 'Rumanía', code: 'RO', ipc: 34.8, year: 2024, nivel: 'Medio', region: 'Europa' },
  { country: 'India', code: 'IN', ipc: 28.5, year: 2024, nivel: 'Medio', region: 'Asia' },
  { country: 'Indonesia', code: 'ID', ipc: 25.2, year: 2024, nivel: 'Medio', region: 'Asia' },
  { country: 'Colombia', code: 'CO', ipc: 23.8, year: 2024, nivel: 'Bajo', region: 'Latinoamérica' },
  { country: 'Filipinas', code: 'PH', ipc: 22.5, year: 2024, nivel: 'Bajo', region: 'Asia' },
  { country: 'Egipto', code: 'EG', ipc: 18.3, year: 2024, nivel: 'Bajo', region: 'África' },
  { country: 'Perú', code: 'PE', ipc: 17.2, year: 2024, nivel: 'Bajo', region: 'Latinoamérica' },
  { country: 'Marruecos', code: 'MA', ipc: 15.8, year: 2024, nivel: 'Bajo', region: 'África' },
  { country: 'Vietnam', code: 'VN', ipc: 14.5, year: 2024, nivel: 'Bajo', region: 'Asia' },
  { country: 'Argentina', code: 'AR', ipc: 12.3, year: 2024, nivel: 'Muy Bajo', region: 'Latinoamérica' },
  { country: 'Malasia', code: 'MY', ipc: 11.8, year: 2024, nivel: 'Muy Bajo', region: 'Asia' },
];

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
  
  const timeout = new Promise<WBIPCRow[]>((resolve) => {
    setTimeout(() => resolve([]), 5000);
  });
  
  const promises = codes.slice(0, 30).map(code => getWBIPC(code));
  const results = await Promise.race([
    Promise.all(promises),
    timeout
  ]);
  
  const filtered = results.filter((r): r is WBIPCRow => r !== null);
  const sorted = (filtered as WBIPCRow[]).sort((a, b) => b.ipc - a.ipc);
  
  setCache('all ipc', sorted);
  return sorted;
}