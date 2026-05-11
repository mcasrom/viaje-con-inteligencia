let initialized = false;

export async function initClusteringData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const [{ supabaseAdmin, isSupabaseAdminConfigured }, clustering] = await Promise.all([
      import('@/lib/supabase-admin'),
      import('@/data/clustering'),
    ]);
    if (!isSupabaseAdminConfigured()) return;

    const [taResult, ineData] = await Promise.all([
      supabaseAdmin.from('travel_attributes').select('*'),
      import('@/data/ine-data').then(m => m.getINEData()),
    ]);

    if (taResult.data && taResult.data.length > 0) {
      const dbAttrs: Record<string, any> = {};
      for (const row of taResult.data) {
        dbAttrs[row.codigo_pais] = {
          playa: row.playa,
          cultural: row.cultural,
          naturaleza: row.naturaleza,
          familiar: row.familiar,
          mejorEpoca: row.mejor_epoca,
          duracionOptima: row.duracion_optima,
        };
      }
      Object.assign(clustering.travelAttributes, dbAttrs);
    }

    if (ineData && Object.keys(ineData).length > 0) {
      clustering.updateTourismData(ineData);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[clustering-init] travel attributes + INE data loaded from Supabase');
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[clustering-init] Supabase unavailable, using hardcoded data:', e);
    }
  }
}
