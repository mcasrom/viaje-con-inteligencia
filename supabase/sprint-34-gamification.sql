-- SPRINT 34: Gamificación + Viaje Compartido

-- ==========================================
-- 1. SISTEMA TOKENS DE VIAJERO (GAMIFICACIÓN)
-- ==========================================

-- Tabla de actividad del usuario
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'login', 'generate_route', 'share_route', 'add_favorite', 'view_country', 'generate_claim', 'export_pdf'
  points INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_action ON user_activity(action);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);

-- Habilitar RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios ven su propia actividad" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan su actividad" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para auto-crear perfil ya existe en handle_new_user()

-- ==========================================
-- 2. VIAJE COMPARTIDO (VIRALIDAD)
-- ==========================================

-- Tabla de viajes compartidos
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

-- Tabla de invitados a viajes
CREATE TABLE IF NOT EXISTS trip_invitees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES shared_trips(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_shared_trips_token ON shared_trips(share_token);
CREATE INDEX idx_shared_trips_user_id ON shared_trips(user_id);
CREATE INDEX idx_shared_trips_expires ON shared_trips(expires_at);
CREATE INDEX idx_trip_invitees_share_id ON trip_invitees(share_id);

-- Habilitar RLS
ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitees ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shared_trips
CREATE POLICY "Usuarios ven sus viajes compartidos" ON shared_trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean viajes compartidos" ON shared_trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Viajes compartidos son públicos por token" ON shared_trips
  FOR SELECT USING (is_active = true AND expires_at > NOW());

-- Políticas RLS para trip_invitees
CREATE POLICY "Usuarios ven invitados de sus viajes" ON trip_invitees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_trips 
      WHERE shared_trips.id = trip_invitees.share_id 
      AND shared_trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Cualquiera puede ser invitado" ON trip_invitees
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- 3. FUNCIÓN PARA CALCULAR PUNTUACIÓN TOTAL
-- ==========================================

CREATE OR REPLACE FUNCTION get_user_total_points(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(points) FROM user_activity WHERE user_id = p_user_id),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. FUNCIÓN PARA OBTENER NIVEL DE USUARIO
-- ==========================================

CREATE OR REPLACE FUNCTION get_user_level(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_points INTEGER;
  level_name VARCHAR(50);
  level_icon VARCHAR(10);
  next_level_points INTEGER;
  progress_percent FLOAT;
BEGIN
  total_points := get_user_total_points(p_user_id);
  
  IF total_points >= 500 THEN
    level_name := 'Oráculo';
    level_icon := '🔮';
    next_level_points := 500;
    progress_percent := 100;
  ELSIF total_points >= 150 THEN
    level_name := 'Guía';
    level_icon := '🧭';
    next_level_points := 500;
    progress_percent := ((total_points - 150)::FLOAT / 350) * 100;
  ELSE
    level_name := 'Explorador';
    level_icon := '🔍';
    next_level_points := 150;
    progress_percent := (total_points::FLOAT / 150) * 100;
  END IF;
  
  RETURN jsonb_build_object(
    'total_points', total_points,
    'level_name', level_name,
    'level_icon', level_icon,
    'next_level_points', next_level_points,
    'progress_percent', LEAST(progress_percent, 100)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
