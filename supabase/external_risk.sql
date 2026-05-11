-- External risk sources (US State Dept, UK FCDO, etc.)
CREATE TABLE IF NOT EXISTS external_risk (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('us_state_dept', 'uk_fcdo')),
  country_code TEXT NOT NULL,
  risk_level INTEGER NOT NULL,  -- 1-4 for US, 1-3 for UK etc.
  risk_label TEXT,
  summary TEXT,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, country_code)
);

CREATE INDEX IF NOT EXISTS idx_external_risk_source ON external_risk(source);
CREATE INDEX IF NOT EXISTS idx_external_risk_country ON external_risk(country_code);

ALTER TABLE external_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON external_risk FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON external_risk FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON external_risk FOR UPDATE USING (true);

-- Add US risk score column to ml_features
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS us_risk_score INTEGER;
