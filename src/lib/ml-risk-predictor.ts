import { supabaseAdmin } from './supabase-admin';
import { paisesData, type NivelRiesgo } from '@/data/paises';
import { getFeaturesByCountry } from './ml-features';
import type { MlFeatures } from './ml-features';

type RiskNum = 1 | 2 | 3 | 4 | 5;

const RISK_NUM: Record<string, RiskNum> = {
  'sin-riesgo': 1,
  'bajo': 2,
  'medio': 3,
  'alto': 4,
  'muy-alto': 5,
};

const RISK_LABELS: RiskNum[] = [1, 2, 3, 4, 5];

export interface RiskPrediction {
  countryCode: string;
  countryName: string;
  bandera: string;
  currentRisk: string;
  riskScore: number;
  probabilityUp7d: number;
  probabilityUp14d: number;
  probabilityUp30d: number;
  signalCount7d: number;
  incidentCount7d: number;
  topFactors: string[];
  predictedAt: string;
  transitionProb: number;
  historicalTrend: string;
}

interface TransitionMatrix {
  counts: number[][];
  probs: number[][];
  totalTransitions: number;
}

let cachedMatrix: TransitionMatrix | null = null;
let matrixComputedAt = 0;
const MATRIX_TTL = 3600000;

async function getTransitionMatrix(): Promise<TransitionMatrix> {
  if (cachedMatrix && Date.now() - matrixComputedAt < MATRIX_TTL) {
    return cachedMatrix;
  }

  const { data } = await supabaseAdmin
    .from('maec_risk_history')
    .select('country_code, nivel_riesgo, date')
    .order('country_code')
    .order('date');

  const counts: number[][] = Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]);
  let total = 0;

  if (data && data.length > 1) {
    let prevCountry = '';
    let prevLevel = 0;

    for (const row of data) {
      const level = RISK_NUM[row.nivel_riesgo] || 1;
      if (row.country_code === prevCountry && prevLevel > 0) {
        counts[prevLevel - 1][level - 1]++;
        total++;
      }
      prevCountry = row.country_code;
      prevLevel = level;
    }
  }

  const probs: number[][] = counts.map((row, i) => {
    const rowSum = row.reduce((a, b) => a + b, 0);
    const denom = rowSum + 5;
    return row.map(c => (c + 1) / denom);
  });

  const matrix: TransitionMatrix = { counts, probs, totalTransitions: total };
  cachedMatrix = matrix;
  matrixComputedAt = Date.now();
  return matrix;
}

function getUpProbability(matrix: TransitionMatrix, currentRiskNum: RiskNum): number {
  const idx = currentRiskNum - 1;
  const row = matrix.probs[idx];
  if (!row) return 0.2;

  const upProbs = row.slice(idx);
  const totalProb = upProbs.reduce((a, b) => a + b, 0);
  return totalProb / upProbs.length;
}

interface SignalStats {
  count: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  avgConfidence: number;
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

interface IncidentStats {
  count: number;
  bySeverity: Record<string, number>;
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
  const month = new Date().getMonth();
  const highRiskMonths: Record<string, number[]> = {
    th: [3, 4, 5],
    ph: [6, 7, 8, 9, 10],
    vn: [8, 9, 10, 11],
    mx: [10, 11],
    us: [6, 7, 8, 9],
    id: [11, 12, 1, 2],
    in: [6, 7, 8, 9],
    br: [12, 1, 2, 3],
    jp: [8, 9],
    cn: [5, 6, 7, 8],
  };
  return (highRiskMonths[countryCode.toLowerCase()] || []).includes(month) ? 1.3 : 1.0;
}

function computeRiskScore(
  riskNum: RiskNum,
  signals: SignalStats,
  incidents: IncidentStats,
  features: MlFeatures | null,
): number {
  let score = riskNum * 20;

  score += Math.min(signals.criticalCount * 8, 15);
  score += Math.min(signals.highCount * 4, 7);
  score += Math.min(signals.mediumCount * 2, 3);

  score += Math.min(incidents.bySeverity['high'] || 0 * 8, 10);
  score += Math.min(incidents.bySeverity['medium'] || 0 * 4, 5);

  if (features) {
    if (features.risk_trend_7d > 0) {
      score += Math.min(features.risk_trend_7d * 5, 5);
    }
    if (features.events_30d > 0) {
      score += Math.min(features.events_30d * 0.5, 5);
    }
    if (features.high_impact_events_30d > 0) {
      score += Math.min(features.high_impact_events_30d * 2, 8);
    }
    if (features.us_risk_score && features.us_risk_score >= 3) {
      score += (features.us_risk_score - 2) * 10;
    }
    if (features.ipc_score !== null && features.ipc_score !== undefined) {
      if (features.ipc_score > 50) score += 15;
      else if (features.ipc_score > 10) score += 10;
      else if (features.ipc_score > 5) score += 5;
    }
  }

  return Math.min(Math.max(score, 1), 100);
}

function computeProbability(
  riskNum: RiskNum,
  riskScore: number,
  signals: SignalStats,
  incidents: IncidentStats,
  changes30d: number,
  seasonalMult: number,
  transitionProb: number,
  features: MlFeatures | null,
): { up7d: number; up14d: number; up30d: number } {
  if (riskNum >= 5) return { up7d: 0.001, up14d: 0.002, up30d: 0.005 };

  const signalBoost = signals.criticalCount * 0.05 + signals.highCount * 0.03;
  const incidentBoost = incidents.count * 0.04;
  const changeBoost = changes30d > 0 ? changes30d * 0.03 : 0;
  const seasonalBoost = (seasonalMult - 1.0) * 0.1;

  let trendBoost = 0;
  if (features) {
    if (features.risk_trend_7d > 0.1) trendBoost += 0.05;
    if (features.risk_trend_30d > 0.05) trendBoost += 0.03;
    if (features.high_impact_events_30d > 0) trendBoost += 0.03;
    if (features.ipc_score !== null && features.ipc_score !== undefined) {
      if (features.ipc_score > 50) trendBoost += 0.08;
      else if (features.ipc_score > 10) trendBoost += 0.05;
      else if (features.ipc_score > 5) trendBoost += 0.03;
    }
  }

  const base = Math.min(
    transitionProb + signalBoost + incidentBoost + changeBoost + seasonalBoost + trendBoost,
    0.95,
  );

  const stepProb = Math.min(transitionProb + 0.1, 0.6);

  return {
    up7d: Math.min(base * 0.35, 0.8),
    up14d: Math.min(base * 0.5 + stepProb * 0.3, 0.85),
    up30d: Math.min(base + stepProb * 0.4, 0.9),
  };
}

function getTopFactors(
  riskNum: RiskNum,
  riskScore: number,
  signals: SignalStats,
  incidents: IncidentStats,
  changes30d: number,
  seasonalMult: number,
  hasAirspace: boolean,
  transitionProb: number,
  features: MlFeatures | null,
): string[] {
  const factors: string[] = [];

  if (riskNum >= 4) factors.push('Nivel de riesgo alto actual');
  if (riskScore >= 60) factors.push('Puntuación de riesgo compuesta elevada');

  if (transitionProb > 0.3) {
    factors.push(`Probabilidad histórica de escalada: ${Math.round(transitionProb * 100)}%`);
  }

  if (signals.criticalCount > 0) factors.push(`${signals.criticalCount} señales críticas OSINT (7d)`);
  if (signals.highCount > 0) factors.push(`${signals.highCount} alertas altas OSINT (7d)`);
  if (incidents.count > 0) factors.push(`${incidents.count} incidentes activos`);
  if (changes30d > 0) factors.push(`${changes30d} cambios de riesgo en 30d`);

  if (features) {
    if (features.risk_trend_7d > 0.1) factors.push('Tendencia de riesgo al alza (7d)');
    if (features.events_30d > 0) factors.push(`${features.events_30d} eventos en 30d`);
    if (features.ipc_score !== null && features.ipc_score !== undefined) {
      if (features.ipc_score > 50) factors.push(`Inflación extrema (${features.ipc_score}%)`);
      else if (features.ipc_score > 10) factors.push(`Inflación muy alta (${features.ipc_score}%)`);
      else if (features.ipc_score > 5) factors.push(`Inflación elevada (${features.ipc_score}%)`);
    }
  }

  if (seasonalMult > 1.1) factors.push('Temporada de alto riesgo climático');
  if (hasAirspace) factors.push('Cierre de espacio aéreo activo');

  return factors.slice(0, 5);
}

function getHistoricalTrend(trend7d: number, trend30d: number): string {
  if (trend7d > 0.3) return 'subiendo rápido';
  if (trend7d > 0.1) return 'subiendo';
  if (trend7d < -0.3) return 'bajando rápido';
  if (trend7d < -0.1) return 'bajando';
  if (trend30d > 0.1) return 'subiendo lentamente';
  if (trend30d < -0.1) return 'bajando lentamente';
  return 'estable';
}

export async function predictCountry(countryCode: string): Promise<RiskPrediction | null> {
  const pais = paisesData[countryCode.toLowerCase()];
  if (!pais) return null;

  const riskNum = RISK_NUM[pais.nivelRiesgo] || 1;

  const [signals, incidents, changes30d, closedAirspaces, matrix, features] = await Promise.all([
    getSignalStats(countryCode),
    getIncidentStats(countryCode),
    getRecentRiskChanges(countryCode),
    getAirspaceClosures(),
    getTransitionMatrix(),
    getFeaturesByCountry(countryCode.toLowerCase()).catch(() => null),
  ]);

  const seasonalMult = getSeasonalRiskMultiplier(countryCode);
  const transitionProb = getUpProbability(matrix, riskNum);
  const riskScore = computeRiskScore(riskNum, signals, incidents, features);
  const probability = computeProbability(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, transitionProb, features);
  const historicalTrend = getHistoricalTrend(features?.risk_trend_7d ?? 0, features?.risk_trend_30d ?? 0);

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
    topFactors: getTopFactors(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, closedAirspaces.has(countryCode.toUpperCase()), transitionProb, features),
    predictedAt: new Date().toISOString(),
    transitionProb: Math.round(transitionProb * 1000) / 1000,
    historicalTrend,
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
