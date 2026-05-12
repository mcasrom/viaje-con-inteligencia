ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS slug text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_trips_public ON trips(is_public) WHERE is_public = true;
