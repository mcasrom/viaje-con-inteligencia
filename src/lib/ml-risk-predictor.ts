import { supabaseAdmin } from './supabase-admin';
import { paisesData, type NivelRiesgo } from '@/data/paises';

type RiskNum = 1 | 2 | 3 | 4 | 5;

const RISK_ORDER: Record<string, RiskNum> = {
  'sin-riesgo': 1,
  'bajo': 2,
  'medio': 3,
  'alto': 4,
  'muy-alto': 5,
};

export interface RiskPrediction {
  countryCode: string;
  countryName: string;
  bandera: string;
  currentRisk: string;
  riskScore: number;           // 1-100 composite score
  probabilityUp7d: number;     // 0-1
  probabilityUp14d: number;
  probabilityUp30d: number;
  signalCount7d: number;
  incidentCount7d: number;
  topFactors: string[];
  predictedAt: string;
}

interface SignalStats {
  count: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  avgConfidence: number;
}

interface IncidentStats {
  count: number;
  bySeverity: Record<string, number>;
}

async function getSignalStats(countryCode: string): Promise<SignalStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data } = await supabaseAdmin
    .from('osint_signals')
    .select('urgency, confidence')
    .gte('post_timestamp', sevenDaysAgo)
    .or(`location_name.ilike.%${countryCode}%,title.ilike.%${countryCode}%`);

  if (!data) return { count: 0, criticalCount: 0, highCount: 0, mediumCount: 0, avgConfidence: 0 };

  return {
    count: data.length,
    criticalCount: data.filter(s => s.urgency === 'critical').length,
    highCount: data.filter(s => s.urgency === 'high').length,
    mediumCount: data.filter(s => s.urgency === 'medium').length,
    avgConfidence: data.length > 0
      ? data.reduce((sum, s) => sum + (s.confidence || 0.5), 0) / data.length
      : 0,
  };
}

async function getIncidentStats(countryCode: string): Promise<IncidentStats> {
  const { data } = await supabaseAdmin
    .from('incidents')
    .select('severity')
    .eq('country_code', countryCode.toUpperCase())
    .eq('is_active', true);

  if (!data) return { count: 0, bySeverity: {} };

  const bySeverity: Record<string, number> = {};
  for (const inc of data) {
    bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
  }

  return { count: data.length, bySeverity };
}

async function getRecentRiskChanges(countryCode: string): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabaseAdmin
    .from('risk_alerts')
    .select('id')
    .eq('country_code', countryCode)
    .gte('created_at', thirtyDaysAgo);

  return data?.length || 0;
}

async function getAirspaceClosures(): Promise<Set<string>> {
  const { data } = await supabaseAdmin
    .from('airspace_closures')
    .select('country_code')
    .eq('is_active', true);

  return new Set((data || []).map(c => c.country_code.toUpperCase()));
}

function getSeasonalRiskMultiplier(countryCode: string): number {
  const month = new Date().getMonth(); // 0=Jan
  const highRiskMonths: Record<string, number[]> = {
    th: [3, 4, 5],     // Songkran + heat
    ph: [6, 7, 8, 9, 10], // Typhoon season
    vn: [8, 9, 10, 11], // Typhoon season
    mx: [10, 11],       // Hurricane
    us: [6, 7, 8, 9],   // Hurricane Atlantic
    id: [11, 12, 1, 2], // Wet season + flooding
    in: [6, 7, 8, 9],   // Monsoon
    br: [12, 1, 2, 3],  // Summer rains
    jp: [8, 9],          // Typhoon season
    cn: [5, 6, 7, 8],    // Flood season
  };
  return (highRiskMonths[countryCode.toLowerCase()] || []).includes(month) ? 1.3 : 1.0;
}

function computeRiskScore(riskNum: RiskNum, signals: SignalStats, incidents: IncidentStats): number {
  let score = riskNum * 20;

  // Signal contribution (up to +25)
  score += Math.min(signals.criticalCount * 8, 15);
  score += Math.min(signals.highCount * 4, 7);
  score += Math.min(signals.mediumCount * 2, 3);

  // Incident contribution (up to +15)
  score += Math.min(incidents.bySeverity['high'] || 0 * 8, 10);
  score += Math.min(incidents.bySeverity['medium'] || 0 * 4, 5);

  return Math.min(Math.max(score, 1), 100);
}

function computeProbability(riskNum: RiskNum, riskScore: number, signals: SignalStats, incidents: IncidentStats, changes30d: number, seasonalMult: number): { up7d: number; up14d: number; up30d: number } {
  if (riskNum >= 5) return { up7d: 0.001, up14d: 0.002, up30d: 0.005 };

  const maxPossible = riskNum * 10 + 40;
  const rawProb = Math.min(riskScore / maxPossible, 1.0);

  const changeBoost = changes30d > 0 ? changes30d * 0.03 : 0;
  const signalBoost = signals.criticalCount * 0.05 + signals.highCount * 0.03;
  const incidentBoost = incidents.count * 0.04;
  const seasonalBoost = (seasonalMult - 1.0) * 0.1;

  const base = Math.min(rawProb + changeBoost + signalBoost + incidentBoost + seasonalBoost, 0.95);

  return {
    up7d: Math.min(base * 0.25, 0.8),
    up14d: Math.min(base * 0.50, 0.85),
    up30d: Math.min(base, 0.9),
  };
}

function getTopFactors(riskNum: RiskNum, riskScore: number, signals: SignalStats, incidents: IncidentStats, changes30d: number, seasonalMult: number, hasAirspace: boolean): string[] {
  const factors: string[] = [];

  if (riskNum >= 4) factors.push('Nivel de riesgo alto actual');
  if (riskScore >= 60) factors.push('Puntuación de riesgo compuesta elevada');
  if (signals.criticalCount > 0) factors.push(`${signals.criticalCount} señales críticas OSINT (7d)`);
  if (signals.highCount > 0) factors.push(`${signals.highCount} alertas altas OSINT (7d)`);
  if (incidents.count > 0) factors.push(`${incidents.count} incidentes activos`);
  if (changes30d > 0) factors.push(`${changes30d} cambios de riesgo en 30d`);
  if (seasonalMult > 1.1) factors.push('Temporada de alto riesgo climático');
  if (hasAirspace) factors.push('Cierre de espacio aéreo activo');

  return factors.slice(0, 4);
}

export async function predictCountry(countryCode: string): Promise<RiskPrediction | null> {
  const pais = paisesData[countryCode.toLowerCase()];
  if (!pais) return null;

  const riskNum = RISK_ORDER[pais.nivelRiesgo] || 1;
  const signals = await getSignalStats(countryCode);
  const incidents = await getIncidentStats(countryCode);
  const changes30d = await getRecentRiskChanges(countryCode);
  const closedAirspaces = await getAirspaceClosures();
  const seasonalMult = getSeasonalRiskMultiplier(countryCode);

  const riskScore = computeRiskScore(riskNum, signals, incidents);
  const probability = computeProbability(riskNum, riskScore, signals, incidents, changes30d, seasonalMult);

  return {
    countryCode: countryCode.toLowerCase(),
    countryName: pais.nombre,
    bandera: pais.bandera,
    currentRisk: pais.nivelRiesgo,
    riskScore,
    probabilityUp7d: Math.round(probability.up7d * 1000) / 1000,
    probabilityUp14d: Math.round(probability.up14d * 1000) / 1000,
    probabilityUp30d: Math.round(probability.up30d * 1000) / 1000,
    signalCount7d: signals.count,
    incidentCount7d: incidents.count,
    topFactors: getTopFactors(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, closedAirspaces.has(countryCode.toUpperCase())),
    predictedAt: new Date().toISOString(),
  };
}

export async function predictAllCountries(): Promise<RiskPrediction[]> {
  const results: RiskPrediction[] = [];
  const countries = Object.keys(paisesData).filter(c => c !== 'cu');

  for (const code of countries) {
    const prediction = await predictCountry(code);
    if (prediction) results.push(prediction);
  }

  return results;
}

export async function savePrediction(prediction: RiskPrediction): Promise<void> {
  await supabaseAdmin.from('risk_predictions').upsert({
    country_code: prediction.countryCode,
    current_risk: prediction.currentRisk,
    risk_score: prediction.riskScore,
    probability_up_7d: prediction.probabilityUp7d,
    probability_up_14d: prediction.probabilityUp14d,
    probability_up_30d: prediction.probabilityUp30d,
    signal_count_7d: prediction.signalCount7d,
    incident_count_7d: prediction.incidentCount7d,
    top_factors: prediction.topFactors,
    predicted_at: prediction.predictedAt,
  }, { onConflict: 'country_code,predicted_at' });
}

export async function saveAllPredictions(): Promise<{ ok: number; errors: number }> {
  const predictions = await predictAllCountries();
  let ok = 0, errors = 0;

  for (const pred of predictions) {
    try {
      await savePrediction(pred);
      ok++;
    } catch {
      errors++;
    }
  }

  return { ok, errors };
}
