import { supabaseAdmin } from '@/lib/supabase-admin';
import { AIRSPACE_CLOSURES_FALLBACK, AFFECTED_ROUTES_FALLBACK, type AirspaceClosure, type AffectedRoute } from '@/data/tci-engine';

export type DemandShiftMap = Record<string, { extraDemandPct: number; reason: string }>;

const DEMAND_SHIFTS_FALLBACK: DemandShiftMap = {
  tr: { extraDemandPct: 15, reason: 'Desvio masivo de rutas a Oriente Medio por conflictos Siria, Iran e Israel' },
  jo: { extraDemandPct: 12, reason: 'Hub alternativo para viajeros a Libano, Iraq y Palestina' },
  eg: { extraDemandPct: 10, reason: 'Refugio turistico de Oriente Medio' },
  ae: { extraDemandPct: 8, reason: 'Hub aereo alternativo al espacio aereo irani cerrado' },
  om: { extraDemandPct: 6, reason: 'Ruta alternativa al Golfo Persico desviada de Iran' },
  es: { extraDemandPct: 8, reason: 'Turismo redirigido desde destinos de riesgo medio' },
  pt: { extraDemandPct: 8, reason: 'Turismo redirigido desde destinos de riesgo medio' },
  gr: { extraDemandPct: 8, reason: 'Turismo redirigido desde destinos de riesgo medio' },
  hr: { extraDemandPct: 8, reason: 'Turismo redirigido desde destinos de riesgo medio' },
  mx: { extraDemandPct: 6, reason: 'Alternativa segura a Caribe inestable' },
  cr: { extraDemandPct: 6, reason: 'Alternativa segura a Caribe inestable' },
  jp: { extraDemandPct: 5, reason: 'Destino asiatico seguro sin conflicto aereo' },
  kr: { extraDemandPct: 5, reason: 'Destino asiatico seguro sin conflicto aereo' },
  sg: { extraDemandPct: 5, reason: 'Destino asiatico seguro sin conflicto aereo' },
};

function getAdmin() {
  try {
    return supabaseAdmin;
  } catch {
    return null;
  }
}

export async function getAirspaceClosuresLive(): Promise<AirspaceClosure[]> {
  const admin = getAdmin();
  if (!admin) return AIRSPACE_CLOSURES_FALLBACK;

  try {
    const { data, error } = await admin
      .from('airspace_closures')
      .select('*')
      .order('severity', { ascending: false });

    if (error || !data || data.length === 0) return AIRSPACE_CLOSURES_FALLBACK;

    return data.map((r: any) => ({
      code: r.country_code,
      name: r.country_name,
      closureDate: r.closure_date,
      reason: r.reason,
      severity: r.severity,
      isActive: r.is_active,
      notes: r.notes || '',
    }));
  } catch {
    return AIRSPACE_CLOSURES_FALLBACK;
  }
}

export async function getAffectedRoutesLive(): Promise<AffectedRoute[]> {
  const admin = getAdmin();
  if (!admin) return AFFECTED_ROUTES_FALLBACK;

  try {
    const { data, error } = await admin
      .from('affected_routes')
      .select('*')
      .order('fuel_surcharge_pct', { ascending: false });

    if (error || !data || data.length === 0) return AFFECTED_ROUTES_FALLBACK;

    return data.map((r: any) => ({
      destination: r.destination_iata,
      countryCode: r.destination_country,
      closedAirspace: r.closed_airspace,
      detourKm: r.detour_km,
      fuelSurchargePct: r.fuel_surcharge_pct,
      timeExtraHours: r.time_extra_hours,
      alternativeRoute: r.alternative_route || '',
      isActive: r.is_active,
    }));
  } catch {
    return AFFECTED_ROUTES_FALLBACK;
  }
}

export async function getDemandShiftsLive(): Promise<DemandShiftMap> {
  const admin = getAdmin();
  if (!admin) return DEMAND_SHIFTS_FALLBACK;

  try {
    const { data, error } = await admin
      .from('demand_shifts')
      .select('country_code, extra_demand_pct, reason')
      .eq('is_active', true);

    if (error || !data || data.length === 0) return DEMAND_SHIFTS_FALLBACK;

    const map: DemandShiftMap = {};
    for (const r of data) {
      map[r.country_code] = { extraDemandPct: r.extra_demand_pct, reason: r.reason };
    }
    return map;
  } catch {
    return DEMAND_SHIFTS_FALLBACK;
  }
}

export async function getSeasonalityLive(): Promise<Record<string, Record<string, number>>> {
  const admin = getAdmin();
  if (!admin) return {};

  try {
    const { data, error } = await admin
      .from('seasonality')
      .select('country_code, month, index_value');

    if (error || !data || data.length === 0) return {};

    const map: Record<string, Record<string, number>> = {};
    for (const r of data) {
      if (!map[r.country_code]) map[r.country_code] = {};
      map[r.country_code][String(r.month)] = r.index_value;
    }
    return map;
  } catch {
    return {};
  }
}
