let initialized = false;

export async function initSegurosData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const [{ supabaseAdmin, isSupabaseAdminConfigured }, seguros] = await Promise.all([
      import('@/lib/supabase-admin'),
      import('@/lib/seguros-data'),
    ]);
    if (!isSupabaseAdminConfigured()) return;

    const { data: dbCatalog } = await supabaseAdmin
      .from('seguros_catalog')
      .select('*')
      .order('precio_min', { ascending: true });

    if (dbCatalog && dbCatalog.length > 0) {
      const mapped = dbCatalog.map((r: any) => ({
        id: r.id,
        nombre: r.nombre,
        aseguradora: r.aseguradora,
        web: r.web || '',
        precio_min: Number(r.precio_min),
        precio_max: Number(r.precio_max),
        moneda: r.moneda || 'EUR',
        coberturas: r.coberturas || {},
        exclusiones: r.exclusiones || [],
        recomendado_para: r.recomendado_para || [],
        afiliado: r.afiliado || '',
      }));
      seguros.catalog.splice(0, seguros.catalog.length, ...mapped);
    }

    const { data: dbPerfiles } = await supabaseAdmin
      .from('seguros_perfiles')
      .select('*');

    if (dbPerfiles && dbPerfiles.length > 0) {
      const mapped = dbPerfiles.map((r: any) => ({
        id: r.id,
        label: r.label,
        descripcion: r.descripcion || '',
        cobertura_minima: r.cobertura_minima || {},
      }));
      seguros.perfiles.splice(0, seguros.perfiles.length, ...mapped);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[seguros-init] ${seguros.catalog.length} products, ${seguros.perfiles.length} profiles loaded from Supabase`);
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[seguros-init] Supabase unavailable, using hardcoded data:', e);
    }
  }
}
