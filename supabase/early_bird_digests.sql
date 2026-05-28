-- Early Bird Digests history table
CREATE TABLE IF NOT EXISTS early_bird_digests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  digest_text TEXT NOT NULL,
  incidents_count INT NOT NULL DEFAULT 0,
  maec_changes_count INT NOT NULL DEFAULT 0,
  sentiment_alerts_count INT NOT NULL DEFAULT 0,
  health_ok INT NOT NULL DEFAULT 0,
  health_fail INT NOT NULL DEFAULT 0,
  traffic_page_views INT,
  traffic_uniques INT,
  newsletter_subscribers INT NOT NULL DEFAULT 0,
  sent_telegram BOOLEAN NOT NULL DEFAULT FALSE,
  sent_email BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_early_bird_created_at ON early_bird_digests(created_at DESC);

-- RLS
ALTER TABLE early_bird_digests ENABLE ROW LEVEL SECURITY;

-- Service role can read/write (admin API + cron)
CREATE POLICY "service_role_early_bird_all" ON early_bird_digests
  FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users can read (admin panel)
CREATE POLICY "authenticated_early_bird_read" ON early_bird_digests
  FOR SELECT USING (auth.role() = 'authenticated');
