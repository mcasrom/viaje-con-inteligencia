-- Add telegram_id and telegram_username columns to profiles if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id bigint;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_username text;

-- Index for efficient lookups by telegram_id
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id) WHERE telegram_id IS NOT NULL;
