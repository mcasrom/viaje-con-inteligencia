-- Viaje con Inteligencia - Fix RLS Security v2
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- v2: DROP IF EXISTS para evitar errores de duplicados

-- ============================================
-- Habilitar RLS en tablas sin protección
-- ============================================

-- post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view post_views" ON public.post_views;
DROP POLICY IF EXISTS "Service can update post_views" ON public.post_views;
CREATE POLICY "Anyone can view post_views" ON public.post_views FOR SELECT USING (true);
CREATE POLICY "Service can update post_views" ON public.post_views FOR UPDATE USING (true);

-- bot_stats
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view bot_stats" ON public.bot_stats;
DROP POLICY IF EXISTS "Telegram bot can insert stats" ON public.bot_stats;
CREATE POLICY "Anyone can view bot_stats" ON public.bot_stats FOR SELECT USING (true);
CREATE POLICY "Telegram bot can insert stats" ON public.bot_stats FOR INSERT WITH CHECK (true);

-- bot_commands
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Telegram bot can insert commands" ON public.bot_commands;
CREATE POLICY "Telegram bot can insert commands" ON public.bot_commands FOR INSERT WITH CHECK (true);

-- newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view by token" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service can verify subscription" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can verify subscription" ON public.newsletter_subscribers FOR UPDATE USING (true);

-- newsletter_history
ALTER TABLE public.newsletter_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage history" ON public.newsletter_history;
DROP POLICY IF EXISTS "Service can manage history" ON public.newsletter_history;
CREATE POLICY "Service can manage history" ON public.newsletter_history FOR ALL USING (true);

-- scraper_logs
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view logs" ON public.scraper_logs;
DROP POLICY IF EXISTS "Service can insert logs" ON public.scraper_logs;
CREATE POLICY "Anyone can view logs" ON public.scraper_logs FOR SELECT USING (true);
CREATE POLICY "Service can insert logs" ON public.scraper_logs FOR INSERT WITH CHECK (true);

-- risk_alerts
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.risk_alerts;
DROP POLICY IF EXISTS "Service can insert alerts" ON public.risk_alerts;
CREATE POLICY "Anyone can view alerts" ON public.risk_alerts FOR SELECT USING (true);
CREATE POLICY "Service can insert alerts" ON public.risk_alerts FOR INSERT WITH CHECK (true);

-- ============================================
-- Verificar
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;