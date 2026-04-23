-- Tabla de viajes guardados
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- TRIPS TABLE
-- ============================================

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
-- RLS POLICIES
-- ============================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);