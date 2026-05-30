CREATE TABLE IF NOT EXISTS trip_ratings (
  id BIGSERIAL PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_ratings_trip ON trip_ratings(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_ratings_user ON trip_ratings(user_id);

-- RLS policies
ALTER TABLE trip_ratings ENABLE ROW LEVEL SECURITY;

-- Users can see all ratings
CREATE POLICY "trip_ratings_public_read" ON trip_ratings
  FOR SELECT USING (true);

-- Authenticated users can insert their own rating
CREATE POLICY "trip_ratings_insert_own" ON trip_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rating
CREATE POLICY "trip_ratings_update_own" ON trip_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own rating
CREATE POLICY "trip_ratings_delete_own" ON trip_ratings
  FOR DELETE USING (auth.uid() = user_id);
