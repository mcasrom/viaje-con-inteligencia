let initialized = false;

export async function initPaisesData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { loadAllPaisesToCache } = await import('@/lib/paises-db');
    const cache = await loadAllPaisesToCache();
    if (!cache?.data || cache.data.size === 0) return;

    const { paisesData } = await import('@/data/paises');
    const { emergenciasData } = await import('@/data/paises');

    let updated = 0;
    for (const [code, pais] of cache.data) {
      paisesData[code] = pais;
      updated++;
    }

    const emCache = cache.emergencias;
    if (emCache && emCache.size > 0) {
      for (const [code, em] of emCache) {
        (emergenciasData as any)[code] = em;
      }
    }

    console.log(`[paises-init] ${updated} countries loaded from Supabase`);
  } catch (e) {
    console.warn('[paises-init] Supabase unavailable, using hardcoded data:', e);
  }
}
