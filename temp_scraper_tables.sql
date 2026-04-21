-- Tabla de logs de scrapers (ejecutar en Supabase SQL Editor)
-- Viaje con Inteligencia - Scraper Logs

-- Tabla de logs de scrapers
CREATE TABLE IF NOT EXISTS public.scraper_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  items_scraped INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla de alertas de riesgo
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  country_name TEXT,
  old_risk TEXT,
  new_risk TEXT,
  alert_sent BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'maec',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scraper_logs_source ON public.scraper_logs(source);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_started_at ON public.scraper_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_country ON public.risk_alerts(country_code);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created ON public.risk_alerts(created_at);

-- Verificar
SELECT 'scraper_logs' as table_name, COUNT(*) as rows FROM scraper_logs
UNION ALL
SELECT 'risk_alerts' as table_name, COUNT(*) as rows FROM risk_alerts;
