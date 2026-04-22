-- Viaje con Inteligencia - Supabase Schema

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  telegram_id TEXT UNIQUE,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, country_code)
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de preferencias de alertas
CREATE TABLE IF NOT EXISTS public.alert_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT,
  alert_types TEXT[] DEFAULT ARRAY['riesgo', 'clima'],
  frequency TEXT DEFAULT 'inmediato',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, country_code)
);

-- Tabla de vistas de posts (anónima - sin auth)
CREATE TABLE IF NOT EXISTS public.post_views (
  slug TEXT PRIMARY KEY,
  views BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para alert_preferences
CREATE POLICY "Users can view own alert preferences" ON public.alert_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alert preferences" ON public.alert_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Trigger para crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_country_code ON public.favorites(country_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_alert_preferences_user_id ON public.alert_preferences(user_id);

-- Tabla de estadísticas del bot Telegram
CREATE TABLE IF NOT EXISTS public.bot_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_commands INTEGER DEFAULT 0
);

-- Tabla de comandos del bot
CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  command TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_stats_chat_id ON public.bot_stats(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_chat_id ON public.bot_commands(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_executed_at ON public.bot_commands(executed_at);

-- Tabla de suscriptores newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verify_token TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'web'
);

-- Tabla de historial newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

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

CREATE INDEX IF NOT EXISTS idx_scraper_logs_source ON public.scraper_logs(source);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_started_at ON public.scraper_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_country ON public.risk_alerts(country_code);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created ON public.risk_alerts(created_at);

-- Tabla de viajes guardados
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  country_code TEXT,
  start_date DATE,
  end_date DATE,
  days INTEGER DEFAULT 7,
  budget TEXT DEFAULT 'moderate',
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  itinerary_raw TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON public.trips(start_date);

-- ============================================
-- RLS para tablas de sistema (admin-only)
-- ============================================

-- trips: solo el propietario puede gestionar
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- post_views: solo lectura pública para contar vistas
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post_views" ON public.post_views
  FOR SELECT USING (true);
CREATE POLICY "Service can update post_views" ON public.post_views
  FOR UPDATE USING (true);

-- bot_stats: solo el bot puede insertar, admin puede ver
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bot_stats" ON public.bot_stats
  FOR SELECT USING (true);
CREATE POLICY "Telegram bot can insert stats" ON public.bot_stats
  FOR INSERT WITH CHECK (true);

-- bot_commands: solo el bot puede insertar
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Telegram bot can insert commands" ON public.bot_commands
  FOR INSERT WITH CHECK (true);

-- newsletter_subscribers: verificación por email (solo lectura pública)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view by token" ON public.newsletter_subscribers
  FOR SELECT USING (verified = true);
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "User can update own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (true);

-- newsletter_history: solo admin
ALTER TABLE public.newsletter_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage history" ON public.newsletter_history
  FOR ALL USING (true);

-- scraper_logs: solo lectura, servicio interno escribe
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view logs" ON public.scraper_logs
  FOR SELECT USING (true);
CREATE POLICY "Service can insert logs" ON public.scraper_logs
  FOR INSERT WITH CHECK (true);

-- risk_alerts: solo lectura pública
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view alerts" ON public.risk_alerts
  FOR SELECT USING (true);
CREATE POLICY "Service can insert alerts" ON public.risk_alerts
  FOR INSERT WITH CHECK (true);
