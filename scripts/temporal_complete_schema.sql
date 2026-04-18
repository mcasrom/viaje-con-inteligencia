-- =====================================================
-- Viaje con Inteligencia - Schema Completo
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLAS DEL BOT TELEGRAM (sin auth)
-- =====================================================

-- Estadísticas del bot
CREATE TABLE IF NOT EXISTS public.bot_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_commands INTEGER DEFAULT 0
);

-- Comandos ejecutados
CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  command TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices bot
CREATE INDEX IF NOT EXISTS idx_bot_stats_chat_id ON public.bot_stats(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_chat_id ON public.bot_commands(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_executed_at ON public.bot_commands(executed_at);

-- RLS para bot (sin autenticación)
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_view_bot_stats" ON public.bot_stats FOR SELECT USING (true);
CREATE POLICY "anon_insert_bot_stats" ON public.bot_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_bot_stats" ON public.bot_stats FOR UPDATE USING (true);
CREATE POLICY "anon_view_bot_commands" ON public.bot_commands FOR SELECT USING (true);
CREATE POLICY "anon_insert_bot_commands" ON public.bot_commands FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. PERFILES DE USUARIO (auth requerida)
-- =====================================================

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

-- =====================================================
-- 3. FAVORITOS (auth requiseida)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, country_code)
);

-- Índices user
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_country_code ON public.favorites(country_code);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "users_select_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para favorites
CREATE POLICY "users_select_favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRIGGER AUTO-PROFILE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. VERIFICACIÓN
-- =====================================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;