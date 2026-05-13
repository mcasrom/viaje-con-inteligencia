import { supabaseAdmin } from '@/lib/supabase-admin';
import { GPI_DATA, GTI_DATA, HDI_DATA } from '@/data/indices';
import { ineTourismData } from '@/data/clustering';
import { createLogger } from '@/lib/logger';

const log = createLogger('IndicesDB');

async function syncIndex(
  indexType: string,
  data: { code: string; country: string; rank: number; score: number; change: number; region: string }[]
): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  let synced = 0;
  for (const item of data) {
    const { error } = await admin.from('country_global_indices').upsert({
      index_type: indexType,
      country_code: item.code.toLowerCase(),
      country_name: item.country,
      rank: item.rank,
      score: item.score,
      change: item.change,
      region: item.region,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'index_type,country_code' });
    if (!error) synced++;
  }
  return synced;
}

export async function syncAllIndicesToSupabase(): Promise<{ gpi: number; gti: number; hdi: number; tourism: number }> {
  const [gpi, gti, hdi] = await Promise.all([
    syncIndex('gpi', GPI_DATA),
    syncIndex('gti', GTI_DATA as any),
    syncIndex('hdi', HDI_DATA as any),
  ]);

  let tourism = 0;
  const admin = supabaseAdmin;
  if (admin) {
    for (const [code, data] of Object.entries(ineTourismData)) {
      const { error } = await admin.from('country_tourism').upsert({
        country_code: code,
        arrivals: data.arrivals,
        pernoctaciones: data.pernoctaciones,
        estancia_media: data.estanciaMedia,
        source: data.source,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'country_code' });
      if (!error) tourism++;
    }
  }

  log.info(`Indices sync: GPI=${gpi} GTI=${gti} HDI=${hdi} Tourism=${tourism}`);
  return { gpi, gti, hdi, tourism };
}

export async function getIndicesFromDB(indexType: string): Promise<any[]> {
  const admin = supabaseAdmin;
  if (!admin) return [];

  try {
    const { data } = await admin
      .from('country_global_indices')
      .select('*')
      .eq('index_type', indexType)
      .order('rank');
    return data || [];
  } catch { return []; }
}

export async function getTourismFromDB(): Promise<Record<string, any>> {
  const admin = supabaseAdmin;
  if (!admin) return {};

  try {
    const { data } = await admin.from('country_tourism').select('*');
    const map: Record<string, any> = {};
    for (const row of data || []) {
      map[row.country_code] = {
        arrivals: row.arrivals,
        pernoctaciones: row.pernoctaciones,
        estanciaMedia: row.estancia_media,
        source: row.source,
      };
    }
    return map;
  } catch { return {}; }
}
