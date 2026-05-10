import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { createLogger } from './logger';

const log = createLogger('TCI-DB');

export async function getLiveSeasonality(): Promise<Record<string, Record<string, number>> | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('seasonality')
      .select('country_code, month, index_value');
    if (error || !data || data.length === 0) return null;
    const map: Record<string, Record<string, number>> = {};
    for (const row of data) {
      if (!map[row.country_code]) map[row.country_code] = {};
      map[row.country_code][String(row.month)] = row.index_value;
    }
    return map;
  } catch (e) {
    log.error('getLiveSeasonality error:', e);
    return null;
  }
}

export async function getLiveAirspaceClosures(): Promise<any[] | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('airspace_closures')
      .select('*')
      .eq('is_active', true);
    if (error || !data || data.length === 0) return null;
    return data;
  } catch (e) {
    log.error('getLiveAirspaceClosures error:', e);
    return null;
  }
}

export async function getLiveAffectedRoutes(): Promise<any[] | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('affected_routes')
      .select('*')
      .eq('is_active', true);
    if (error || !data || data.length === 0) return null;
    return data;
  } catch (e) {
    log.error('getLiveAffectedRoutes error:', e);
    return null;
  }
}

export async function getLiveDemandShifts(): Promise<Record<string, { extraDemandPct: number; reason: string }> | null> {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('demand_shifts')
      .select('country_code, extra_demand_pct, reason')
      .eq('is_active', true);
    if (error || !data || data.length === 0) return null;
    const map: Record<string, { extraDemandPct: number; reason: string }> = {};
    for (const row of data) {
      map[row.country_code] = { extraDemandPct: row.extra_demand_pct, reason: row.reason };
    }
    return map;
  } catch (e) {
    log.error('getLiveDemandShifts error:', e);
    return null;
  }
}

export async function getLiveTCIData() {
  const [seasonality, closures, routes, demandShifts] = await Promise.all([
    getLiveSeasonality(),
    getLiveAirspaceClosures(),
    getLiveAffectedRoutes(),
    getLiveDemandShifts(),
  ]);

  return {
    seasonality,
    closures,
    routes,
    demandShifts,
    source: 'supabase' as const,
  };
}
