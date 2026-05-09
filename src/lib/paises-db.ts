import { supabaseAdmin } from '@/lib/supabase-admin';
import type { DatoPais, NivelRiesgo, EmergenciasPais } from '@/data/paises';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
let cache: { data: Map<string, DatoPais>; emergencias: Map<string, EmergenciasPais>; ts: number } | null = null;

function getAdmin() {
  try { return supabaseAdmin; } catch { return null; }
}

function mapRowToDatoPais(row: any): DatoPais {
  return {
    codigo: row.codigo,
    nombre: row.nombre,
    capital: row.capital || '',
    continente: row.continente || '',
    idioma: row.data?.idioma || '',
    moneda: row.data?.moneda || '',
    tipoCambio: row.data?.tipoCambio || '',
    zonaHoraria: row.data?.zonaHoraria || '',
    conduccion: row.data?.conduccion || 'derecha',
    poblacion: row.data?.poblacion || '',
    pib: row.data?.pib || '',
    indicadores: row.data?.indicadores || { ipc: '', indicePrecios: '' },
    voltaje: row.data?.voltaje || '',
    prefijoTelefono: row.data?.prefijoTelefono || '',
    nivelRiesgo: row.nivel_riesgo as NivelRiesgo,
    ultimoInforme: row.ultimo_informe || '',
    contactos: row.data?.contactos || [],
    requerimientos: row.data?.requerimientos || [],
    queHacer: row.data?.queHacer || [],
    queNoHacer: row.data?.queNoHacer || [],
    diarios: row.data?.diarios || [],
    urlsUtiles: row.data?.urlsUtiles || [],
    bandera: row.bandera || '',
    mapaCoordenadas: row.data?.mapaCoordenadas || [0, 0],
    transporte: row.data?.transporte,
    turisticos: row.data?.turisticos,
    economicos: row.data?.economicos,
    visible: row.visible !== false,
  };
}

export async function getAllPaisesFromDB(): Promise<DatoPais[]> {
  const admin = getAdmin();
  if (!admin) return [];
  const { data } = await admin.from('paises').select('*').eq('visible', true).order('nombre');
  return (data || []).map(mapRowToDatoPais);
}

export async function getPaisFromDB(codigo: string): Promise<DatoPais | null> {
  const admin = getAdmin();
  if (!admin) return null;
  const { data } = await admin.from('paises').select('*').eq('codigo', codigo.toLowerCase()).single();
  if (!data) return null;
  const pais = mapRowToDatoPais(data);
  return pais.visible !== false ? pais : null;
}

export async function getPaisesPorRiesgoFromDB(nivel: NivelRiesgo): Promise<DatoPais[]> {
  const admin = getAdmin();
  if (!admin) return [];
  const { data } = await admin.from('paises').select('*').eq('nivel_riesgo', nivel).eq('visible', true);
  return (data || []).map(mapRowToDatoPais);
}

export async function getPaisesPorContinenteFromDB(continente: string): Promise<DatoPais[]> {
  const admin = getAdmin();
  if (!admin) return [];
  const { data } = await admin.from('paises').select('*').eq('continente', continente).eq('visible', true);
  return (data || []).map(mapRowToDatoPais);
}

export async function getEmergenciasFromDB(codigo: string): Promise<EmergenciasPais | null> {
  const admin = getAdmin();
  if (!admin) return null;
  const { data } = await admin.from('emergencias').select('*').eq('codigo', codigo.toLowerCase()).single();
  if (!data) return null;
  return { general: data.general, policia: data.policia, bomberos: data.bomberos, ambulancia: data.ambulancia };
}

// In-memory cache with TTL
export async function loadAllPaisesToCache(): Promise<{ data: Map<string, DatoPais>; emergencias: Map<string, EmergenciasPais> } | null> {
  const admin = getAdmin();
  if (!admin) return null;

  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache;

  const [paisesRes, emergenciasRes] = await Promise.all([
    admin.from('paises').select('*'),
    admin.from('emergencias').select('*'),
  ]);

  const paisesMap = new Map<string, DatoPais>();
  for (const row of (paisesRes.data || [])) {
    const pais = mapRowToDatoPais(row);
    paisesMap.set(row.codigo, pais);
  }

  const emergenciasMap = new Map<string, EmergenciasPais>();
  for (const row of (emergenciasRes.data || [])) {
    emergenciasMap.set(row.codigo, { general: row.general, policia: row.policia, bomberos: row.bomberos, ambulancia: row.ambulancia });
  }

  cache = { data: paisesMap, emergencias: emergenciasMap, ts: Date.now() };
  return cache;
}

export function invalidateCache() {
  cache = null;
}
