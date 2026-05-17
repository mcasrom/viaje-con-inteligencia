CREATE TABLE IF NOT EXISTS sentiment_alerts (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL DEFAULT '',
  avg_tone DECIMAL NOT NULL,
  previous_avg_tone DECIMAL,
  signal_count INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'medium',
  message TEXT NOT NULL DEFAULT '',
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_alerts_country ON sentiment_alerts(country_code);
CREATE INDEX IF NOT EXISTS idx_sentiment_alerts_created ON sentiment_alerts(created_at DESC);
