-- ============================================================
-- Vinculación Telegram — migración completa
-- Pegar y ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Vincular codes (códigos temporales de 5 min)
CREATE TABLE IF NOT EXISTS vincular_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  telegram_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_vincular_codes_code ON vincular_codes(code);
CREATE INDEX IF NOT EXISTS idx_vincular_codes_expires ON vincular_codes(expires_at);

-- 2. Profiles — columns for linked Telegram account
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id bigint;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_username text;
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id) WHERE telegram_id IS NOT NULL;

-- 3. Alert preferences (si no existe)
CREATE TABLE IF NOT EXISTS alert_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  alert_types text[] DEFAULT ARRAY['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
  severity_min text DEFAULT 'medium',
  telegram_chat_id bigint,
  telegram_username text,
  frequency text DEFAULT 'inmediato',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_prefs_user_country ON alert_preferences(user_id, country_code) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_prefs_telegram_country ON alert_preferences(telegram_chat_id, country_code) WHERE telegram_chat_id IS NOT NULL;
