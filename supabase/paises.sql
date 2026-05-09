-- Paises table: migración desde src/data/paises.ts
-- Almacena datos completos de país como JSONB + columnas indexadas para queries rápidas

CREATE TABLE IF NOT EXISTS paises (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  capital TEXT,
  continente TEXT,
  nivel_riesgo TEXT NOT NULL CHECK (nivel_riesgo IN ('sin-riesgo','bajo','medio','alto','muy-alto')),
  ultimo_informe TEXT,
  bandera TEXT,
  visible BOOLEAN DEFAULT TRUE,

  -- Datos completos en JSONB (incluye todos los campos complejos)
  data JSONB NOT NULL,

  -- Emergencias (extraídas para acceso rápido)
  emergencias JSONB,

  -- Cache TTL
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paises_continente ON paises(continente);
CREATE INDEX IF NOT EXISTS idx_paises_nivel_riesgo ON paises(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_paises_visible ON paises(visible);
CREATE INDEX IF NOT EXISTS idx_paises_updated ON paises(updated_at DESC);

ALTER TABLE paises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON paises FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON paises FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON paises FOR UPDATE USING (true);

-- Emergencias table (separada para queries rápidas)
CREATE TABLE IF NOT EXISTS emergencias (
  codigo TEXT PRIMARY KEY REFERENCES paises(codigo) ON DELETE CASCADE,
  general TEXT NOT NULL,
  policia TEXT NOT NULL,
  bomberos TEXT NOT NULL,
  ambulancia TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON emergencias FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON emergencias FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON emergencias FOR UPDATE USING (true);
