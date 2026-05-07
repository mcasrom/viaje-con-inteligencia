-- Blog post ratings with user association
CREATE TABLE IF NOT EXISTS post_ratings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_ratings_slug ON post_ratings(slug);
CREATE INDEX IF NOT EXISTS idx_post_ratings_user ON post_ratings(user_id);

-- Allow one rating per user per post
ALTER TABLE post_ratings DROP CONSTRAINT IF EXISTS unique_user_post_rating;
ALTER TABLE post_ratings ADD CONSTRAINT unique_user_post_rating UNIQUE (slug, user_id);
