import { supabaseAdmin } from './supabase-admin';
import { getPaisesData } from '@/lib/paises-db';
import { getSignalStats, getIncidentStats, getTransitionMatrix, RISK_NUM, getUpProbability } from './ml-risk-predictor';
import type { RiskNum } from './ml-risk-predictor';

export interface TrendPrediction {
  countryCode: string;
  countryName: string;
  currentRisk: string;
  currentRiskNum: number;
  trend: 'subiendo' | 'bajando' | 'estable';
  trendLabel: string;
  trendIcon: string;
  trendColor: string;
  probabilityUp7d: number;
  probabilityDown7d: number;
  confidence: 'alta' | 'media' | 'baja';
  factors: string[];
  predictedAt: string;
}

function riskNumToLevel(n: number): string {
  const map: Record<number, string> = { 1: 'sin-riesgo', 2: 'bajo', 3: 'medio', 4: 'alto', 5: 'muy-alto' };
  return map[n] || 'bajo';
}

export async function predictTrend(countryCode: string): Promise<TrendPrediction | null> {
  const allPaises = await getPaisesData();
  const pais = allPaises[countryCode.toLowerCase()];
  if (!pais) return null;

  const riskNum = RISK_NUM[pais.nivelRiesgo] || 1;

  const [signals, incidents, matrix] = await Promise.all([
    getSignalStats(countryCode),
    getIncidentStats(countryCode),
    getTransitionMatrix(),
  ]);

  const probUp = getUpProbability(matrix, riskNum as RiskNum);

  // OSINT sentiment pressure
  const sentimentPressure = signals.criticalCount * 0.15 + signals.highCount * 0.08 + signals.mediumCount * 0.03;
  const incidentPressure = incidents.count * 0.05;

  // Combined probability (capped at 0.95)
  const adjustedProbUp = Math.min(probUp + sentimentPressure + incidentPressure, 0.95);
  const adjustedProbDown = Math.max(0.05, 1 - adjustedProbUp - 0.1);

  // Determine trend
  let trend: 'subiendo' | 'bajando' | 'estable';
  if (adjustedProbUp > 0.55) trend = 'subiendo';
  else if (adjustedProbUp < 0.3) trend = 'bajando';
  else trend = 'estable';

  // Confidence based on data availability
  const dataPoints = signals.count + incidents.count;
  let confidence: 'alta' | 'media' | 'baja';
  if (dataPoints >= 5) confidence = 'alta';
  else if (dataPoints >= 2) confidence = 'media';
  else confidence = 'baja';

  // Factors
  const factors: string[] = [];
  if (signals.criticalCount > 0) factors.push(`${signals.criticalCount} señal(es) crítica(s) OSINT`);
  if (signals.highCount > 0) factors.push(`${signals.highCount} señal(es) de alta urgencia`);
  if (incidents.count > 0) factors.push(`${incidents.count} incidente(s) activo(s)`);
  if (adjustedProbUp > 0.6) factors.push(`Probabilidad de subida: ${(adjustedProbUp * 100).toFixed(0)}%`);
  if (matrix.totalTransitions > 0) {
    const histProb = matrix.probs[riskNum - 1]?.slice(riskNum).reduce((a, b) => a + b, 0) || 0;
    if (histProb > 0.3) factors.push('Histórico muestra tendencia alcista');
  }
  if (factors.length === 0) factors.push('Sin señales de cambio significativo');

  const trendConfig = {
    subiendo: { label: 'Riesgo creciente', icon: '📈', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    bajando: { label: 'Riesgo decreciente', icon: '📉', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    estable: { label: 'Riesgo estable', icon: '➡️', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  };

  const config = trendConfig[trend];

  return {
    countryCode: countryCode.toLowerCase(),
    countryName: pais.nombre,
    currentRisk: pais.nivelRiesgo,
    currentRiskNum: riskNum,
    trend,
    trendLabel: config.label,
    trendIcon: config.icon,
    trendColor: config.color,
    probabilityUp7d: Math.round(adjustedProbUp * 100),
    probabilityDown7d: Math.round(adjustedProbDown * 100),
    confidence,
    factors,
    predictedAt: new Date().toISOString(),
  };
}

export async function logTrendPrediction(prediction: TrendPrediction): Promise<void> {
  try {
    await supabaseAdmin.from('trend_predictions').insert({
      country_code: prediction.countryCode,
      current_risk: prediction.currentRisk,
      current_risk_num: prediction.currentRiskNum,
      trend: prediction.trend,
      probability_up_7d: prediction.probabilityUp7d / 100,
      probability_down_7d: prediction.probabilityDown7d / 100,
      confidence: prediction.confidence,
      factors: prediction.factors,
      predicted_at: prediction.predictedAt,
    });
  } catch (e) {
    console.error('Failed to log trend prediction:', e);
  }
}
