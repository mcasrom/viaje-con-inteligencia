-- Admin: Social publish log table
-- Tracks which blog posts have been published to which social platforms

CREATE TABLE IF NOT EXISTS social_publish_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_publish_slug ON social_publish_log(post_slug);
CREATE INDEX IF NOT EXISTS idx_social_publish_platform ON social_publish_log(platform);
