-- ML Risk Predictions
CREATE TABLE IF NOT EXISTS risk_predictions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL,
  current_risk TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,  -- 1-100
  probability_up_7d NUMERIC(4,3) DEFAULT 0,
  probability_up_14d NUMERIC(4,3) DEFAULT 0,
  probability_up_30d NUMERIC(4,3) DEFAULT 0,
  signal_count_7d INTEGER DEFAULT 0,
  incident_count_7d INTEGER DEFAULT 0,
  top_factors TEXT[] DEFAULT '{}',
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, predicted_at)
);

CREATE INDEX IF NOT EXISTS idx_risk_predictions_country ON risk_predictions(country_code);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_date ON risk_predictions(predicted_at);

-- Also ensure maec_risk_history has proper structure
CREATE TABLE IF NOT EXISTS maec_risk_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, date)
);
