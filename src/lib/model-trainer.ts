import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { createLogger } from './logger';
import { computeFeaturesForAllCountries } from './ml-features';
import { saveAllPredictions } from './ml-risk-predictor';
import { trainRandomForest } from './ml-trainer-rf';
import { comparePredictions } from './ml-compare';

const log = createLogger('ModelTrainer');
const MODEL_VERSION = 'v5';

interface TrainingMetrics {
  featuresComputed: number;
  featuresErrors: number;
  predictionsMade: number;
  predictionsErrors: number;
  totalCountries: number;
  durationMs: number;
  rfModels: number;
  rfSamples: number;
  comparison?: {
    maeRiskScore: number;
    maeProb7d: number;
    maeProb14d: number;
    maeProb30d: number;
    maxDeviationRiskScore: number;
    countriesWithLargeDeviation: number;
  };
}

export async function trainModel(): Promise<{ success: boolean; metrics: TrainingMetrics; error?: string }> {
  const start = Date.now();
  log.info('Starting model training...');

  if (!isSupabaseAdminConfigured()) {
    return { success: false, metrics: { featuresComputed: 0, featuresErrors: 0, predictionsMade: 0, predictionsErrors: 0, totalCountries: 0, durationMs: 0, rfModels: 0, rfSamples: 0 }, error: 'No Supabase configured' };
  }

  const { paisesData } = await import('@/data/paises');
  const totalCountries = Object.keys(paisesData).filter(c => c !== 'cu').length;

  // Phase 1: Compute features for all countries
  log.info('Phase 1: Computing features...');
  const featResult = await computeFeaturesForAllCountries();

  // Phase 2: Generate and save predictions (heuristic)
  log.info('Phase 2: Generating predictions...');
  const predResult = await saveAllPredictions();

  // Phase 3: Train RandomForest model on heuristic predictions
  log.info('Phase 3: Training RandomForest...');
  const rfResult = await trainRandomForest();

  if (rfResult.success) {
    log.info(`RF trained: ${rfResult.models} models on ${rfResult.nSamples} samples`);
  } else {
    log.warn(`RF training skipped: ${rfResult.error || 'unknown'}`);
  }

  // Phase 4: Compare RF vs heuristic predictions
  let comparison: TrainingMetrics['comparison'];
  if (rfResult.success) {
    log.info('Phase 4: Comparing RF vs heuristic...');
    try {
      const cmp = await comparePredictions();
      comparison = {
        maeRiskScore: Math.round(cmp.mae.riskScore * 100) / 100,
        maeProb7d: Math.round(cmp.mae.probUp7d * 10000) / 10000,
        maeProb14d: Math.round(cmp.mae.probUp14d * 10000) / 10000,
        maeProb30d: Math.round(cmp.mae.probUp30d * 10000) / 10000,
        maxDeviationRiskScore: Math.round(cmp.maxDeviation.riskScore * 100) / 100,
        countriesWithLargeDeviation: cmp.countriesWithLargeDeviation,
      };
      log.info(`MAE: riskScore=${comparison.maeRiskScore}, probUp7d=${comparison.maeProb7d}, probUp14d=${comparison.maeProb14d}, probUp30d=${comparison.maeProb30d}`);
    } catch (e) {
      log.error('Comparison failed:', e);
    }
  }

  const durationMs = Date.now() - start;

  const metrics: TrainingMetrics = {
    featuresComputed: featResult.ok,
    featuresErrors: featResult.errors,
    predictionsMade: predResult.ok,
    predictionsErrors: predResult.errors,
    totalCountries,
    durationMs,
    rfModels: rfResult.models,
    rfSamples: rfResult.nSamples,
    comparison,
  };

  // Store training log
  try {
    await supabaseAdmin.from('model_training_log').insert({
      model_version: MODEL_VERSION,
      features_computed: metrics.featuresComputed,
      features_errors: metrics.featuresErrors,
      predictions_made: metrics.predictionsMade,
      predictions_errors: metrics.predictionsErrors,
      total_countries: metrics.totalCountries,
      duration_ms: metrics.durationMs,
      trained_at: new Date().toISOString(),
      rf_models: metrics.rfModels,
      rf_samples: metrics.rfSamples,
      rf_mae_risk_score: comparison?.maeRiskScore ?? null,
      rf_mae_prob_7d: comparison?.maeProb7d ?? null,
      rf_mae_prob_14d: comparison?.maeProb14d ?? null,
      rf_mae_prob_30d: comparison?.maeProb30d ?? null,
      rf_max_deviation_risk_score: comparison?.maxDeviationRiskScore ?? null,
      countries_with_large_deviation: comparison?.countriesWithLargeDeviation ?? 0,
    });
  } catch (e) {
    log.error('Failed to store training log:', e);
  }

  log.info(`Training complete: ${metrics.featuresComputed} features, ${metrics.predictionsMade} predictions, ${metrics.rfModels} RF models in ${durationMs}ms`);
  return { success: true, metrics };
}
