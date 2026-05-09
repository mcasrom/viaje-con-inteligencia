-- ML Feature Store
-- Unified feature vectors per country for ML models
-- Updated daily by master cron

CREATE TABLE IF NOT EXISTS ml_features (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  computed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Risk features
  risk_level TEXT,
  risk_score INTEGER,
  risk_trend_7d NUMERIC(5,3) DEFAULT 0,
  risk_trend_30d NUMERIC(5,3) DEFAULT 0,

  -- Global index features (normalized)
  gpi_score NUMERIC(5,3),
  gti_score NUMERIC(5,3),
  hdi_score NUMERIC(5,3),
  ipc_score NUMERIC(5,3),

  -- Travel cost features
  tci_score NUMERIC(6,2),
  tci_trend TEXT,

  -- Event signals (30-day windows)
  events_30d INTEGER DEFAULT 0,
  high_impact_events_30d INTEGER DEFAULT 0,

  -- Demand & seasonality
  demand_index INTEGER,
  seasonality_index INTEGER,

  -- OSINT signal counts (7-day windows)
  signal_count_7d INTEGER DEFAULT 0,
  incident_count_7d INTEGER DEFAULT 0,

  -- Airspace / conflict indicators
  airspace_closure_active BOOLEAN DEFAULT FALSE,
  route_disruption_active BOOLEAN DEFAULT FALSE,

  -- Derived composites
  safety_composite NUMERIC(5,2),
  cost_composite NUMERIC(5,2),
  cluster_label TEXT,

  -- Feature versioning
  model_version TEXT DEFAULT 'v1'
);

CREATE INDEX IF NOT EXISTS idx_ml_features_country ON ml_features(country_code);
CREATE INDEX IF NOT EXISTS idx_ml_features_computed ON ml_features(computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_features_cluster ON ml_features(cluster_label);

ALTER TABLE ml_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON ml_features FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON ml_features FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON ml_features FOR UPDATE USING (true);
