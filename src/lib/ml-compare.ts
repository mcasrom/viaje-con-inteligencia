import { supabaseAdmin } from './supabase-admin';
import { paisesData } from '@/data/paises';
import { getFeaturesByCountry } from './ml-features';
import {
  getSignalStats, getIncidentStats, getRecentRiskChanges, getTransitionMatrix,
  getUpProbability, computeRiskScore, computeProbability, getSeasonalRiskMultiplier,
  RISK_NUM, buildFeatureVector,
} from './ml-risk-predictor';
import type { RiskNum } from './ml-risk-predictor';
import { FEATURE_NAMES } from './ml-trainer-rf';
import { createLogger } from './logger';

const log = createLogger('MLCompare');

interface CountryComparison {
  code: string;
  name: string;
  riskLevel: string;
  heuristic: { riskScore: number; probUp7d: number; probUp14d: number; probUp30d: number };
  rf: { riskScore: number | null; probUp7d: number | null; probUp14d: number | null; probUp30d: number | null };
  diff: { riskScore: number | null; probUp7d: number | null; probUp14d: number | null; probUp30d: number | null };
}

interface ModelsMap {
  risk_score_rf: any;
  prob_up_7d_rf: any;
  prob_up_14d_rf: any;
  prob_up_30d_rf: any;
}

async function loadModels(): Promise<ModelsMap | null> {
  try {
    const { data } = await supabaseAdmin
      .from('ml_models')
      .select('model_type, model_data')
      .eq('model_version', 'v1');
    if (!data || data.length === 0) return null;
    const RF = await import('ml-random-forest');
    const models: Partial<ModelsMap> = {};
    for (const row of data) {
      const t = row.model_type as keyof ModelsMap;
      if (t in models) continue;
      models[t] = RF.RandomForestRegression.load(row.model_data as any);
    }
    if (!models.risk_score_rf || !models.prob_up_7d_rf || !models.prob_up_14d_rf || !models.prob_up_30d_rf) return null;
    return models as ModelsMap;
  } catch (e) {
    log.error('Failed to load models:', e);
    return null;
  }
}

export interface ComparisonResult {
  totalCountries: number;
  comparisons: CountryComparison[];
  mae: { riskScore: number; probUp7d: number; probUp14d: number; probUp30d: number };
  maxDeviation: { riskScore: number; probUp7d: number; probUp14d: number; probUp30d: number };
  countriesWithLargeDeviation: number;
  rfModelsLoaded: boolean;
}

const LARGE_DEVIATION_THRESHOLD = {
  riskScore: 5,
  probUp7d: 0.05,
  probUp14d: 0.05,
  probUp30d: 0.05,
};

export async function comparePredictions(): Promise<ComparisonResult> {
  const start = Date.now();
  const countries = Object.keys(paisesData).filter(c => c !== 'cu');
  const matrix = await getTransitionMatrix();
  const models = await loadModels();

  const comparisons: CountryComparison[] = [];

  for (const code of countries) {
    const pais = paisesData[code.toLowerCase()];
    if (!pais) continue;

    const riskNum: RiskNum = (RISK_NUM[pais.nivelRiesgo] || 1) as RiskNum;
    const features = await buildFeatureVector(code);

    const [signals, incidents, changes30d, mlFeatures] = await Promise.all([
      getSignalStats(code),
      getIncidentStats(code),
      getRecentRiskChanges(code),
      getFeaturesByCountry(code.toLowerCase()).catch(() => null),
    ]);

    const seasonalMult = getSeasonalRiskMultiplier(code);
    const transitionProb = getUpProbability(matrix, riskNum);

    const hRiskScore = computeRiskScore(riskNum, signals, incidents, mlFeatures);
    const hProb = computeProbability(riskNum, hRiskScore, signals, incidents, changes30d, seasonalMult, transitionProb, mlFeatures);

    let rfScore: number | null = null;
    let rfProb7d: number | null = null;
    let rfProb14d: number | null = null;
    let rfProb30d: number | null = null;

    if (models && features) {
      try {
        const input = [features];
        rfScore = models.risk_score_rf.predict(input)[0] as number;
        rfProb7d = models.prob_up_7d_rf.predict(input)[0] as number;
        rfProb14d = models.prob_up_14d_rf.predict(input)[0] as number;
        rfProb30d = models.prob_up_30d_rf.predict(input)[0] as number;
      } catch (e) {
        log.warn(`RF prediction failed for ${code}:`, e);
      }
    }

    const diffScore = rfScore !== null ? Math.abs(rfScore - hRiskScore) : null;
    const diff7d = rfProb7d !== null ? Math.abs(rfProb7d - hProb.up7d) : null;
    const diff14d = rfProb14d !== null ? Math.abs(rfProb14d - hProb.up14d) : null;
    const diff30d = rfProb30d !== null ? Math.abs(rfProb30d - hProb.up30d) : null;

    comparisons.push({
      code,
      name: pais.nombre,
      riskLevel: pais.nivelRiesgo,
      heuristic: { riskScore: hRiskScore, probUp7d: hProb.up7d, probUp14d: hProb.up14d, probUp30d: hProb.up30d },
      rf: { riskScore: rfScore, probUp7d: rfProb7d, probUp14d: rfProb14d, probUp30d: rfProb30d },
      diff: { riskScore: diffScore, probUp7d: diff7d, probUp14d: diff14d, probUp30d: diff30d },
    });
  }

  const withRf = comparisons.filter(c => c.rf.riskScore !== null);
  const validDiffs = withRf.length;

  const mae = {
    riskScore: validDiffs > 0 ? withRf.reduce((s, c) => s + (c.diff.riskScore ?? 0), 0) / validDiffs : 0,
    probUp7d: validDiffs > 0 ? withRf.reduce((s, c) => s + (c.diff.probUp7d ?? 0), 0) / validDiffs : 0,
    probUp14d: validDiffs > 0 ? withRf.reduce((s, c) => s + (c.diff.probUp14d ?? 0), 0) / validDiffs : 0,
    probUp30d: validDiffs > 0 ? withRf.reduce((s, c) => s + (c.diff.probUp30d ?? 0), 0) / validDiffs : 0,
  };

  const maxDeviation = {
    riskScore: validDiffs > 0 ? Math.max(...withRf.map(c => c.diff.riskScore ?? 0)) : 0,
    probUp7d: validDiffs > 0 ? Math.max(...withRf.map(c => c.diff.probUp7d ?? 0)) : 0,
    probUp14d: validDiffs > 0 ? Math.max(...withRf.map(c => c.diff.probUp14d ?? 0)) : 0,
    probUp30d: validDiffs > 0 ? Math.max(...withRf.map(c => c.diff.probUp30d ?? 0)) : 0,
  };

  const countriesWithLargeDeviation = comparisons.filter(c =>
    (c.rf.riskScore !== null && (c.diff.riskScore ?? 0) > LARGE_DEVIATION_THRESHOLD.riskScore) ||
    (c.rf.probUp7d !== null && (c.diff.probUp7d ?? 0) > LARGE_DEVIATION_THRESHOLD.probUp7d)
  ).length;

  log.info(`Compared ${comparisons.length} countries (${validDiffs} with RF) in ${Date.now() - start}ms`);
  log.info(`MAE: riskScore=${mae.riskScore.toFixed(2)}, probUp7d=${mae.probUp7d.toFixed(4)}, probUp14d=${mae.probUp14d.toFixed(4)}, probUp30d=${mae.probUp30d.toFixed(4)}`);
  log.info(`Max deviation: riskScore=${maxDeviation.riskScore.toFixed(2)}, probUp7d=${maxDeviation.probUp7d.toFixed(4)}`);
  log.info(`Countries with large deviation: ${countriesWithLargeDeviation}`);

  return {
    totalCountries: comparisons.length,
    comparisons,
    mae,
    maxDeviation,
    countriesWithLargeDeviation,
    rfModelsLoaded: models !== null,
  };
}
