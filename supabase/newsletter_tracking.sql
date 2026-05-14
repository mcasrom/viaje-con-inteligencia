ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS resend_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS opens_count INTEGER DEFAULT 0;
ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0;
ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS unique_opens_count INTEGER DEFAULT 0;
ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS unique_clicks_count INTEGER DEFAULT 0;
