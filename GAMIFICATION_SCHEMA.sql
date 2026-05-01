-- SPRINT 34 PARTE 1: TABLAS + RLS
-- Ejecutar primero este archivo en Supabase

-- 1. SISTEMA TOKENS DE VIAJERO

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven su propia actividad" ON user_activity;
CREATE POLICY "Usuarios ven su propia actividad" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios insertan su actividad" ON user_activity;
CREATE POLICY "Usuarios insertan su actividad" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. VIAJE COMPARTIDO

CREATE TABLE IF NOT EXISTS shared_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token VARCHAR(50) UNIQUE NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  views INTEGER DEFAULT 0,
  invitees_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS trip_invitees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES shared_trips(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_trips_token ON shared_trips(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_trips_user_id ON shared_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_trips_expires ON shared_trips(expires_at);
CREATE INDEX IF NOT EXISTS idx_trip_invitees_share_id ON trip_invitees(share_id);

ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus viajes compartidos" ON shared_trips;
CREATE POLICY "Usuarios ven sus viajes compartidos" ON shared_trips
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios crean viajes compartidos" ON shared_trips;
CREATE POLICY "Usuarios crean viajes compartidos" ON shared_trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Viajes compartidos son publicos por token" ON shared_trips;
CREATE POLICY "Viajes compartidos son publicos por token" ON shared_trips
  FOR SELECT USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS "Usuarios ven invitados de sus viajes" ON trip_invitees;
CREATE POLICY "Usuarios ven invitados de sus viajes" ON trip_invitees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_trips 
      WHERE shared_trips.id = trip_invitees.share_id 
      AND shared_trips.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cualquiera puede ser invitado" ON trip_invitees;
CREATE POLICY "Cualquiera puede ser invitado" ON trip_invitees
  FOR INSERT WITH CHECK (true);
