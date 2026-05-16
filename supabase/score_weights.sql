-- Score weights: configurable dimension weights per traveler profile

CREATE TABLE IF NOT EXISTS score_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile TEXT NOT NULL UNIQUE CHECK (profile IN ('mochilero', 'familiar', 'lujo', 'aventura', 'negocios', 'default')),
  riesgo REAL NOT NULL DEFAULT 0.30 CHECK (riesgo >= 0 AND riesgo <= 1),
  season REAL NOT NULL DEFAULT 0.20 CHECK (season >= 0 AND season <= 1),
  coste REAL NOT NULL DEFAULT 0.25 CHECK (coste >= 0 AND coste <= 1),
  perfil REAL NOT NULL DEFAULT 0.25 CHECK (perfil >= 0 AND perfil <= 1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults
INSERT INTO score_weights (profile, riesgo, season, coste, perfil) VALUES
  ('mochilero', 0.20, 0.15, 0.40, 0.25),
  ('familiar',  0.40, 0.20, 0.25, 0.15),
  ('lujo',      0.20, 0.20, 0.20, 0.40),
  ('aventura',  0.25, 0.15, 0.30, 0.30),
  ('negocios',  0.30, 0.20, 0.35, 0.15),
  ('default',   0.30, 0.20, 0.25, 0.25)
ON CONFLICT (profile) DO UPDATE SET
  riesgo = EXCLUDED.riesgo,
  season = EXCLUDED.season,
  coste = EXCLUDED.coste,
  perfil = EXCLUDED.perfil,
  updated_at = NOW();
