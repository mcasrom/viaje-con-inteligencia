-- Viaje con Inteligencia - Tablas mínimas del Bot
-- Ejecutar en Supabase Dashboard > SQL Editor

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_bot_stats_chat_id ON public.bot_stats(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_chat_id ON public.bot_commands(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_executed_at ON public.bot_commands(executed_at);

-- Habilitar RLS (seguridad)
ALTER TABLE public.bot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para el bot (sin autenticación)
CREATE POLICY "Anyone can view bot_stats" ON public.bot_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bot_stats" ON public.bot_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bot_stats" ON public.bot_stats FOR UPDATE USING (true);

CREATE POLICY "Anyone can view bot_commands" ON public.bot_commands FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bot_commands" ON public.bot_commands FOR INSERT WITH CHECK (true);

-- Verificar
SELECT 'bot_stats' as table_name, COUNT(*) as rows FROM bot_stats
UNION ALL
SELECT 'bot_commands', COUNT(*) FROM bot_commands;