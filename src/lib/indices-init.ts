let initialized = false;

export async function initIndicesData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const [{ supabaseAdmin, isSupabaseAdminConfigured }, indices] = await Promise.all([
      import('@/lib/supabase-admin'),
      import('@/data/indices'),
    ]);
    if (!isSupabaseAdminConfigured()) return;

    const { data } = await supabaseAdmin
      .from('indices')
      .select('*')
      .order('rank', { ascending: true });

    if (!data || data.length === 0) return;

    const gpi: typeof indices.GPI_DATA = [];
    const gti: typeof indices.GTI_DATA = [];
    const hdi: typeof indices.HDI_DATA = [];
    const ipc: typeof indices.IPC_DATA = [];

    for (const row of data) {
      switch (row.tipo) {
        case 'gpi':
          gpi.push({ rank: row.rank ?? 0, country: row.nombre_pais, code: row.codigo_pais?.toUpperCase(), score: Number(row.valor), change: row.cambio ?? 0, region: row.region });
          break;
        case 'gti':
          gti.push({ rank: row.rank ?? 0, country: row.nombre_pais, code: row.codigo_pais?.toUpperCase(), score: Number(row.valor), change: row.cambio ?? 0, region: row.region });
          break;
        case 'hdi':
          hdi.push({ rank: row.rank ?? 0, country: row.nombre_pais, code: row.codigo_pais?.toUpperCase(), score: Number(row.valor), change: row.cambio ?? 0, region: row.region });
          break;
        case 'ipc':
          ipc.push({ country: row.nombre_pais, code: row.codigo_pais?.toUpperCase(), ipc: `${row.valor}%`, nivel: row.nivel || 'Medio', region: row.region });
          break;
      }
    }

    if (gpi.length > 0) indices.GPI_DATA.splice(0, indices.GPI_DATA.length, ...gpi);
    if (gti.length > 0) indices.GTI_DATA.splice(0, indices.GTI_DATA.length, ...gti);
    if (hdi.length > 0) indices.HDI_DATA.splice(0, indices.HDI_DATA.length, ...hdi);
    if (ipc.length > 0) indices.IPC_DATA.splice(0, indices.IPC_DATA.length, ...ipc);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[indices-init] GPI:${gpi.length} GTI:${gti.length} HDI:${hdi.length} IPC:${ipc.length} loaded from Supabase`);
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[indices-init] Supabase unavailable, using hardcoded data:', e);
    }
  }
}
