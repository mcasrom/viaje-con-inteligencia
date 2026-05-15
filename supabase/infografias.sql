-- Infografía semanal de riesgos globales
CREATE TABLE IF NOT EXISTS infografias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  week_end DATE NOT NULL,
  edition INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  -- WEBP image
  image_url TEXT,
  image_width INTEGER DEFAULT 1200,
  image_height INTEGER DEFAULT 1800,
  image_size_bytes INTEGER,
  -- JSON data snapshot
  data_snapshot JSONB NOT NULL DEFAULT '{}',
  -- Global Weekly Index
  gwi_score DECIMAL(5,2),
  gwi_trend DECIMAL(5,2), -- change vs previous week
  -- Premium
  premium_data JSONB DEFAULT '{}',
  pdf_url TEXT,
  ai_analysis TEXT,
  -- Metadata
  country_count INTEGER,
  top_risk_countries TEXT[],
  risk_distribution JSONB DEFAULT '{}',
  source TEXT DEFAULT 'system',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infografias_week_start ON infografias(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_infografias_published ON infografias(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_infografias_gwi ON infografias(gwi_score);

-- Storage bucket for infographic images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('infografias', 'infografias', true, 1048576, ARRAY['image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS
ALTER TABLE infografias ENABLE ROW LEVEL SECURITY;

-- Public can read published
CREATE POLICY "Public can view published infografias"
  ON infografias FOR SELECT
  USING (is_published = true);

-- Admin only write
CREATE POLICY "Admin only insert"
  ON infografias FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin only update"
  ON infografias FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin only delete"
  ON infografias FOR DELETE
  USING (auth.role() = 'service_role');
