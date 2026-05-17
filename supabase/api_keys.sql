-- API Keys B2B
CREATE TABLE IF NOT EXISTS api_keys (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  active BOOLEAN DEFAULT TRUE,
  monthly_limit INTEGER NOT NULL DEFAULT 3000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_usage (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  api_key_id BIGINT REFERENCES api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  endpoint TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_key_id, date, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_date ON api_usage(api_key_id, date);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(date);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service read all keys" ON api_keys FOR SELECT USING (true);
CREATE POLICY "Service insert usage" ON api_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Service read usage" ON api_usage FOR SELECT USING (true);
CREATE POLICY "Service update usage" ON api_usage FOR UPDATE USING (true);
