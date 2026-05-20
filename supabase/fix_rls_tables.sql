-- Enable RLS on tables missing it
ALTER TABLE osint_word_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguros_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguros_perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- osint_word_trends: service_role only (internal analytics)
CREATE POLICY "service_role_only" ON osint_word_trends
  FOR ALL USING (auth.role() = 'service_role');

-- seguros_catalog: public read, service_role write
CREATE POLICY "public_read" ON seguros_catalog
  FOR SELECT USING (true);
CREATE POLICY "service_role_write" ON seguros_catalog
  FOR ALL USING (auth.role() = 'service_role');

-- seguros_perfiles: public read, service_role write
CREATE POLICY "public_read" ON seguros_perfiles
  FOR SELECT USING (true);
CREATE POLICY "service_role_write" ON seguros_perfiles
  FOR ALL USING (auth.role() = 'service_role');

-- user_watchlist: user owns their rows
CREATE POLICY "user_own_rows" ON user_watchlist
  FOR ALL USING (auth.uid() = user_id);
