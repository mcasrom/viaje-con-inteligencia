import { supabaseAdmin } from '@/lib/supabase-admin';

export interface MlFeatures {
  country_code: string;
  computed_at: string;
  risk_level: string | null;
  risk_score: number | null;
  risk_trend_7d: number;
  risk_trend_30d: number;
  gpi_score: number | null;
  gti_score: number | null;
  hdi_score: number | null;
  ipc_score: number | null;
  tci_score: number | null;
  tci_trend: string | null;
  events_30d: number;
  high_impact_events_30d: number;
  demand_index: number | null;
  seasonality_index: number | null;
  signal_count_7d: number;
  incident_count_7d: number;
  airspace_closure_active: boolean;
  route_disruption_active: boolean;
  safety_composite: number | null;
  cost_composite: number | null;
  cluster_label: string | null;
  model_version: string | null;
}

const RISK_NUM: Record<string, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

function getAdmin() {
  try { return supabaseAdmin; } catch { return null; }
}

export async function getAllFeatures(): Promise<MlFeatures[]> {
  const admin = getAdmin();
  if (!admin) return [];
  const { data } = await admin
    .from('ml_features')
    .select('*')
    .order('country_code');
  return (data as MlFeatures[]) || [];
}

export async function getFeaturesByCountry(code: string): Promise<MlFeatures | null> {
  const admin = getAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from('ml_features')
    .select('*')
    .eq('country_code', code.toLowerCase())
    .single();
  return data as MlFeatures | null;
}

export async function getFeaturesByCluster(cluster: string): Promise<MlFeatures[]> {
  const admin = getAdmin();
  if (!admin) return [];
  const { data } = await admin
    .from('ml_features')
    .select('*')
    .eq('cluster_label', cluster);
  return (data as MlFeatures[]) || [];
}

export async function upsertFeatures(features: Partial<MlFeatures> & { country_code: string }): Promise<boolean> {
  const admin = getAdmin();
  if (!admin) return false;
  const { error } = await admin
    .from('ml_features')
    .upsert({
      ...features,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'country_code' });
  return !error;
}

function computeRiskTrend(values: number[]): { trend7d: number; trend30d: number } {
  if (values.length < 2) return { trend7d: 0, trend30d: 0 };

  const n = values.length;
  const trend30d = (values[n - 1] - values[0]) / n;

  const last7 = values.slice(-7);
  const trend7d = last7.length >= 2
    ? (last7[last7.length - 1] - last7[0]) / last7.length
    : 0;

  return { trend7d, trend30d };
}

export async function computeAndStoreFeatures(code: string, riskLevel: string): Promise<MlFeatures | null> {
  const admin = getAdmin();
  if (!admin) return null;

  const { calculateTCI } = await import('@/data/tci-engine');
  const tci = calculateTCI(code);

  const riskScoreMap: Record<string, number> = {
    'sin-riesgo': 10, 'bajo': 25, 'medio': 50, 'alto': 75, 'muy-alto': 95,
  };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const codeUpper = code.toUpperCase();

  const [eventsRes, highImpactRes, signalsRes, incidentsRes, airspaceRes, routesRes, riskHistory, indicesRes] = await Promise.all([
    admin.from('events').select('id', { count: 'exact', head: true }).eq('country_code', codeUpper).gte('date', thirtyDaysAgo),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('country_code', codeUpper).eq('impact', 'high').gte('date', thirtyDaysAgo),
    admin.from('osint_signals').select('id', { count: 'exact', head: true }).or(`location_name.ilike.%${code}%,title.ilike.%${code}%`).gte('post_timestamp', sevenDaysAgo),
    admin.from('incidents').select('id', { count: 'exact', head: true }).eq('country_code', codeUpper).eq('is_active', true),
    admin.from('airspace_closures').select('id', { count: 'exact', head: true }).eq('country_code', codeUpper).eq('is_active', true),
    admin.from('affected_routes').select('id', { count: 'exact', head: true }).or(`origin.eq.${codeUpper},destination.eq.${codeUpper}`).eq('is_active', true),
    admin.from('maec_risk_history').select('nivel_riesgo, date').eq('country_code', code).gte('date', thirtyDaysAgoDate).order('date'),
    admin.from('indices').select('tipo, valor').eq('codigo_pais', code),
  ]);

  const events30d = eventsRes.count ?? 0;
  const highImpactEvents30d = highImpactRes.count ?? 0;
  const signalCount7d = signalsRes.count ?? 0;
  const incidentCount7d = incidentsRes.count ?? 0;
  const airspaceActive = (airspaceRes.count ?? 0) > 0;
  const routesDisrupted = (routesRes.count ?? 0) > 0;

  const riskValues = (riskHistory.data || []).map(r => RISK_NUM[r.nivel_riesgo] || 1);
  const { trend7d, trend30d } = computeRiskTrend(riskValues);

  const indexRows = (indicesRes.data || []) as { tipo: string; valor: number }[];
  const indexScore = (tipo: string): number | null => {
    const row = indexRows.find(r => r.tipo === tipo);
    return row ? row.valor : null;
  };

  const features: Partial<MlFeatures> = {
    country_code: code,
    risk_level: riskLevel,
    risk_score: riskScoreMap[riskLevel] || 50,
    risk_trend_7d: Math.round(trend7d * 1000) / 1000,
    risk_trend_30d: Math.round(trend30d * 1000) / 1000,
    gpi_score: indexScore('gpi'),
    gti_score: indexScore('gti'),
    hdi_score: indexScore('hdi'),
    ipc_score: indexScore('ipc'),
    tci_score: tci.tci,
    tci_trend: tci.trend,
    events_30d: events30d,
    high_impact_events_30d: highImpactEvents30d,
    demand_index: tci.demandIdx,
    seasonality_index: tci.seasonalityIdx,
    signal_count_7d: signalCount7d,
    incident_count_7d: incidentCount7d,
    airspace_closure_active: airspaceActive,
    route_disruption_active: routesDisrupted,
    safety_composite: 100 - (riskScoreMap[riskLevel] || 50),
    cost_composite: Math.min(100, Math.round((tci.tci / 150) * 100)),
    model_version: 'v3',
  };

  const ok = await upsertFeatures(features as MlFeatures);
  return ok ? (await getFeaturesByCountry(code)) : null;
}

export async function computeFeaturesForAllCountries(): Promise<{ ok: number; errors: number }> {
  const { paisesData } = await import('@/data/paises');
  const countries = Object.keys(paisesData).filter(c => c !== 'cu');
  let ok = 0, errors = 0;

  for (const code of countries) {
    try {
      const pais = paisesData[code];
      if (!pais) continue;
      await computeAndStoreFeatures(code, pais.nivelRiesgo);
      ok++;
    } catch {
      errors++;
    }
  }

  return { ok, errors };
}
