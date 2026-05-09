import { supabaseAdmin } from '@/lib/supabase-admin';
import { AIRSPACE_CLOSURES_FALLBACK, AFFECTED_ROUTES_FALLBACK, type AirspaceClosure, type AffectedRoute } from '@/data/tci-engine';

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
      code: r.code,
      name: r.name,
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
      destination: r.destination,
      countryCode: r.country_code,
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
