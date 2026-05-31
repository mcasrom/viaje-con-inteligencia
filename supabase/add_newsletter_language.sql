-- Add language tracking to newsletter_history
ALTER TABLE newsletter_history ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'es';
