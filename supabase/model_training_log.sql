CREATE TABLE IF NOT EXISTS model_training_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_version TEXT NOT NULL DEFAULT 'v4',
  trained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  features_computed INT NOT NULL DEFAULT 0,
  features_errors INT NOT NULL DEFAULT 0,
  predictions_made INT NOT NULL DEFAULT 0,
  predictions_errors INT NOT NULL DEFAULT 0,
  total_countries INT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_model_training_log_trained_at ON model_training_log(trained_at DESC);
