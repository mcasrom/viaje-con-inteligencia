ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_models INT NOT NULL DEFAULT 0;
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_samples INT NOT NULL DEFAULT 0;
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_mae_risk_score NUMERIC(8,4);
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_mae_prob_7d NUMERIC(8,4);
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_mae_prob_14d NUMERIC(8,4);
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_mae_prob_30d NUMERIC(8,4);
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS rf_max_deviation_risk_score NUMERIC(8,4);
ALTER TABLE model_training_log ADD COLUMN IF NOT EXISTS countries_with_large_deviation INT NOT NULL DEFAULT 0;
