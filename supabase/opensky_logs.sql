CREATE TABLE IF NOT EXISTS opensky_logs (
  id BIGSERIAL PRIMARY KEY,
  country_code TEXT NOT NULL,
  flight_count INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opensky_logs_country ON opensky_logs(country_code);
CREATE INDEX IF NOT EXISTS idx_opensky_logs_checked ON opensky_logs(checked_at DESC);
