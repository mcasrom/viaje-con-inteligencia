export type NivelRiesgo = 'sin-riesgo' | 'bajo' | 'medio' | 'alto' | 'muy-alto';

export interface ContactoOficial {
  tipo: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
}

export interface Requisito {
  categoria: string;
  icon: string;
  items: string[];
}

export interface Aeropuerto {
  nombre: string;
  iata: string;
  ciudad: string;
  tipo: 'internacional' | 'nacional' | 'carga';
}

export interface Puerto {
  nombre: string;
  ciudad: string;
  tipo: 'pasajeros' | 'carga' | 'pesquero' | 'yates';
}

export interface DatosTransporte {
  aeropuertos: Aeropuerto[];
  puertos: Puerto[];
  viasFerreas: string;
  carreteras: string;
  metro: boolean;
  trenAltaVelocidad: boolean;
  conduccion: 'derecha' | 'izquierda';
  licenciaES: boolean;
  seguroObligatorio: boolean;
  peajes: boolean;
}

export interface DatosTuristicos {
  turistasAnio: string;
  ingresosTurismo: string;
  principalesMercados: string[];
  estanciaMedia: string;
  temporadaAlta: string[];
  destinosPopulares: string[];
}

export interface DatosEconomicos {
  pib: string;
  pibPerCapita: string;
  poblacion: string;
  ipc: string;
  desempleo: string;
  moneda: string;
  tipoCambio: string;
}

export interface DatoPais {
  codigo: string;
  nombre: string;
  capital: string;
  continente: string;
  idioma: string;
  moneda: string;
  tipoCambio: string;
  zonaHoraria: string;
  conduccion: 'derecha' | 'izquierda';
  poblacion: string;
  pib: string;
  indicadores: {
    ipc: string;
    indicePrecios: string;
  };
  voltaje: string;
  prefijoTelefono: string;
  nivelRiesgo: NivelRiesgo;
  ultimoInforme: string;
  contactos: ContactoOficial[];
  requerimientos: Requisito[];
  queHacer: string[];
  queNoHacer: string[];
  diarios: { nombre: string; url: string }[];
  urlsUtiles: { nombre: string; url: string }[];
  bandera: string;
  mapaCoordenadas: [number, number];
  transporte?: DatosTransporte;
  turisticos?: DatosTuristicos;
  economicos?: DatosEconomicos;
  visible?: boolean;
}

export interface EmergenciasPais {
  general: string;
  policia: string;
  bomberos: string;
  ambulancia: string;
}

import rawData from './paises-data.json';

export const emergenciasData: Record<string, EmergenciasPais> = rawData.emergenciasData as unknown as Record<string, EmergenciasPais>;
export const paisesData: Record<string, DatoPais> = rawData.paisesData as unknown as Record<string, DatoPais>;

export const EMERGENCIA_FALLBACK: Record<string, EmergenciasPais> = {
  'Europa': { general: '112', policia: '112', bomberos: '112', ambulancia: '112' },
  'América': { general: '911', policia: '911', bomberos: '911', ambulancia: '911' },
  'Asia': { general: '112', policia: '110', bomberos: '119', ambulancia: '120' },
  'África': { general: '112', policia: '112', bomberos: '112', ambulancia: '112' },
  'Oceanía': { general: '112', policia: '112', bomberos: '112', ambulancia: '112' },
};

export function getPaisPorCodigo(codigo: string): DatoPais | undefined {
  const pais = paisesData[codigo.toLowerCase()];
  if (!pais || pais.visible === false) return undefined;
  return pais;
}

export function getTodosLosPaises(): DatoPais[] {
  return Object.values(paisesData).filter(p => p.visible !== false);
}

export function getTodosLosPaisesIncluyendoOcultos(): DatoPais[] {
  return Object.values(paisesData);
}

export function getPaisesPorNivelRiesgo(nivel: NivelRiesgo): DatoPais[] {
  return Object.values(paisesData).filter(p => p.nivelRiesgo === nivel);
}

export function getPaisesPorContinente(continente: string): DatoPais[] {
  return Object.values(paisesData).filter(p => p.continente === continente);
}

export interface ColoresRiesgo {
  bg: string;
  text: string;
  border: string;
}

export function getColoresRiesgo(nivel: NivelRiesgo): ColoresRiesgo {
  switch (nivel) {
    case 'sin-riesgo': return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
    case 'bajo': return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
    case 'medio': return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
    case 'alto': return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
    case 'muy-alto': return { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900' };
  }
}

export function getLabelRiesgo(nivel: NivelRiesgo): string {
  switch (nivel) {
    case 'sin-riesgo': return 'Sin riesgo';
    case 'bajo': return 'Riesgo bajo';
    case 'medio': return 'Riesgo medio';
    case 'alto': return 'Riesgo alto';
    case 'muy-alto': return 'Riesgo muy alto';
  }
}

export function getEmergenciasPorPais(codigo: string): EmergenciasPais | null {
  const directa = emergenciasData[codigo.toLowerCase()];
  if (directa) return directa;

  const pais = paisesData[codigo.toLowerCase()];
  if (pais) {
    const continente = pais.continente;
    if (continente.startsWith('América')) return EMERGENCIA_FALLBACK['América'];
    if (continente === 'Asia') return EMERGENCIA_FALLBACK['Asia'];
    if (continente === 'África') return EMERGENCIA_FALLBACK['África'];
    if (continente === 'Oceanía') return EMERGENCIA_FALLBACK['Oceanía'];
    return EMERGENCIA_FALLBACK['Europa'];
  }
  return null;
}

// ──────────────────────────────────────────────
// DB warm-up: carga datos desde Supabase en segundo
// plano al arrancar el servidor y fusiona en
// paisesData. No bloquea el módulo ni el build.
// ──────────────────────────────────────────────

if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  setTimeout(async () => {
    try {
      const { getPaisesData } = await import('@/lib/paises-db');
      const data = await getPaisesData();
      if (data && Object.keys(data).length > 0) {
        Object.assign(paisesData, data);
      }
    } catch { /* fallback to hardcoded */ }
  }, 0);
}

// ──────────────────────────────────────────────
// Async DB-first wrappers (2.1 migration)
// Usan Supabase como fuente primaria con fallback
// a datos hardcodeados.
// ──────────────────────────────────────────────

async function loadPaisesFromDB(): Promise<Map<string, DatoPais> | null> {
  try {
    const { getPaisesData } = await import('@/lib/paises-db');
    const paises = await getPaisesData();
    return new Map(Object.entries(paises));
  } catch {
    return null;
  }
}

export async function getPaisPorCodigoAsync(codigo: string): Promise<DatoPais | undefined> {
  const db = await loadPaisesFromDB();
  if (db) {
    const pais = db.get(codigo.toLowerCase());
    if (pais && pais.visible !== false) return pais;
    if (pais && pais.visible === false) return undefined;
  }
  return getPaisPorCodigo(codigo);
}

export async function getTodosLosPaisesAsync(): Promise<DatoPais[]> {
  const db = await loadPaisesFromDB();
  if (db) return Array.from(db.values()).filter(p => p.visible !== false);
  return getTodosLosPaises();
}

export async function getPaisesPorNivelRiesgoAsync(nivel: NivelRiesgo): Promise<DatoPais[]> {
  const db = await loadPaisesFromDB();
  if (db) return Array.from(db.values()).filter(p => p.visible !== false && p.nivelRiesgo === nivel);
  return getPaisesPorNivelRiesgo(nivel);
}

export async function getPaisesPorContinenteAsync(continente: string): Promise<DatoPais[]> {
  const db = await loadPaisesFromDB();
  if (db) return Array.from(db.values()).filter(p => p.visible !== false && p.continente === continente);
  return getPaisesPorContinente(continente);
}

export async function getEmergenciasPorPaisAsync(codigo: string): Promise<EmergenciasPais | null> {
  return getEmergenciasPorPais(codigo);
}
