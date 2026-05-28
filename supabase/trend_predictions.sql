-- Trend predictions log
-- Tracks daily trend predictions vs actual MAEC changes for model validation

CREATE TABLE IF NOT EXISTS trend_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  current_risk TEXT NOT NULL,
  current_risk_num INTEGER NOT NULL,
  trend TEXT NOT NULL, -- 'subiendo', 'bajando', 'estable'
  probability_up_7d FLOAT NOT NULL,
  probability_down_7d FLOAT NOT NULL,
  confidence TEXT NOT NULL, -- 'alta', 'media', 'baja'
  factors TEXT[] DEFAULT '{}',
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Actual outcome (filled when MAEC changes)
  actual_change TEXT, -- 'subio', 'bajo', 'igual'
  actual_change_date TIMESTAMPTZ,
  was_correct BOOLEAN
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_trend_predictions_country ON trend_predictions(country_code);
CREATE INDEX IF NOT EXISTS idx_trend_predictions_date ON trend_predictions(predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_predictions_trend ON trend_predictions(trend);

-- RLS
ALTER TABLE trend_predictions ENABLE ROW LEVEL SECURITY;

-- Public read (for country pages)
CREATE POLICY "trend_predictions public read" ON trend_predictions
  FOR SELECT USING (true);

-- Service role write (cron + API)
CREATE POLICY "trend_predictions service write" ON trend_predictions
  FOR ALL USING (auth.role() = 'service_role');

-- Retention: 180 days
CREATE OR REPLACE FUNCTION cleanup_old_trend_predictions()
RETURNS void AS $$
BEGIN
  DELETE FROM trend_predictions WHERE predicted_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;
