import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';

export interface IndiceEntry {
  rank: number;
  country: string;
  code: string;
  score: number;
  change: number;
  region: string;
}

export interface IPCEntry {
  country: string;
  code: string;
  ipc: string;
  nivel: string;
  region: string;
}

function mapToGPI(item: any): IndiceEntry {
  return { rank: item.rank ?? 0, country: item.nombre_pais, code: item.codigo_pais?.toUpperCase(), score: item.valor, change: item.cambio ?? 0, region: item.region };
}

function mapToIPC(item: any): IPCEntry {
  return { country: item.nombre_pais, code: item.codigo_pais?.toUpperCase(), ipc: `${item.valor}%`, nivel: item.nivel || 'Medio', region: item.region };
}

async function fetchFromDB(tipo: string): Promise<any[] | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const { data, error } = await supabaseAdmin
    .from('indices')
    .select('*')
    .eq('tipo', tipo)
    .order('rank', { ascending: true });
  if (error || !data || data.length === 0) return null;
  return data;
}

export async function getGPI(): Promise<IndiceEntry[]> {
  const db = await fetchFromDB('gpi');
  if (db) return db.map(mapToGPI);
  const { GPI_DATA } = await import('@/data/indices');
  return GPI_DATA;
}

export async function getGTI(): Promise<IndiceEntry[]> {
  const db = await fetchFromDB('gti');
  if (db) return db.map(mapToGPI);
  const { GTI_DATA } = await import('@/data/indices');
  return GTI_DATA;
}

export async function getHDI(): Promise<IndiceEntry[]> {
  const db = await fetchFromDB('hdi');
  if (db) return db.map(mapToGPI);
  const { HDI_DATA } = await import('@/data/indices');
  return HDI_DATA;
}

export async function getIPC(): Promise<IPCEntry[]> {
  const db = await fetchFromDB('ipc');
  if (db) return db.map(mapToIPC);
  const { IPC_DATA } = await import('@/data/indices');
  return IPC_DATA;
}
