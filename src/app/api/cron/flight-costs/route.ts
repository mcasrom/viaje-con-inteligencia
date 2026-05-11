import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTCI } from '@/data/tci-engine';
import { paisesData } from '@/data/paises';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let logId: string | null = null;

  try {
    console.log('[Cron] Iniciando cálculo TCI...');

    const { data: logData } = await supabase
      .from('scraper_logs')
      .insert({ source: 'flight_costs', status: 'running', items_scraped: 0 })
      .select('id')
      .single();
    logId = logData?.id || null;

    // Fetch current oil price from EIA API
    let currentOilPrice: number | null = null;
    try {
      const eiaRes = await fetch('https://api.eia.gov/v2/petroleum/PRICEDWELLHEADS1_A/', {
        headers: { 'X-API-KEY': 'dc92cbbe0c995dc46e3eb6b728f4db48' },
      });
      if (eiaRes.ok) {
        const eiaData = await eiaRes.json();
        if (eiaData.response?.data?.[0]) {
          currentOilPrice = eiaData.response.data[0].value;
        }
      }
    } catch {
      console.log('[Cron] No se pudo obtener precio petróleo EIA, usando datos locales');
    }

    // Save oil price to history
    if (currentOilPrice !== null) {
      await supabase
        .from('oil_prices_history')
        .upsert({
          date: new Date().toISOString().split('T')[0],
          price_usd: currentOilPrice,
          source: 'EIA',
        }, { onConflict: 'date' });
    }

    // Fetch live data from Supabase
    const [closuresRes, routesRes, seasonalityRes, oilHistoryRes, usRiskRes] = await Promise.all([
      supabase.from('airspace_closures').select('*').eq('is_active', true),
      supabase.from('affected_routes').select('*').eq('is_active', true),
      supabase.from('seasonality').select('country_code, month, index_value'),
      supabase.from('oil_prices_history').select('date, price_usd').order('date', { ascending: true }),
      supabase.from('external_risk').select('country_code, risk_level').eq('source', 'us_state_dept'),
    ]);

    const closures = closuresRes.data || [];
    const routes = routesRes.data || [];

    const liveSeasonality: Record<string, Record<string, number>> = {};
    for (const row of (seasonalityRes.data || [])) {
      if (!liveSeasonality[row.country_code]) liveSeasonality[row.country_code] = {};
      liveSeasonality[row.country_code][String(row.month)] = Number(row.index_value);
    }
    const liveOilHistory = (oilHistoryRes.data || []).map(o => ({
      month: o.date.slice(0, 7), price: Number(o.price_usd),
    }));
    const liveClosures = closures.map((c: any) => ({
      code: c.code, name: c.name, closureDate: c.closure_date, reason: c.reason,
      severity: c.severity, isActive: c.is_active, notes: c.notes || '',
    }));
    const liveRoutes = routes.map((r: any) => ({
      destination: r.destination, countryCode: r.country_code, closedAirspace: r.closed_airspace,
      detourKm: r.detour_km, fuelSurchargePct: Number(r.fuel_surcharge_pct),
      timeExtraHours: Number(r.time_extra_hours), alternativeRoute: r.alternative_route, isActive: r.is_active,
    }));
    const usRiskMap: Record<string, number> = {};
    for (const row of (usRiskRes.data || [])) {
      usRiskMap[row.country_code] = Number(row.risk_level);
    }
    const liveData = {
      seasonality: Object.keys(liveSeasonality).length > 0 ? liveSeasonality : undefined,
      oilHistory: liveOilHistory.length > 0 ? liveOilHistory : undefined,
      oilPrice: currentOilPrice ?? undefined,
      airspaceClosures: liveClosures.length > 0 ? liveClosures : undefined,
      affectedRoutes: liveRoutes.length > 0 ? liveRoutes : undefined,
      usRiskMap: Object.keys(usRiskMap).length > 0 ? usRiskMap : undefined,
    };

    // Calculate TCI for all countries
    const countries = Object.values(paisesData).filter(p => p.visible !== false);
    const today = new Date().toISOString().split('T')[0];
    let calculated = 0;
    let historyInserted = 0;

    for (const pais of countries) {
      const tci = calculateTCI(pais.codigo, liveData.seasonality, liveData);

      // Calculate conflict surcharge from DB data
      const route = routes.find((r: any) => r.destination_country === pais.codigo.toUpperCase());
      const closure = closures.find((c: any) => c.code === pais.codigo.toUpperCase());
      let conflictSurcharge = 0;

      if (route) {
        conflictSurcharge = route.fuel_surcharge_pct;
      } else if (closure) {
        conflictSurcharge = closure.severity === 'critical' ? 25 : closure.severity === 'high' ? 15 : 8;
      }

      // Update cache
      await supabase
        .from('flight_tci_cache')
        .upsert({
          country_code: pais.codigo,
          tci_value: tci.tci,
          tci_trend: tci.trend,
          demand_idx: tci.demandIdx,
          oil_idx: tci.oilIdx,
          seasonality_idx: tci.seasonalityIdx,
          ipc_idx: tci.ipcIdx,
          risk_idx: tci.riskIdx,
          recommendation: tci.recommendation,
          last_calculated: new Date().toISOString(),
        }, { onConflict: 'country_code' });

      // Insert daily history snapshot
      await supabase
        .from('tci_history')
        .insert({
          date: today,
          country_code: pais.codigo,
          tci_value: tci.tci,
          tci_trend: tci.trend,
          demand_idx: tci.demandIdx,
          oil_idx: tci.oilIdx,
          seasonality_idx: tci.seasonalityIdx,
          ipc_idx: tci.ipcIdx,
          risk_idx: tci.riskIdx,
          oil_price_usd: currentOilPrice,
          conflict_surcharge: conflictSurcharge,
        })
        .select('id')
        .single();

      calculated++;
      historyInserted++;
    }

    const duration = Date.now();

    await supabase
      .from('scraper_logs')
      .update({
        status: 'success',
        items_scraped: calculated,
        duration_ms: duration,
      })
      .eq('id', logId);

    console.log(`[Cron] TCI calculado para ${calculated} países, ${historyInserted} snapshots guardados`);

    return NextResponse.json({
      success: true,
      countries_calculated: calculated,
      history_snapshots: historyInserted,
      oil_price: currentOilPrice,
    });
  } catch (error) {
    console.error('[Cron] Flight costs TCI error:', error);

    if (logId) {
      await supabase
        .from('scraper_logs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now(),
        })
        .eq('id', logId);
    }

    return NextResponse.json(
      { error: 'Error en flight costs cron' },
      { status: 500 }
    );
  }
}
