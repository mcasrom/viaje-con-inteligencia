-- INE Tourism Historical Data Storage
-- Supabase Free Tier: 500MB/mes = ~2 años de datos tourism

-- Tabla principal: datos mensuales tourism España
CREATE TABLE IF NOT EXISTS ine_tourism_history (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,  -- Format: YYYY-MM-01
  year INT NOT NULL,
  month INT NOT NULL,
  total_tourists BIGINT DEFAULT 0,
  variation FLOAT DEFAULT 0,
  total_spend BIGINT DEFAULT 0,
  avg_per_tourist FLOAT DEFAULT 0,
  avg_daily FLOAT DEFAULT 0,
  avg_stay FLOAT DEFAULT 0,
  source TEXT DEFAULT 'INE-FRONTUR-EGATUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ine_tourism_date ON ine_tourism_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_ine_tourism_year_month ON ine_tourism_history(year, month);

-- Tabla: datos por comunidad autónoma
CREATE TABLE IF NOT EXISTS ine_region_history (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  region TEXT NOT NULL,
  tourists BIGINT DEFAULT 0,
  spend BIGINT DEFAULT 0,
  segment TEXT DEFAULT 'mixto',
  source TEXT DEFAULT 'INE-FRONTUR-EGATUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, region)
);

CREATE INDEX IF NOT EXISTS idx_ine_region_date ON ine_region_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_ine_region_region ON ine_region_history(region);

-- Tabla: datos por país de origen
CREATE TABLE IF NOT EXISTS ine_country_history (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  country TEXT NOT NULL,
  tourists BIGINT DEFAULT 0,
  spend BIGINT DEFAULT 0,
  avg_stay FLOAT DEFAULT 0,
  source TEXT DEFAULT 'INE-FRONTUR-EGATUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, country)
);

CREATE INDEX IF NOT EXISTS idx_ine_country_date ON ine_country_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_ine_country_country ON ine_country_history(country);

-- Tabla: ML features para clustering
CREATE TABLE IF NOT EXISTS ine_ml_features (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  tourists_trend FLOAT DEFAULT 0,
  spend_trend FLOAT DEFAULT 0,
  stay_trend FLOAT DEFAULT 0,
  seasonality_index JSONB,
  segment_mix JSONB,
  prediction JSONB,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (opcional para datos públicos)
ALTER TABLE ine_tourism_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ine_region_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ine_country_history ENABLE ROW LEVEL SECURITY;

-- Policy para lectura pública (servidor)
CREATE POLICY "Allow public read" ON ine_tourism_history FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ine_region_history FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ine_country_history FOR SELECT USING (true);

-- Policy para escritura (solo service role)
CREATE POLICY "Allow service write" ON ine_tourism_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service write" ON ine_region_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service write" ON ine_country_history FOR INSERT WITH CHECK (true);