import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRSPACE_CLOSURES = [
  { country_code: 'RU', country_name: 'Rusia', reason: 'Conflicto Ucrania - espacio aéreo cerrado', severity: 'critical' as const },
  { country_code: 'UA', country_name: 'Ucrania', reason: 'Conflicto armado activo', severity: 'critical' as const },
  { country_code: 'SY', country_name: 'Siria', reason: 'Conflicto armado - zona de guerra', severity: 'high' as const },
  { country_code: 'LY', country_name: 'Libia', reason: 'Inestabilidad política y conflictos', severity: 'high' as const },
  { country_code: 'YE', country_name: 'Yemen', reason: 'Conflicto armado activo', severity: 'high' as const },
  { country_code: 'AF', country_name: 'Afganistán', reason: 'Control Talibán - espacio aéreo restringido', severity: 'high' as const },
  { country_code: 'IQ', country_name: 'Irak', reason: 'Zona de conflicto activo', severity: 'medium' as const },
  { country_code: 'SO', country_name: 'Somalia', reason: 'Inestabilidad y conflictos internos', severity: 'medium' as const },
  { country_code: 'SD', country_name: 'Sudán', reason: 'Conflicto armado interno', severity: 'high' as const },
  { country_code: 'IR', country_name: 'Irán', reason: 'Tensiones geopolíticas - restricciones', severity: 'medium' as const },
];

const AFFECTED_ROUTES = [
  { origin_iata: 'MAD', destination_iata: 'NRT', destination_country: 'JP', closed_airspace: 'RU', detour_km: 2800, fuel_surcharge_pct: 18.5, time_extra_hours: 3.2, alternative_route: 'MAD → DOH → NRT (vía Qatar)' },
  { origin_iata: 'MAD', destination_iata: 'ICN', destination_country: 'KR', closed_airspace: 'RU', detour_km: 2500, fuel_surcharge_pct: 16.0, time_extra_hours: 2.8, alternative_route: 'MAD → IST → ICN (vía Turquía)' },
  { origin_iata: 'MAD', destination_iata: 'PEK', destination_country: 'CN', closed_airspace: 'RU', detour_km: 1800, fuel_surcharge_pct: 15.0, time_extra_hours: 2.5, alternative_route: 'MAD → DXB → PEK (vía Dubai)' },
  { origin_iata: 'MAD', destination_iata: 'BKK', destination_country: 'TH', closed_airspace: 'RU', detour_km: 1200, fuel_surcharge_pct: 12.0, time_extra_hours: 2.0, alternative_route: 'MAD → DOH → BKK (vía Qatar)' },
  { origin_iata: 'MAD', destination_iata: 'DEL', destination_country: 'IN', closed_airspace: 'PK', detour_km: 800, fuel_surcharge_pct: 8.0, time_extra_hours: 1.5, alternative_route: 'MAD → DXB → DEL (vía Dubai)' },
  { origin_iata: 'MAD', destination_iata: 'TLV', destination_country: 'IL', closed_airspace: 'LB', detour_km: 400, fuel_surcharge_pct: 5.0, time_extra_hours: 1.0, alternative_route: 'MAD → ATH → TLV (vía Atenas)' },
  { origin_iata: 'MAD', destination_iata: 'CAI', destination_country: 'EG', closed_airspace: 'LY', detour_km: 600, fuel_surcharge_pct: 6.0, time_extra_hours: 1.2, alternative_route: 'MAD → ATH → CAI (vía Atenas)' },
  { origin_iata: 'MAD', destination_iata: 'DXB', destination_country: 'AE', closed_airspace: 'IR', detour_km: 300, fuel_surcharge_pct: 4.0, time_extra_hours: 0.8, alternative_route: 'MAD → DOH → DXB (vía Qatar)' },
];

async function detectNewClosures() {
  const results: Array<{ type: string; detail: string }> = [];
  
  const { data: existing } = await supabase
    .from('airspace_closures')
    .select('country_code, is_active');
  
  const existingMap = new Map((existing || []).map((c: any) => [c.country_code, c.is_active]));
  
  for (const closure of AIRSPACE_CLOSURES) {
    const existing = existingMap.get(closure.country_code);
    
    if (existing === undefined) {
      const { error } = await supabase
        .from('airspace_closures')
        .insert({
          country_code: closure.country_code,
          country_name: closure.country_name,
          closure_date: new Date().toISOString().split('T')[0],
          reason: closure.reason,
          severity: closure.severity,
          is_active: true,
          notes: 'Detectado automáticamente por OSINT bot',
        });
      
      if (error) {
        console.error(`Error inserting ${closure.country_code}:`, error.message);
      } else {
        results.push({ type: 'new_closure', detail: `${closure.country_name} (${closure.country_code}) - ${closure.reason}` });
      }
    } else if (!existing) {
      results.push({ type: 'still_active', detail: `${closure.country_name} sigue cerrado` });
    }
  }
  
  const closedCountries = AIRSPACE_CLOSURES.filter(c => !existingMap.has(c.country_code) || existingMap.get(c.country_code)).map(c => c.country_code);
  
  const { data: allExisting } = await supabase
    .from('airspace_closures')
    .select('country_code, is_active');
  
  for (const existing of allExisting || []) {
    if (existing.is_active && !closedCountries.includes(existing.country_code)) {
      await supabase
        .from('airspace_closures')
        .update({ is_active: false, notes: 'Cierre finalizado - detectado por OSINT bot' })
        .eq('country_code', existing.country_code);
      
      results.push({ type: 'reopened', detail: `${existing.country_code} reabierto` });
    }
  }
  
  return results;
}

async function syncAffectedRoutes() {
  const results: Array<{ type: string; detail: string }> = [];
  
  const { data: existing } = await supabase
    .from('affected_routes')
    .select('origin_iata, destination_iata, is_active');
  
  const existingMap = new Map((existing || []).map((r: any) => [`${r.origin_iata}-${r.destination_iata}`, r.is_active]));
  
  for (const route of AFFECTED_ROUTES) {
    const key = `${route.origin_iata}-${route.destination_iata}`;
    const existing = existingMap.get(key);
    
    if (!existing) {
      const { error } = await supabase
        .from('affected_routes')
        .insert({
          origin_iata: route.origin_iata,
          destination_iata: route.destination_iata,
          destination_country: route.destination_country,
          closed_airspace: route.closed_airspace,
          detour_km: route.detour_km,
          fuel_surcharge_pct: route.fuel_surcharge_pct,
          time_extra_hours: route.time_extra_hours,
          alternative_route: route.alternative_route,
          is_active: true,
        });
      
      if (error) {
        console.error(`Error inserting route ${key}:`, error.message);
      } else {
        results.push({ type: 'new_route', detail: `${route.origin_iata} → ${route.destination_iata} (+${route.fuel_surcharge_pct}%)` });
      }
    }
  }
  
  return results;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const closureResults = await detectNewClosures();
    const routeResults = await syncAffectedRoutes();
    
    const allResults = [...closureResults, ...routeResults];
    const duration = Date.now() - startTime;

    await supabase.from('scraper_logs').insert({
      source: 'osint_airspace',
      status: 'success',
      items_scraped: AIRSPACE_CLOSURES.length + AFFECTED_ROUTES.length,
      errors: allResults.length === 0 ? 0 : 1,
      duration_ms: duration,
    });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      changes: allResults.length,
      details: allResults,
      duration_ms: duration,
      message: allResults.length > 0 ? 'OSINT bot: cambios detectados y sincronizados' : 'OSINT bot: sin cambios',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('OSINT bot error:', error);

    await supabase.from('scraper_logs').insert({
      source: 'osint_airspace',
      status: 'error',
      items_scraped: 0,
      errors: 1,
      duration_ms: duration,
    });

    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
