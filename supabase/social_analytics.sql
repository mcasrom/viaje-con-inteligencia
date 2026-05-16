-- Social Analytics: tracks engagement metrics per post per platform

CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('bluesky', 'mastodon', 'telegram', 'x_twitter')),
  post_slug TEXT NOT NULL,
  post_title TEXT,
  post_url TEXT,
  published_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_analytics_platform ON social_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_social_analytics_slug ON social_analytics(post_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_analytics_unique ON social_analytics(platform, post_slug);
