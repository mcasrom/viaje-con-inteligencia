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
