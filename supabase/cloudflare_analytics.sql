CREATE TABLE cloudflare_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Resumen (del dashboard)
  page_views BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  total_requests BIGINT DEFAULT 0,
  bandwidth_bytes BIGINT DEFAULT 0,
  threat_count BIGINT DEFAULT 0,

  -- Top páginas (JSONB: [{path, views, rank}])
  top_pages JSONB DEFAULT '[]'::jsonb,

  -- Por código de estado (JSONB: {200: N, 301: N, 404: N, 500: N, ...})
  status_codes JSONB DEFAULT '{}'::jsonb,

  -- Por país (JSONB: [{country, requests, pct}])
  countries JSONB DEFAULT '[]'::jsonb,

  -- Métricas SEO (JSONB: {404_count, 301_count, avg_response_time_ms, ...})
  seo_metrics JSONB DEFAULT '{}'::jsonb,

  -- CSV completo (almacenado como texto para descarga directa)
  csv_data TEXT,

  -- Metadata de la extracción
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  source_ips TEXT[] DEFAULT '{}',
  ssl_encrypted_pct NUMERIC(5,2) DEFAULT 0,
  crawler_requests BIGINT DEFAULT 0,

  -- Flags
  is_analysed BOOLEAN DEFAULT false,
  analysis_summary TEXT
);

CREATE INDEX idx_cfa_week ON cloudflare_analytics(week_start DESC);
ALTER TABLE cloudflare_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on cloudflare_analytics"
  ON cloudflare_analytics USING (true) WITH CHECK (true);
