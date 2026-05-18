CREATE TABLE IF NOT EXISTS cron_history (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'running',
  steps JSONB,
  total_steps INTEGER DEFAULT 0,
  ok_steps INTEGER DEFAULT 0,
  error_steps INTEGER DEFAULT 0,
  heartbeat_sent BOOLEAN DEFAULT FALSE,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_cron_history_started_at ON cron_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_history_status ON cron_history(status);
CREATE INDEX IF NOT EXISTS idx_cron_history_duration ON cron_history(duration_ms);
