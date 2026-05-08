CREATE TABLE IF NOT EXISTS pois_cache (
  country_code TEXT NOT NULL,
  poi_type TEXT NOT NULL,
  profile TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (country_code, poi_type, profile)
);

CREATE INDEX IF NOT EXISTS idx_pois_cache_stale ON pois_cache (updated_at) WHERE updated_at < NOW() - INTERVAL '6 hours';

ALTER TABLE pois_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read, only service role can write
CREATE POLICY "Anyone can read pois_cache"
  ON pois_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert pois_cache"
  ON pois_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update pois_cache"
  ON pois_cache FOR UPDATE
  USING (true);
