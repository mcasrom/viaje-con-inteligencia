-- Viaje con Inteligencia - Fix RLS Security
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- ============================================
-- Habilitar RLS en tablas sin protección
-- ============================================

-- post_views: lectura pública para contador de vistas
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post_views" ON public.post_views
  FOR SELECT USING (true);
CREATE POLICY "Service can update post_views" ON public.post_views
  FOR UPDATE USING (true);

-- bot_stats: solo el bot puede insertar
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Telegram bot can insert stats" ON public.bot_stats
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bot_stats" ON public.bot_stats
  FOR SELECT USING (true);

-- bot_commands: solo el bot puede insertar
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Telegram bot can insert commands" ON public.bot_commands
  FOR INSERT WITH CHECK (true);

-- newsletter_subscribers: suscripción pública, gestión por email
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can verify subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (true);

-- newsletter_history: admin-only (ajustar según necesidad)
ALTER TABLE public.newsletter_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service can manage history" ON public.newsletter_history
  FOR ALL USING (true);

-- scraper_logs: lectura pública, servicio interno escribe
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view logs" ON public.scraper_logs
  FOR SELECT USING (true);
CREATE POLICY "Service can insert logs" ON public.scraper_logs
  FOR INSERT WITH CHECK (true);

-- risk_alerts: lectura pública
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view alerts" ON public.risk_alerts
  FOR SELECT USING (true);
CREATE POLICY "Service can insert alerts" ON public.risk_alerts
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Verificar RLS habilitado
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
ORDER BY tablename;