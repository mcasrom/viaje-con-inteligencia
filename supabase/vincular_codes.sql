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
