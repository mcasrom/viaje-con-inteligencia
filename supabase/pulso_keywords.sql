CREATE TABLE IF NOT EXISTS pulso_keywords (
  id SERIAL PRIMARY KEY,
  keyword_es TEXT NOT NULL,
  keyword_en TEXT DEFAULT '',
  icon TEXT DEFAULT '⚠️',
  category TEXT NOT NULL DEFAULT 'general',
  used_in_detection BOOLEAN DEFAULT true,
  used_in_display BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pulso_keywords_active ON pulso_keywords(active);
CREATE INDEX IF NOT EXISTS idx_pulso_keywords_detection ON pulso_keywords(used_in_detection) WHERE active AND used_in_detection;

INSERT INTO pulso_keywords (keyword_es, keyword_en, icon, category, used_in_detection, used_in_display) VALUES
('huelga', 'strike', '⚡', 'Transporte', true, true),
('protesta', 'protest', '✊', 'Social', true, true),
('inundación', 'flood', '🌊', 'Clima', true, true),
('terremoto', 'earthquake', '🌍', 'Desastre', true, true),
('incendio', 'fire', '🔥', 'Clima', true, true),
('huracán', 'hurricane', '🌀', 'Clima', true, true),
('brote', 'outbreak', '🦠', 'Salud', true, true),
('cancelado', 'cancelled', '✈️', 'Transporte', true, true),
('atentado', 'attack', '💥', 'Seguridad', true, true),
('cierre', 'closure', '🚧', 'Logística', true, true),
('estafa', 'scam', '⚠️', 'Seguridad', true, true),
('evacuación', '', '🏃', 'Emergencia', true, true),
('golpe', 'coup', '💢', 'Geopolítico', true, false),
('crisis', 'crisis', '📉', 'General', true, false),
('aeropuerto', 'airport', '✈️', 'Transporte', true, false),
('hospital', 'hospital', '🏥', 'Salud', true, false),
('saturado', 'overloaded', '📊', 'Logística', true, false),
('colapsado', 'collapsed', '💥', 'General', true, false),
('emergencia', 'emergency', '🚨', 'Emergencia', true, false),
('conflicto', 'conflict', '⚔️', 'Geopolítico', true, false),
('manifestación', 'demonstration', '✊', 'Social', true, false),
('paro', 'shutdown', '⏸️', 'Transporte', true, false),
('bloqueo', 'blockade', '🚧', 'Logística', true, false),
('disturbio', 'riot', '💢', 'Social', true, false)
ON CONFLICT DO NOTHING;
