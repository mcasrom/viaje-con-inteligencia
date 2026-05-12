let initialized = false;

export async function initSeasonalityData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const [{ supabaseAdmin, isSupabaseAdminConfigured }, engine] = await Promise.all([
      import('@/lib/supabase-admin'),
      import('@/data/tci-engine'),
    ]);
    if (!isSupabaseAdminConfigured()) return;

    const { data } = await supabaseAdmin
      .from('seasonality')
      .select('country_code, month, index_value');

    if (!data || data.length === 0) return;

    const built: Record<string, Record<string, number>> = {};
    for (const row of data) {
      const code = row.country_code.toLowerCase();
      if (!built[code]) built[code] = {};
      built[code][String(row.month)] = Number(row.index_value);
    }

    const map = engine.SEASONALITY_MAP;
    for (const key of Object.keys(map)) delete map[key];
    Object.assign(map, built);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[seasonality-init] ${Object.keys(built).length} countries loaded from Supabase`);
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[seasonality-init] Supabase unavailable, using hardcoded data:', e);
    }
  }
}
