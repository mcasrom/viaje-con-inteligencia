import { supabaseAdmin } from './supabase-admin';
import { paisesData } from '@/data/paises';
import { getFeaturesByCountry } from './ml-features';
import {
  predictCountry, buildFeatureVector, getSignalStats, getIncidentStats,
  getRecentRiskChanges, getAirspaceClosures, getTransitionMatrix,
} from './ml-risk-predictor';
import { createLogger } from './logger';

const log = createLogger('RFTrainer');

export const FEATURE_NAMES = [
  'riskNum', 'signalCriticalCount', 'signalHighCount', 'signalMediumCount',
  'signalCount', 'incidentHighCount', 'incidentMediumCount', 'incidentCount',
  'changes30d', 'seasonalMult', 'gpi_score', 'gti_score', 'hdi_score',
  'ipc_score', 'tci_score', 'events30d', 'highImpactEvents30d',
  'usRiskScore', 'trend7d', 'trend30d',
];

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

    for (const code of countries) {
      const pred = await predictCountry(code);
      if (!pred) continue;
      const features = await buildFeatureVector(code);
      if (!features) continue;
      X.push(features);
      yScore.push(pred.riskScore);
      yProb7d.push(pred.probabilityUp7d);
      yProb14d.push(pred.probabilityUp14d);
      yProb30d.push(pred.probabilityUp30d);
    }

    if (X.length < 10) {
      return { success: false, models: 0, nSamples: X.length, error: `Not enough samples: ${X.length}` };
    }

    const nSamples = X.length;

    const models = [
      { type: 'risk_score_rf', y: yScore, regression: true },
      { type: 'prob_up_7d_rf', y: yProb7d, regression: true },
      { type: 'prob_up_14d_rf', y: yProb14d, regression: true },
      { type: 'prob_up_30d_rf', y: yProb30d, regression: true },
    ];

    let trained = 0;
    for (const model of models) {
      const rf = new RF.RandomForestRegression({
        nEstimators: 100,
        treeOptions: { maxDepth: 10 },
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
        n_estimators: 100,
        n_samples: nSamples,
        mse: Math.round(mse * 10000) / 10000,
        r2: Math.round(r2 * 1000) / 1000,
      }, { onConflict: 'model_type,model_version' });

      if (!error) trained++;
      else log.error(`Failed to save model ${model.type}:`, error.message);
    }

    return { success: trained > 0, models: trained, nSamples };
  } catch (e: any) {
    return { success: false, models: 0, nSamples: 0, error: e.message };
  }
}
