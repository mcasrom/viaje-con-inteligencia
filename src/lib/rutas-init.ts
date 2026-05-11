let initialized = false;

export async function initRutasData(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { getAllRoutesFromDB, getWineSeasonsFromDB } = await import('@/lib/rutas-db');
    const [routes, dbSeasons] = await Promise.all([
      getAllRoutesFromDB(),
      getWineSeasonsFromDB(),
    ]);

    if (routes.length === 0) return;

    const { thematicRoutes, wineSeasons: hardcodedSeasons } = await import('@/data/rutas-espanas');

    for (const route of routes) {
      (thematicRoutes as any)[route.id] = route;
    }

    if (dbSeasons.length > 0) {
      hardcodedSeasons.splice(0, hardcodedSeasons.length, ...dbSeasons);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[rutas-init] ${routes.length} routes loaded from Supabase`);
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[rutas-init] Supabase unavailable, using hardcoded data:', e);
    }
  }
}
