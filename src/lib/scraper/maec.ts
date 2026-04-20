import { logScraperSuccess, logScraperWarning, logScraperError } from './audit';

const MAEC_BASE = 'https://www.exteriores.gob.es';
const CACHE_DURATION = 1000 * 60 * 60;
const SCRAPER_NAME = 'maec';

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

export async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ViajeConInteligencia/1.0',
        'Accept': 'text/html',
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    return await res.text();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export interface MAECCountryData {
  pais: string;
  nivelRiesgo: string;
  fechaActualizacion: string;
  enlaces: {
    fichaPdf: string;
    recomendaciones: string;
    embajada: string;
  };
  alertas: string[];
}

const countryNameMapping: Record<string, string> = {
  'es': 'España',
  'fr': 'Francia',
  'de': 'Alemania',
  'it': 'Italia',
  'pt': 'Portugal',
  'gb': 'Reino Unido',
  'us': 'Estados Unidos',
  'jp': 'Japón',
  'cn': 'China',
  'au': 'Australia',
  'br': 'Brasil',
  'ar': 'Argentina',
  'mx': 'México',
  'co': 'Colombia',
  'cl': 'Chile',
  'pe': 'Perú',
  've': 'Venezuela',
  'in': 'India',
  'ru': 'Rusia',
  'ua': 'Ucranía',
  'eg': 'Egipto',
  'za': 'Sudáfrica',
  'ma': 'Marruecos',
  'th': 'Tailandia',
  'vn': 'Vietnam',
  'kr': 'Corea',
  'id': 'Indonesia',
  'my': 'Malasia',
  'ph': 'Filipinas',
  'sg': 'Singapur',
  'ae': 'Emiratos Árabes Unidos',
  'sa': 'Arabia Saudí',
  'tr': 'Turquía',
  'gr': 'Grecia',
  'nl': 'Países Bajos',
  'be': 'Bélgica',
  'ch': 'Suiza',
  'at': 'Austria',
  'pl': 'Polonia',
  'se': 'Suecia',
  'no': 'Noruega',
  'dk': 'Dinamarca',
  'fi': 'Finlandia',
  'ie': 'Irlanda',
  'cz': 'República Checa',
  'hu': 'Hungría',
  'ro': 'Rumanía',
  'bg': 'Bulgaria',
  'hr': 'Croacia',
  'sk': 'Eslovaquia',
  'si': 'Eslovenia',
  'ee': 'Estonia',
  'lv': 'Letonia',
  'lt': 'Lituania',
  'ca': 'Canadá',
  'cu': 'Cuba',
  'do': 'República Dominicana',
  'gt': 'Guatemala',
  'cr': 'Costa Rica',
  'pa': 'Panama',
  'ec': 'Ecuador',
  'uy': 'Uruguay',
  'py': 'Paraguay',
  'bo': 'Bolivia',
};

function getCountrySpanishName(codigo: string): string {
  return countryNameMapping[codigo.toLowerCase()] || codigo;
}

export async function getMAECData(countryCode: string): Promise<MAECCountryData | null> {
  const cacheKey = `maec_${countryCode}`;
  const cached = getCached<MAECCountryData>(cacheKey);
  if (cached) return cached;

  const countryName = getCountrySpanishName(countryCode);
  
  try {
    const recomendacionesUrl = `${MAEC_BASE}/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=${encodeURIComponent(countryName)}`;
    const html = await fetchWithTimeout(recomendacionesUrl);
    
    let nivelRiesgo = 'desconocido';
    let alertas: string[] = [];
    let fechaActualizacion = '';

    const riesgoMatch = html.match(/nivel-riesgo["\s:]+(\w+)/i) || html.match(/class=["\s]*riesgo["\s]*[a-z]*["\s]*(\w+)/i);
    if (riesgoMatch) {
      const nivel = riesgoMatch[1].toLowerCase();
      if (nivel.includes('alto') || nivel.includes('rojo')) nivelRiesgo = 'alto';
      else if (nivel.includes('medio') || nivel.includes('naranja')) nivelRiesgo = 'medio';
      else if (nivel.includes('bajo') || nivel.includes('amarillo')) nivelRiesgo = 'bajo';
      else if (nivel.includes('verde')) nivelRiesgo = 'bajo';
    }

    const fechaMatch = html.match(/actualizaci[óo]n[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (fechaMatch) {
      fechaActualizacion = fechaMatch[1];
    }

    const alertMatch = html.match(/<h3[^>]*>(?:Alertas?|Avisos?)[^<]*<\/h3>([\s\S]*?)(?=<h3|<div[^>]*class)/i);
    if (alertMatch) {
      const alertsText = alertMatch[1];
      const alertItems = alertsText.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      alertas = alertItems.map(a => a.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    }

    const data: MAECCountryData = {
      pais: countryName,
      nivelRiesgo,
      fechaActualizacion: fechaActualizacion || new Date().toLocaleDateString('es-ES'),
      enlaces: {
        fichaPdf: `${MAEC_BASE}/Documents/FichasPais/${countryName.toUpperCase()}_FICHA%20PAIS.pdf`,
        recomendaciones: recomendacionesUrl,
        embajada: `${MAEC_BASE}/Embajadas/${countryName}`,
      },
      alertas,
    };

    setCache(cacheKey, data);
    logScraperSuccess(SCRAPER_NAME, `Datos obtenidos para ${countryName}`);
    return data;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logScraperError(SCRAPER_NAME, `Error al obtener datos de ${countryName}`, errorMsg);
    console.error(`Error fetching MAEC data for ${countryCode}:`, error);
    return null;
  }
}

export async function getAllMAECAlerts(): Promise<{ pais: string; nivelRiesgo: string; url: string }[]> {
  const alerts: { pais: string; nivelRiesgo: string; url: string }[] = [];
  
  const priorityCountries = ['ua', 'ru', 'il', 'ps', 'af', 'iq', 'sy', 'ye', 'ly', 'so', 'ss', 'mm', 've'];
  
  for (const code of priorityCountries) {
    const data = await getMAECData(code);
    if (data && (data.nivelRiesgo === 'alto' || data.nivelRiesgo === 'medio')) {
      alerts.push({
        pais: data.pais,
        nivelRiesgo: data.nivelRiesgo,
        url: data.enlaces.recomendaciones,
      });
    }
  }
  
  return alerts;
}