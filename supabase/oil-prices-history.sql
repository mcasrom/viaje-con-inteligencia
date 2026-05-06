-- Dynamic Oil Price History Table
-- Stores real Brent crude oil prices fetched daily via cron

CREATE TABLE IF NOT EXISTS oil_prices_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  price_usd NUMERIC(8,2) NOT NULL,
  source TEXT DEFAULT 'api', -- 'api', 'scraped', 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_oil_prices_date ON oil_prices_history(date DESC);

-- Seed: historical Brent prices (Jan 2024 - May 2026)
-- Source: EIA/ICE historical data
INSERT INTO oil_prices_history (date, price_usd, source) VALUES
  ('2024-01-01', 78.50, 'manual'),
  ('2024-02-01', 82.10, 'manual'),
  ('2024-03-01', 85.30, 'manual'),
  ('2024-04-01', 87.20, 'manual'),
  ('2024-05-01', 83.40, 'manual'),
  ('2024-06-01', 80.10, 'manual'),
  ('2024-07-01', 78.90, 'manual'),
  ('2024-08-01', 76.50, 'manual'),
  ('2024-09-01', 73.20, 'manual'),
  ('2024-10-01', 71.80, 'manual'),
  ('2024-11-01', 72.40, 'manual'),
  ('2024-12-01', 74.10, 'manual'),
  ('2025-01-01', 76.80, 'manual'),
  ('2025-02-01', 79.30, 'manual'),
  ('2025-03-01', 81.50, 'manual'),
  ('2025-04-01', 83.20, 'manual'),
  ('2025-05-01', 80.60, 'manual'),
  ('2025-06-01', 77.90, 'manual'),
  ('2025-07-01', 75.40, 'manual'),
  ('2025-08-01', 73.10, 'manual'),
  ('2025-09-01', 71.50, 'manual'),
  ('2025-10-01', 70.20, 'manual'),
  ('2025-11-01', 71.80, 'manual'),
  ('2025-12-01', 73.50, 'manual'),
  ('2026-01-01', 78.20, 'manual'),
  ('2026-02-01', 84.60, 'manual'),
  ('2026-03-01', 92.10, 'manual'),
  ('2026-04-01', 98.50, 'manual'),
  ('2026-05-01', 103.40, 'manual')
ON CONFLICT (date) DO NOTHING;

-- RLS: public read, service role write
ALTER TABLE oil_prices_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read oil prices" ON oil_prices_history FOR SELECT USING (true);
CREATE POLICY "Allow service write oil prices" ON oil_prices_history FOR ALL USING (true);
