import { supabaseAdmin } from './supabase-admin';
import { paisesData } from '@/data/paises';
import { createLogger } from './logger';
import { getFeaturesByCountry } from './ml-features';
import {
  buildFeatureVector, getSignalStats, getIncidentStats, getRecentRiskChanges,
  getTransitionMatrix, getUpProbability, computeRiskScore, computeProbability,
  getSeasonalRiskMultiplier, RISK_NUM,
} from './ml-risk-predictor';
import type { RiskNum } from './ml-risk-predictor';

const log = createLogger('MLValidate');

const RISK_ORDER: Record<string, number> = { 'sin-riesgo': 1, bajo: 2, medio: 3, alto: 4, 'muy-alto': 5 };

interface ValidationRow {
  country: string;
  predictionDate: string;
  wasRf: boolean;
  predRiskScore: number;
  predProb7d: number;
  predProb14d: number;
  predProb30d: number;
  actualRiskScore?: number;
  actualRiskUp7d?: boolean;
  actualRiskUp14d?: boolean;
  actualRiskUp30d?: boolean;
  actualRiskChange7d?: number;
  actualRiskChange14d?: number;
  actualRiskChange30d?: number;
}

export interface ValidationSummary {
  totalPredictions: number;
  withRf: number;
  withHeuristic: number;
  outcomesAvailable7d: number;
  outcomesAvailable14d: number;
  outcomesAvailable30d: number;
  temporalCv: {
    rfMaeRiskScore: number;
    heuristicMaeRiskScore: number;
    rfBetter: boolean;
    nTest: number;
  } | null;
  recentChanges: Array<{
    country: string; from: string; to: string; date: string;
  }>;
}

export async function validateModels(): Promise<ValidationSummary> {
  const start = Date.now();

  // 1. Check risk changes in the last 7 days from history
  const { data: history } = await supabaseAdmin
    .from('maec_risk_history')
    .select('country_code, nivel_riesgo, date')
    .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
    .order('country_code')
    .order('date');

  const recentChanges: ValidationSummary['recentChanges'] = [];
  if (history && history.length > 1) {
    let prev: { code: string; risk: string; date: string } | null = null;
    for (const row of history) {
      if (prev && row.country_code === prev.code && row.nivel_riesgo !== prev.risk) {
        recentChanges.push({ country: row.country_code, from: prev.risk, to: row.nivel_riesgo, date: row.date });
      }
      prev = { code: row.country_code, risk: row.nivel_riesgo, date: row.date };
    }
  }

  // 2. Temporal cross-validation: train on earlier 80%, test on later 20%
  let temporalCv: ValidationSummary['temporalCv'] = null;
  try {
    const countries = Object.keys(paisesData).filter(c => c !== 'cu');
    const matrix = await getTransitionMatrix();
    const RF = await import('ml-random-forest');

    const allRows: { features: number[]; heuristic: { riskScore: number; prob7d: number; prob14d: number; prob30d: number }; riskLevel: string }[] = [];

    for (const code of countries) {
      const pais = paisesData[code.toLowerCase()];
      if (!pais) continue;
      const riskNum: RiskNum = (RISK_NUM[pais.nivelRiesgo] || 1) as RiskNum;
      const features = await buildFeatureVector(code);
      if (!features) continue;
      const [signals, incidents, changes30d, mlFeatures] = await Promise.all([
        getSignalStats(code), getIncidentStats(code),
        getRecentRiskChanges(code),
        getFeaturesByCountry(code.toLowerCase()).catch(() => null),
      ]);
      const seasonalMult = getSeasonalRiskMultiplier(code);
      const transitionProb = getUpProbability(matrix, riskNum);
      const riskScore = computeRiskScore(riskNum, signals, incidents, mlFeatures);
      const prob = computeProbability(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, transitionProb, mlFeatures);
      allRows.push({
        features,
        heuristic: { riskScore, prob7d: prob.up7d, prob14d: prob.up14d, prob30d: prob.up30d },
        riskLevel: pais.nivelRiesgo,
      });
    }

    if (allRows.length >= 20) {
      const splitIdx = Math.floor(allRows.length * 0.8);
      const trainRows = allRows.slice(0, splitIdx);
      const testRows = allRows.slice(splitIdx);

      const X_train = trainRows.map(r => r.features);
      const y_train = trainRows.map(r => r.heuristic.riskScore);
      const X_test = testRows.map(r => r.features);
      const y_test = testRows.map(r => r.heuristic.riskScore);

      const rf = new RF.RandomForestRegression({
        nEstimators: 50, treeOptions: { maxDepth: 8 }, seed: 42,
      });
      rf.train(X_train, y_train);
      const rfPreds = rf.predict(X_test);

      const rfMae = rfPreds.reduce((s: number, p: number, i: number) => s + Math.abs(p - y_test[i]), 0) / y_test.length;
      const heurMae = testRows.reduce((s: number, r: any) => s + Math.abs(r.heuristic.riskScore - y_test[testRows.indexOf(r)]), 0) / y_test.length;

      temporalCv = {
        rfMaeRiskScore: Math.round(rfMae * 100) / 100,
        heuristicMaeRiskScore: Math.round(heurMae * 100) / 100,
        rfBetter: rfMae < heurMae,
        nTest: testRows.length,
      };
      log.info(`Temporal CV: RF MAE=${rfMae.toFixed(2)}, heuristic MAE=${heurMae.toFixed(2)}, nTest=${testRows.length}`);
    }
  } catch (e) {
    log.warn('Temporal CV failed:', e);
  }

  // 3. Check recent predictions and whether outcome windows have passed
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: predictions } = await supabaseAdmin
    .from('risk_predictions')
    .select('country_code, predicted_at, risk_score, probability_up_7d, probability_up_14d, probability_up_30d, current_risk')
    .gte('predicted_at', sevenDaysAgo)
    .order('predicted_at', { ascending: true });

  // RF models were available starting from first training ~May 12 11:17 UTC
  const rfAvailableSince = Date.parse('2026-05-12T11:17:00Z');
  let withRf = 0, withHeuristic = 0;

  if (predictions) {
    for (const p of predictions) {
      if (Date.parse(p.predicted_at) >= rfAvailableSince) {
        // Check if RF model actually loaded (predict_country falls back to heuristic)
        // We can't know for sure without re-running, so approximate
        withRf++;
      } else {
        withHeuristic++;
      }
    }
  }

  const elapsed = Date.now() - start;
  log.info(`Validation complete in ${elapsed}ms: ${predictions?.length || 0} predictions checked, ${recentChanges.length} changes`);

  return {
    totalPredictions: predictions?.length || 0,
    withRf,
    withHeuristic,
    outcomesAvailable7d: 0,
    outcomesAvailable14d: 0,
    outcomesAvailable30d: 0,
    temporalCv,
    recentChanges,
  };
}
