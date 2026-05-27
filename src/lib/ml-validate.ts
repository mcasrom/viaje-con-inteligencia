import { supabaseAdmin } from './supabase-admin';
import { getPaisesData } from '@/lib/paises-db';
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
    const allPaises = await getPaisesData();
    const countries = Object.keys(allPaises).filter(c => c !== 'cu');
    const matrix = await getTransitionMatrix();
    const RF = await import('ml-random-forest');

    const allRows: { features: number[]; heuristic: { riskScore: number; prob7d: number; prob14d: number; prob30d: number }; riskLevel: string }[] = [];

    for (const code of countries) {
      const pais = allPaises[code.toLowerCase()];
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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: predictions } = await supabaseAdmin
    .from('risk_predictions')
    .select('country_code, predicted_at, risk_score, probability_up_7d, probability_up_14d, probability_up_30d, current_risk')
    .gte('predicted_at', thirtyDaysAgo)
    .order('predicted_at', { ascending: true });

  // RF models were available starting from first training ~May 12 11:17 UTC
  const rfAvailableSince = Date.parse('2026-05-12T11:17:00Z');
  let withRf = 0, withHeuristic = 0;

  // Outcome tracking: compare predictions against actual MAEC changes
  let outcomes7d = 0, outcomes14d = 0, outcomes30d = 0;
  let correctUp7d = 0, correctUp14d = 0, correctUp30d = 0;
  const now = Date.now();

  if (predictions && predictions.length > 0) {
    // Fetch all relevant MAEC history for comparison
    const { data: allHistory } = await supabaseAdmin
      .from('maec_risk_history')
      .select('country_code, nivel_riesgo, date')
      .gte('date', new Date(now - 35 * 86400000).toISOString().split('T')[0]);

    const historyByCountry: Record<string, { date: string; risk: string }[]> = {};
    if (allHistory) {
      for (const h of allHistory) {
        if (!historyByCountry[h.country_code]) historyByCountry[h.country_code] = [];
        historyByCountry[h.country_code].push({ date: h.date, risk: h.nivel_riesgo });
      }
    }

    for (const p of predictions) {
      if (Date.parse(p.predicted_at) >= rfAvailableSince) {
        withRf++;
      } else {
        withHeuristic++;
      }

      const predTime = Date.parse(p.predicted_at);
      const countryHistory = historyByCountry[p.country_code] || [];
      const currentRiskNum = RISK_ORDER[p.current_risk] || 0;

      // Check 7d outcome
      if (now - predTime >= 7 * 86400000) {
        outcomes7d++;
        const windowEnd = new Date(predTime + 7 * 86400000).toISOString().split('T')[0];
        for (const h of countryHistory) {
          if (h.date >= p.predicted_at.split('T')[0] && h.date <= windowEnd) {
            if ((RISK_ORDER[h.risk] || 0) > currentRiskNum) {
              correctUp7d++;
              break;
            }
          }
        }
      }

      // Check 14d outcome
      if (now - predTime >= 14 * 86400000) {
        outcomes14d++;
        const windowEnd = new Date(predTime + 14 * 86400000).toISOString().split('T')[0];
        for (const h of countryHistory) {
          if (h.date >= p.predicted_at.split('T')[0] && h.date <= windowEnd) {
            if ((RISK_ORDER[h.risk] || 0) > currentRiskNum) {
              correctUp14d++;
              break;
            }
          }
        }
      }

      // Check 30d outcome
      if (now - predTime >= 30 * 86400000) {
        outcomes30d++;
        const windowEnd = new Date(predTime + 30 * 86400000).toISOString().split('T')[0];
        for (const h of countryHistory) {
          if (h.date >= p.predicted_at.split('T')[0] && h.date <= windowEnd) {
            if ((RISK_ORDER[h.risk] || 0) > currentRiskNum) {
              correctUp30d++;
              break;
            }
          }
        }
      }
    }
  }

  const elapsed = Date.now() - start;
  log.info(`Validation complete in ${elapsed}ms: ${predictions?.length || 0} predictions checked, ${recentChanges.length} changes`);
  if (outcomes7d > 0) log.info(`Outcomes 7d: ${correctUp7d}/${outcomes7d} correct (${Math.round(correctUp7d/outcomes7d*100)}%)`);
  if (outcomes14d > 0) log.info(`Outcomes 14d: ${correctUp14d}/${outcomes14d} correct (${Math.round(correctUp14d/outcomes14d*100)}%)`);
  if (outcomes30d > 0) log.info(`Outcomes 30d: ${correctUp30d}/${outcomes30d} correct (${Math.round(correctUp30d/outcomes30d*100)}%)`);

  return {
    totalPredictions: predictions?.length || 0,
    withRf,
    withHeuristic,
    outcomesAvailable7d: outcomes7d,
    outcomesAvailable14d: outcomes14d,
    outcomesAvailable30d: outcomes30d,
    temporalCv,
    recentChanges,
  };
}
