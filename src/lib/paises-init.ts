let initialized = false;

export async function initPaisesData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { getPaisesData } = await import('@/lib/paises-db');
    const paises = await getPaisesData();
    if (!paises || Object.keys(paises).length === 0) return;

    const { paisesData } = await import('@/data/paises');

    let updated = 0;
    for (const [code, pais] of Object.entries(paises)) {
      const existing = paisesData[code];
      if (existing) {
        paisesData[code] = { ...existing, ...pais };
      } else {
        paisesData[code] = pais;
      }
      updated++;
    }

    console.log(`[paises-init] ${updated} countries loaded from Supabase`);
  } catch (e) {
    console.warn('[paises-init] Supabase unavailable, using hardcoded data:', e);
  }
}
