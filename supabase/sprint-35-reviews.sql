-- Sprint 35: Reviews & Social Proof
-- Table for storing user reviews/testimonials

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  country TEXT,
  trip_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching reviews by country
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country);

-- Index for ordering by date
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);

-- Anyone can insert reviews (anonymous)
CREATE POLICY "Anyone can write reviews" ON reviews FOR INSERT WITH CHECK (true);
