CREATE TABLE IF NOT EXISTS country_global_indices (
  id BIGSERIAL PRIMARY KEY,
  index_type TEXT NOT NULL,  -- 'gpi', 'gti', 'hdi'
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score DECIMAL(6,3) NOT NULL,
  change INTEGER NOT NULL DEFAULT 0,
  region TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(index_type, country_code)
);

CREATE INDEX IF NOT EXISTS idx_indices_type ON country_global_indices(index_type);
CREATE INDEX IF NOT EXISTS idx_indices_code ON country_global_indices(country_code);

CREATE TABLE IF NOT EXISTS country_tourism (
  country_code TEXT PRIMARY KEY,
  arrivals BIGINT NOT NULL DEFAULT 0,
  pernoctaciones BIGINT NOT NULL DEFAULT 0,
  estancia_media DECIMAL(5,1) NOT NULL DEFAULT 7.0,
  source TEXT NOT NULL DEFAULT 'UNWTO',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
