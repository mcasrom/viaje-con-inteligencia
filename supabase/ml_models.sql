-- ML Models store
-- Serialized RandomForest models + evaluation metrics
-- Updated daily by master cron after training

CREATE TABLE IF NOT EXISTS ml_models (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_type TEXT NOT NULL,          -- 'risk_score_rf' | 'prob_up_7d_rf' | 'prob_up_14d_rf' | 'prob_up_30d_rf'
  model_version TEXT NOT NULL,
  model_data JSONB NOT NULL,         -- serialized RandomForest model
  feature_names TEXT[] NOT NULL,      -- ordered feature names
  trained_at TIMESTAMPTZ DEFAULT NOW(),
  n_estimators INTEGER DEFAULT 100,
  n_samples INTEGER DEFAULT 0,
  accuracy NUMERIC(5,3),
  precision NUMERIC(5,3),
  recall NUMERIC(5,3),
  f1_score NUMERIC(5,3),
  mse NUMERIC(10,4),                -- for regression models
  r2 NUMERIC(5,3),
  feature_importance JSONB,          -- { feature_name: importance, ... }
  UNIQUE(model_type, model_version)
);

CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_version ON ml_models(model_version);

ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON ml_models FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON ml_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON ml_models FOR UPDATE USING (true);
