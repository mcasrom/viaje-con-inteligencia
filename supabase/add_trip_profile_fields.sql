ALTER TABLE trips ADD COLUMN IF NOT EXISTS traveler_profile text DEFAULT 'mochilero';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS trip_types text[] DEFAULT '{}';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS max_km integer DEFAULT 200;
