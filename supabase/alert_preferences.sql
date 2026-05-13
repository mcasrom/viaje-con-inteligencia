CREATE TABLE IF NOT EXISTS alert_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  country_code text NOT NULL,
  alert_types text[] DEFAULT ARRAY['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
  severity_min text DEFAULT 'medium',
  telegram_chat_id bigint,
  telegram_username text,
  frequency text DEFAULT 'inmediato',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_prefs_user_country
  ON alert_preferences(user_id, country_code)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_prefs_telegram_country
  ON alert_preferences(telegram_chat_id, country_code)
  WHERE telegram_chat_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_alert_prefs_country
  ON alert_preferences(country_code);
