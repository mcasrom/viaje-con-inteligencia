-- Fix RLS en todas las tablas sin Row-Level Security
-- Ejecutar en Supabase SQL Editor — 27 May 2026

-- ============================================================
-- TABLAS DE REFERENCIA — lectura pública, escritura service_role
-- ============================================================

-- airports
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read airports" ON airports;
CREATE POLICY "Public read airports" ON airports FOR SELECT USING (true);

-- country_global_indices
ALTER TABLE country_global_indices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read country_global_indices" ON country_global_indices;
CREATE POLICY "Public read country_global_indices" ON country_global_indices FOR SELECT USING (true);

-- country_ipc
ALTER TABLE country_ipc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read country_ipc" ON country_ipc;
CREATE POLICY "Public read country_ipc" ON country_ipc FOR SELECT USING (true);

-- country_name_map
ALTER TABLE country_name_map ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read country_name_map" ON country_name_map;
CREATE POLICY "Public read country_name_map" ON country_name_map FOR SELECT USING (true);

-- indices
ALTER TABLE indices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read indices" ON indices;
CREATE POLICY "Public read indices" ON indices FOR SELECT USING (true);

-- seasonality
ALTER TABLE seasonality ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read seasonality" ON seasonality;
CREATE POLICY "Public read seasonality" ON seasonality FOR SELECT USING (true);

-- travel_attributes
ALTER TABLE travel_attributes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read travel_attributes" ON travel_attributes;
CREATE POLICY "Public read travel_attributes" ON travel_attributes FOR SELECT USING (true);

-- thematic_routes
ALTER TABLE thematic_routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read thematic_routes" ON thematic_routes;
CREATE POLICY "Public read thematic_routes" ON thematic_routes FOR SELECT USING (true);

-- seguros_catalog
ALTER TABLE seguros_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read seguros_catalog" ON seguros_catalog;
CREATE POLICY "Public read seguros_catalog" ON seguros_catalog FOR SELECT USING (true);

-- tourism_stats
ALTER TABLE tourism_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tourism_stats" ON tourism_stats;
CREATE POLICY "Public read tourism_stats" ON tourism_stats FOR SELECT USING (true);

-- pulso_keywords
ALTER TABLE pulso_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pulso_keywords" ON pulso_keywords;
CREATE POLICY "Public read pulso_keywords" ON pulso_keywords FOR SELECT USING (true);

-- score_weights
ALTER TABLE score_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read score_weights" ON score_weights;
CREATE POLICY "Public read score_weights" ON score_weights FOR SELECT USING (true);

-- premium_bundles
ALTER TABLE premium_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read premium_bundles" ON premium_bundles;
CREATE POLICY "Public read premium_bundles" ON premium_bundles FOR SELECT USING (true);

-- vinculacion_codes (vincular_codes)
ALTER TABLE vincular_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read vincular_codes" ON vincular_codes;
CREATE POLICY "Public read vincular_codes" ON vincular_codes FOR SELECT USING (true);

-- opensky_bounds (extra_lookups)
ALTER TABLE opensky_bounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read opensky_bounds" ON opensky_bounds;
CREATE POLICY "Public read opensky_bounds" ON opensky_bounds FOR SELECT USING (true);

-- ============================================================
-- TABLAS PÚBLICAS — lectura pública, escritura service_role
-- ============================================================

-- events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

-- incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read incidents" ON incidents;
CREATE POLICY "Public read incidents" ON incidents FOR SELECT USING (true);

-- risk_predictions
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read risk_predictions" ON risk_predictions;
CREATE POLICY "Public read risk_predictions" ON risk_predictions FOR SELECT USING (true);

-- model_training_log
ALTER TABLE model_training_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read model_training_log" ON model_training_log;
CREATE POLICY "Public read model_training_log" ON model_training_log FOR SELECT USING (true);

-- sentiment_alerts
ALTER TABLE sentiment_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read sentiment_alerts" ON sentiment_alerts;
CREATE POLICY "Public read sentiment_alerts" ON sentiment_alerts FOR SELECT USING (true);

-- serpapi_cache
ALTER TABLE serpapi_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read serpapi_cache" ON serpapi_cache;
CREATE POLICY "Public read serpapi_cache" ON serpapi_cache FOR SELECT USING (true);

-- post_ratings
ALTER TABLE post_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read post_ratings" ON post_ratings;
CREATE POLICY "Public read post_ratings" ON post_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert post_ratings" ON post_ratings;
CREATE POLICY "Authenticated insert post_ratings" ON post_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "User update own post_ratings" ON post_ratings;
CREATE POLICY "User update own post_ratings" ON post_ratings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TABLAS DE USUARIO — acceso solo al propietario
-- ============================================================

-- alert_preferences
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own alert_preferences" ON alert_preferences;
CREATE POLICY "Users read own alert_preferences" ON alert_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own alert_preferences" ON alert_preferences;
CREATE POLICY "Users insert own alert_preferences" ON alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own alert_preferences" ON alert_preferences;
CREATE POLICY "Users update own alert_preferences" ON alert_preferences FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own alert_preferences" ON alert_preferences;
CREATE POLICY "Users delete own alert_preferences" ON alert_preferences FOR DELETE USING (auth.uid() = user_id);

-- chat_conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own chat_conversations" ON chat_conversations;
CREATE POLICY "Users read own chat_conversations" ON chat_conversations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own chat_conversations" ON chat_conversations;
CREATE POLICY "Users insert own chat_conversations" ON chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own chat_conversations" ON chat_conversations;
CREATE POLICY "Users update own chat_conversations" ON chat_conversations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own chat_conversations" ON chat_conversations;
CREATE POLICY "Users delete own chat_conversations" ON chat_conversations FOR DELETE USING (auth.uid() = user_id);

-- user_insurance_policies
ALTER TABLE user_insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own user_insurance_policies" ON user_insurance_policies;
CREATE POLICY "Users read own user_insurance_policies" ON user_insurance_policies FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own user_insurance_policies" ON user_insurance_policies;
CREATE POLICY "Users insert own user_insurance_policies" ON user_insurance_policies FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own user_insurance_policies" ON user_insurance_policies;
CREATE POLICY "Users update own user_insurance_policies" ON user_insurance_policies FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own user_insurance_policies" ON user_insurance_policies;
CREATE POLICY "Users delete own user_insurance_policies" ON user_insurance_policies FOR DELETE USING (auth.uid() = user_id);

-- user_watchlist
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own user_watchlist" ON user_watchlist;
CREATE POLICY "Users read own user_watchlist" ON user_watchlist FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own user_watchlist" ON user_watchlist;
CREATE POLICY "Users insert own user_watchlist" ON user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own user_watchlist" ON user_watchlist;
CREATE POLICY "Users update own user_watchlist" ON user_watchlist FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own user_watchlist" ON user_watchlist;
CREATE POLICY "Users delete own user_watchlist" ON user_watchlist FOR DELETE USING (auth.uid() = user_id);

-- alert_events
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own alert_events" ON alert_events;
CREATE POLICY "Users read own alert_events" ON alert_events FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own alert_events" ON alert_events;
CREATE POLICY "Users insert own alert_events" ON alert_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLAS ADMIN — solo service_role (sin acceso desde cliente)
-- ============================================================

-- api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- api_plan_requests
ALTER TABLE api_plan_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert api_plan_requests" ON api_plan_requests;
CREATE POLICY "Public insert api_plan_requests" ON api_plan_requests FOR INSERT WITH CHECK (true);

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- cron_history
ALTER TABLE cron_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read cron_history" ON cron_history;
CREATE POLICY "Public read cron_history" ON cron_history FOR SELECT USING (true);

-- demand_shifts
ALTER TABLE demand_shifts ENABLE ROW LEVEL SECURITY;

-- newsletter_tracking
ALTER TABLE newsletter_tracking ENABLE ROW LEVEL SECURITY;

-- opensky_logs
ALTER TABLE opensky_logs ENABLE ROW LEVEL SECURITY;

-- osint_word_trends
ALTER TABLE osint_word_trends ENABLE ROW LEVEL SECURITY;

-- social_analytics
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- social_publish_log
ALTER TABLE social_publish_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLAS SISTEMA — lectura pública, escritura service_role
-- ============================================================

-- paises (migration)
ALTER TABLE paises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read paises" ON paises;
CREATE POLICY "Public read paises" ON paises FOR SELECT USING (true);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- TABLAS CRÍTICAS SIN RLS — newsletter, profiles, trips
-- ============================================================

-- newsletter_history
ALTER TABLE newsletter_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role all newsletter_history" ON newsletter_history;
CREATE POLICY "Service role all newsletter_history" ON newsletter_history
  FOR ALL USING (auth.role() = 'service_role');

-- newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service role all newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Service role all newsletter_subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- profiles (Supabase Auth managed — read public, write own)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- trips (user-owned)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own trips" ON trips;
CREATE POLICY "Users read own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own trips" ON trips;
CREATE POLICY "Users insert own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own trips" ON trips;
CREATE POLICY "Users update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own trips" ON trips;
CREATE POLICY "Users delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);
-- Public can read trips marked as public
DROP POLICY IF EXISTS "Public read public trips" ON trips;
CREATE POLICY "Public read public trips" ON trips
  FOR SELECT USING (is_public = true);

-- trip_ratings (already has RLS in trip_ratings.sql, but ensure)
ALTER TABLE trip_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trip_ratings_public_read" ON trip_ratings;
CREATE POLICY "trip_ratings_public_read" ON trip_ratings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "trip_ratings_insert_own" ON trip_ratings;
CREATE POLICY "trip_ratings_insert_own" ON trip_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "trip_ratings_update_own" ON trip_ratings;
CREATE POLICY "trip_ratings_update_own" ON trip_ratings
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "trip_ratings_delete_own" ON trip_ratings;
CREATE POLICY "trip_ratings_delete_own" ON trip_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- ml_features (service role only)
ALTER TABLE ml_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role all ml_features" ON ml_features;
CREATE POLICY "Service role all ml_features" ON ml_features
  FOR ALL USING (auth.role() = 'service_role');

-- ml_models (service role only)
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role all ml_models" ON ml_models;
CREATE POLICY "Service role all ml_models" ON ml_models
  FOR ALL USING (auth.role() = 'service_role');

-- ml_risk_predictions (service role only)
ALTER TABLE ml_risk_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role all ml_risk_predictions" ON ml_risk_predictions;
CREATE POLICY "Service role all ml_risk_predictions" ON ml_risk_predictions
  FOR ALL USING (auth.role() = 'service_role');

-- pois_cache (service role + public read)
ALTER TABLE pois_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pois_cache" ON pois_cache;
CREATE POLICY "Public read pois_cache" ON pois_cache
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role all pois_cache" ON pois_cache;
CREATE POLICY "Service role all pois_cache" ON pois_cache
  FOR ALL USING (auth.role() = 'service_role');

-- cloudflare_analytics (service role only)
ALTER TABLE cloudflare_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role all cloudflare_analytics" ON cloudflare_analytics;
CREATE POLICY "Service role all cloudflare_analytics" ON cloudflare_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- infografias (public read, service role write)
ALTER TABLE infografias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read infografias" ON infografias;
CREATE POLICY "Public read infografias" ON infografias
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role all infografias" ON infografias;
CREATE POLICY "Service role all infografias" ON infografias
  FOR ALL USING (auth.role() = 'service_role');

-- external_risk (public read, service role write)
ALTER TABLE external_risk ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read external_risk" ON external_risk;
CREATE POLICY "Public read external_risk" ON external_risk
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role all external_risk" ON external_risk;
CREATE POLICY "Service role all external_risk" ON external_risk
  FOR ALL USING (auth.role() = 'service_role');

-- osint_signals (public read, service role write)
ALTER TABLE osint_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read osint_signals" ON osint_signals;
CREATE POLICY "Public read osint_signals" ON osint_signals
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role all osint_signals" ON osint_signals;
CREATE POLICY "Service role all osint_signals" ON osint_signals
  FOR ALL USING (auth.role() = 'service_role');

-- pulse_keywords (already covered as pulso_keywords, but check both)
-- user_preferences (user-owned)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own user_preferences" ON user_preferences;
CREATE POLICY "Users read own user_preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own user_preferences" ON user_preferences;
CREATE POLICY "Users insert own user_preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own user_preferences" ON user_preferences;
CREATE POLICY "Users update own user_preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- onboarding_queue (admin only — already has RLS but ensure)
ALTER TABLE onboarding_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins pueden ver todo" ON onboarding_queue;
CREATE POLICY "Admins pueden ver todo" ON onboarding_queue
  FOR ALL USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');

-- afiliados (admin only — already has RLS but ensure)
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins pueden ver todo" ON afiliados;
CREATE POLICY "Admins pueden ver todo" ON afiliados
  FOR ALL USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');

-- colaboraciones (admin only)
ALTER TABLE colaboraciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins pueden ver todo" ON colaboraciones;
CREATE POLICY "Admins pueden ver todo" ON colaboraciones
  FOR ALL USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');

-- sentiment_alerts (already has RLS but ensure)
ALTER TABLE sentiment_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read sentiment_alerts" ON sentiment_alerts;
CREATE POLICY "Public read sentiment_alerts" ON sentiment_alerts
  FOR SELECT USING (true);

-- early_bird_digests (already has RLS but ensure)
ALTER TABLE early_bird_digests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_early_bird_all" ON early_bird_digests;
CREATE POLICY "service_role_early_bird_all" ON early_bird_digests
  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_early_bird_read" ON early_bird_digests;
CREATE POLICY "authenticated_early_bird_read" ON early_bird_digests
  FOR SELECT USING (auth.role() = 'authenticated');

-- trend_predictions (already has RLS but ensure)
ALTER TABLE trend_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trend_predictions public read" ON trend_predictions;
CREATE POLICY "trend_predictions public read" ON trend_predictions
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "trend_predictions service write" ON trend_predictions;
CREATE POLICY "trend_predictions service write" ON trend_predictions
  FOR ALL USING (auth.role() = 'service_role');

-- trip_ratings (already has RLS but ensure)
ALTER TABLE trip_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trip_ratings_public_read" ON trip_ratings;
CREATE POLICY "trip_ratings_public_read" ON trip_ratings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "trip_ratings_insert_own" ON trip_ratings;
CREATE POLICY "trip_ratings_insert_own" ON trip_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "trip_ratings_update_own" ON trip_ratings;
CREATE POLICY "trip_ratings_update_own" ON trip_ratings
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "trip_ratings_delete_own" ON trip_ratings;
CREATE POLICY "trip_ratings_delete_own" ON trip_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VERIFICACIÓN FINAL — tablas sin RLS
-- ============================================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false
ORDER BY tablename;
