ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id bigint;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_username text;
