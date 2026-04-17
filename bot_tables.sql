CREATE TABLE IF NOT EXISTS public.bot_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_commands INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  command TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_stats_chat_id ON public.bot_stats(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_chat_id ON public.bot_commands(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_executed_at ON public.bot_commands(executed_at);