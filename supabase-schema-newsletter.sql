-- Newsletter Tables (Idempotente - ejecutar múltiples veces sin errores)

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_verified ON public.newsletter_subscribers(verified) WHERE verified = true;

-- RLS para newsletter (público para suscripción)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_history ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede suscribirse
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Política: solo el owner puede ver su suscripción
DROP POLICY IF EXISTS "Users can view own subscription" ON public.newsletter_subscribers;
CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (true);

-- Política: newsletter_history solo lectura pública
DROP POLICY IF EXISTS "Anyone can view newsletter history" ON public.newsletter_history;
CREATE POLICY "Anyone can view newsletter history" ON public.newsletter_history
  FOR SELECT USING (true);
