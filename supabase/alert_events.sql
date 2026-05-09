CREATE TABLE IF NOT EXISTS alert_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  consecutive_failures INTEGER,
  notified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_source ON alert_events(source);
CREATE INDEX IF NOT EXISTS idx_alert_events_created ON alert_events(created_at DESC);
