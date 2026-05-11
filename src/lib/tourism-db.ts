import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import type { TourismStats } from '@/data/tourism';

function mapRowToStats(row: any): TourismStats {
  return {
    arrivals: row.arrivals,
    receipts: row.receipts ?? undefined,
    spendPerDay: row.spend_per_day ? Number(row.spend_per_day) : undefined,
    avgStay: row.avg_stay ? Number(row.avg_stay) : undefined,
    season: row.season ?? undefined,
    year: row.year,
    source: row.source,
  };
}

function mapRowToStatsWithCode(row: any): { code: string; stats: TourismStats } {
  return { code: row.codigo_pais?.toUpperCase(), stats: mapRowToStats(row) };
}

async function fetchAllFromDB(): Promise<{ codigo_pais: string; arrivals: number; receipts: number | null; spend_per_day: number | null; avg_stay: number | null; season: string | null; year: number; source: string }[] | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const { data, error } = await supabaseAdmin
    .from('tourism_stats')
    .select('*')
    .order('arrivals', { ascending: false });
  if (error || !data || data.length === 0) return null;
  return data;
}

export async function getTourismStats(code: string): Promise<TourismStats | null> {
  const db = await fetchAllFromDB();
  if (db) {
    const row = db.find(r => r.codigo_pais?.toUpperCase() === code.toUpperCase());
    if (row) return mapRowToStats(row);
  }
  const { getTourismStats: fallback } = await import('@/data/tourism');
  return fallback(code);
}

export async function getAllTourismData(): Promise<TourismStats[]> {
  const db = await fetchAllFromDB();
  if (db) return db.map(mapRowToStats);
  const { getAllTourismData: fallback } = await import('@/data/tourism');
  return fallback();
}

export async function getTopDestinations(limit: number = 10): Promise<{ code: string; stats: TourismStats }[]> {
  const db = await fetchAllFromDB();
  if (db) return db.slice(0, limit).map(mapRowToStatsWithCode);
  const { getTopDestinations: fallback } = await import('@/data/tourism');
  return fallback(limit);
}

export async function getTourismByCodeMap(): Promise<Record<string, TourismStats>> {
  const db = await fetchAllFromDB();
  if (db) {
    const map: Record<string, TourismStats> = {};
    for (const row of db) {
      map[row.codigo_pais?.toUpperCase()] = mapRowToStats(row);
    }
    return map;
  }
  const { tourismData } = await import('@/data/tourism');
  return tourismData;
}
