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

export async function computeAndStoreFeatures(code: string, riskLevel: string): Promise<MlFeatures | null> {
  const admin = getAdmin();
  if (!admin) return null;

  const { calculateTCI } = await import('@/data/tci-engine');
  const tci = calculateTCI(code);

  const riskScoreMap: Record<string, number> = {
    'sin-riesgo': 10, 'bajo': 25, 'medio': 50, 'alto': 75, 'muy-alto': 95,
  };

  const features: Partial<MlFeatures> = {
    country_code: code,
    risk_level: riskLevel,
    risk_score: riskScoreMap[riskLevel] || 50,
    risk_trend_7d: 0,
    risk_trend_30d: 0,
    gpi_score: null,
    gti_score: null,
    hdi_score: null,
    ipc_score: null,
    tci_score: tci.tci,
    tci_trend: tci.trend,
    events_30d: 0,
    high_impact_events_30d: 0,
    demand_index: tci.demandIdx,
    seasonality_index: tci.seasonalityIdx,
    signal_count_7d: 0,
    incident_count_7d: 0,
    airspace_closure_active: false,
    route_disruption_active: false,
    safety_composite: 100 - (riskScoreMap[riskLevel] || 50),
    cost_composite: Math.min(100, Math.round((tci.tci / 150) * 100)),
    model_version: 'v1',
  };

  const ok = await upsertFeatures(features as MlFeatures);
  return ok ? (await getFeaturesByCountry(code)) : null;
}
