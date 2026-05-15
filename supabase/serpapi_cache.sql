CREATE TABLE IF NOT EXISTS serpapi_cache (
  route_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_serpapi_cache_stale ON serpapi_cache (updated_at) WHERE updated_at < NOW() - INTERVAL '24 hours';
