-- Seed paises desde seed-paises.json
-- Ejecutar: psql $DATABASE_URL -f supabase/seed-paises.sql
-- O pegar en Supabase SQL Editor

-- 1. Insertar países
INSERT INTO paises (codigo, nombre, capital, continente, nivel_riesgo, ultimo_informe, bandera, visible, data)
SELECT 
  (value->>'codigo')::TEXT,
  (value->>'nombre')::TEXT,
  (value->>'capital')::TEXT,
  (value->>'continente')::TEXT,
  (value->>'nivel_riesgo')::TEXT,
  (value->>'ultimo_informe')::TEXT,
  (value->>'bandera')::TEXT,
  (value->>'visible')::BOOLEAN,
  (value->>'data')::JSONB
FROM json_array_elements((SELECT convert_from(pg_read_binary_file('supabase/seed-paises.json'), 'UTF8')::JSON -> 'paises'))
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  capital = EXCLUDED.capital,
  continente = EXCLUDED.continente,
  nivel_riesgo = EXCLUDED.nivel_riesgo,
  ultimo_informe = EXCLUDED.ultimo_informe,
  bandera = EXCLUDED.bandera,
  visible = EXCLUDED.visible,
  data = EXCLUDED.data,
  updated_at = NOW();

-- 2. Insertar emergencias
INSERT INTO emergencias (codigo, general, policia, bomberos, ambulancia)
SELECT 
  (value->>'codigo')::TEXT,
  (value->>'general')::TEXT,
  (value->>'policia')::TEXT,
  (value->>'bomberos')::TEXT,
  (value->>'ambulancia')::TEXT
FROM json_array_elements((SELECT convert_from(pg_read_binary_file('supabase/seed-paises.json'), 'UTF8')::JSON -> 'emergencias'))
ON CONFLICT (codigo) DO UPDATE SET
  general = EXCLUDED.general,
  policia = EXCLUDED.policia,
  bomberos = EXCLUDED.bomberos,
  ambulancia = EXCLUDED.ambulancia,
  updated_at = NOW();
