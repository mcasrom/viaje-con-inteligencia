import { supabaseAdmin } from './supabase-admin';
import { paisesData } from '@/data/paises';
import { getFeaturesByCountry } from './ml-features';
import {
  getSignalStats, getIncidentStats, getRecentRiskChanges, getTransitionMatrix,
  getUpProbability, computeRiskScore, computeProbability, getSeasonalRiskMultiplier,
  RISK_NUM,
} from './ml-risk-predictor';
import type { RiskNum } from './ml-risk-predictor';
import { createLogger } from './logger';

const log = createLogger('RFTrainer');

const N_ESTIMATORS = 50;
const MAX_DEPTH = 8;

export const FEATURE_NAMES = [
  'riskNum', 'signalCriticalCount', 'signalHighCount', 'signalMediumCount',
  'signalCount', 'incidentHighCount', 'incidentMediumCount', 'incidentCount',
  'changes30d', 'seasonalMult', 'gpi_score', 'gti_score', 'hdi_score',
  'ipc_score', 'tci_score', 'events30d', 'highImpactEvents30d',
  'usRiskScore', 'trend7d', 'trend30d',
];

async function buildTrainingRow(
  code: string, matrix: Awaited<ReturnType<typeof getTransitionMatrix>>,
): Promise<{
  features: number[]; riskScore: number; probUp7d: number; probUp14d: number; probUp30d: number;
} | null> {
  const pais = paisesData[code.toLowerCase()];
  if (!pais) return null;
  const riskNum: RiskNum = (RISK_NUM[pais.nivelRiesgo] || 1) as RiskNum;

  const [signals, incidents, changes30d, features] = await Promise.all([
    getSignalStats(code),
    getIncidentStats(code),
    getRecentRiskChanges(code),
    getFeaturesByCountry(code.toLowerCase()).catch(() => null),
  ]);

  const seasonalMult = getSeasonalRiskMultiplier(code);
  const riskScore = computeRiskScore(riskNum, signals, incidents, features);
  const transitionProb = getUpProbability(matrix, riskNum);
  const prob = computeProbability(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, transitionProb, features);

  return {
    features: [
      riskNum,
      signals.criticalCount, signals.highCount, signals.mediumCount, signals.count,
      incidents.bySeverity['high'] || 0, incidents.bySeverity['medium'] || 0, incidents.count,
      changes30d, seasonalMult,
      features?.gpi_score ?? 0, features?.gti_score ?? 0, features?.hdi_score ?? 0,
      features?.ipc_score ?? 0, features?.tci_score ?? 0,
      features?.events_30d ?? 0, features?.high_impact_events_30d ?? 0,
      features?.us_risk_score ?? 0,
      features?.risk_trend_7d ?? 0, features?.risk_trend_30d ?? 0,
    ],
    riskScore,
    probUp7d: prob.up7d,
    probUp14d: prob.up14d,
    probUp30d: prob.up30d,
  };
}

export async function trainRandomForest(): Promise<{
  success: boolean; models: number; nSamples: number; error?: string;
}> {
  try {
    const RF = await import('ml-random-forest');
    const countries = Object.keys(paisesData).filter(c => c !== 'cu');
    const X: number[][] = [];
    const yScore: number[] = [];
    const yProb7d: number[] = [];
    const yProb14d: number[] = [];
    const yProb30d: number[] = [];

    const matrix = await getTransitionMatrix();

    for (const code of countries) {
      const row = await buildTrainingRow(code, matrix);
      if (!row) continue;
      X.push(row.features);
      yScore.push(row.riskScore);
      yProb7d.push(row.probUp7d);
      yProb14d.push(row.probUp14d);
      yProb30d.push(row.probUp30d);
    }

    if (X.length < 10) {
      return { success: false, models: 0, nSamples: X.length, error: `Not enough samples: ${X.length}` };
    }

    const nSamples = X.length;

    const models = [
      { type: 'risk_score_rf', y: yScore },
      { type: 'prob_up_7d_rf', y: yProb7d },
      { type: 'prob_up_14d_rf', y: yProb14d },
      { type: 'prob_up_30d_rf', y: yProb30d },
    ];

    let trained = 0;
    for (const model of models) {
      const rf = new RF.RandomForestRegression({
        nEstimators: N_ESTIMATORS,
        treeOptions: { maxDepth: MAX_DEPTH },
        noOOB: true,
        seed: 42,
      });
      rf.train(X, model.y);
      const predictions = rf.predict(X);
      const mse = predictions.reduce((sum: number, p: number, i: number) => sum + (p - model.y[i]) ** 2, 0) / predictions.length;
      const yMean = model.y.reduce((a: number, b: number) => a + b, 0) / model.y.length;
      const ssTotal = model.y.reduce((sum: number, y: number) => sum + (y - yMean) ** 2, 0);
      const r2 = ssTotal > 0 ? 1 - (mse * predictions.length) / ssTotal : 0;
      const modelJson = rf.toJSON();

      const { error } = await supabaseAdmin.from('ml_models').upsert({
        model_type: model.type,
        model_version: 'v1',
        model_data: modelJson,
        feature_names: FEATURE_NAMES,
        trained_at: new Date().toISOString(),
        n_estimators: N_ESTIMATORS,
        n_samples: nSamples,
        mse: Math.round(mse * 10000) / 10000,
        r2: Math.round(r2 * 1000) / 1000,
      }, { onConflict: 'model_type,model_version' });

      if (!error) trained++;
      else {
        const msg = `${model.type}: ${error.message}${error.details ? ` (${error.details})` : ''}${error.hint ? ` [${error.hint}]` : ''}`;
        log.error(`Failed to save model:`, msg);
      }
    }

    if (trained === 0) {
      return { success: false, models: 0, nSamples, error: 'All 4 model upserts failed' };
    }
    return { success: true, models: trained, nSamples };
  } catch (e: any) {
    return { success: false, models: 0, nSamples: 0, error: e.message };
  }
}
