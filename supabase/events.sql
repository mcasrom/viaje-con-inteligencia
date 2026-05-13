CREATE TABLE IF NOT EXISTS events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  country TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  start_date DATE,
  end_date DATE,
  impact_traveler TEXT,
  impact_note TEXT,
  url TEXT,
  lat FLOAT,
  lng FLOAT,
  city TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_source_id ON events(source_id);
