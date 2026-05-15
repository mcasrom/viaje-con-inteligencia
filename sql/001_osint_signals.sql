-- OSINT Signals Table
-- Run this in Supabase SQL Editor
-- ⚠️ If table already exists without these columns, run ALTER statements below.

CREATE TABLE IF NOT EXISTS osint_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('reddit', 'telegram', 'rss', 'twitter', 'gdacs', 'usgs', 'gdelt')),
  source_url text,
  title text NOT NULL,
  content text,
  author text,
  subreddit text,
  category text CHECK (category IN ('salud', 'seguridad', 'clima', 'logistico', 'geopolitico', 'otro')),
  confidence float DEFAULT 0.5,
  is_first_person boolean DEFAULT false,
  urgency text CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  summary text,
  location_name text,
  tone_score float,
  lat float,
  lng float,
  severity text,
  mag float,
  event_type text,
  post_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);

-- ALTER statements for existing tables (safe to re-run):
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS tone_score float;
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS lat float;
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS lng float;
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS severity text;
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS mag float;
-- ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS event_type text;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_osint_signals_created ON osint_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_osint_signals_category ON osint_signals (category);
CREATE INDEX IF NOT EXISTS idx_osint_signals_urgency ON osint_signals (urgency);
CREATE INDEX IF NOT EXISTS idx_osint_signals_source_url ON osint_signals (source_url);
CREATE INDEX IF NOT EXISTS idx_osint_signals_first_person ON osint_signals (is_first_person) WHERE is_first_person = true;
CREATE INDEX IF NOT EXISTS idx_osint_signals_tone ON osint_signals (tone_score) WHERE tone_score IS NOT NULL;

-- RLS Policy (public read for dashboard, admin write)
ALTER TABLE osint_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON osint_signals
  FOR SELECT USING (true);

CREATE POLICY "Allow service role write" ON osint_signals
  FOR ALL USING (true) WITH CHECK (true);

-- Vercel Cron Job
-- Add to vercel.json or configure via Vercel Dashboard:
-- Schedule: */15 * * * * (every 15 minutes)
-- URL: /api/cron/osint-sensor
-- Authorization: Bearer $CRON_SECRET
