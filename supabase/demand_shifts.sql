-- Demand shift beneficiaries for TCI analysis
-- Seed data from src/data/tci-engine.ts getDemandShiftAnalysis()

CREATE TABLE IF NOT EXISTS demand_shifts (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  extra_demand_pct NUMERIC(4,1) NOT NULL,
  reason TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO demand_shifts (country_code, extra_demand_pct, reason) VALUES
  ('tr', 15, 'Desvio masivo de rutas a Oriente Medio por conflictos Siria, Iran e Israel'),
  ('jo', 12, 'Hub alternativo para viajeros a Libano, Iraq y Palestina'),
  ('eg', 10, 'Refugio turistico de Oriente Medio'),
  ('ae', 8, 'Hub aereo alternativo al espacio aereo irani cerrado'),
  ('om', 6, 'Ruta alternativa al Golfo Persico desviada de Iran'),
  ('es', 8, 'Turismo redirigido desde destinos de riesgo medio'),
  ('pt', 8, 'Turismo redirigido desde destinos de riesgo medio'),
  ('gr', 8, 'Turismo redirigido desde destinos de riesgo medio'),
  ('hr', 8, 'Turismo redirigido desde destinos de riesgo medio'),
  ('mx', 6, 'Alternativa segura a Caribe inestable'),
  ('cr', 6, 'Alternativa segura a Caribe inestable'),
  ('jp', 5, 'Destino asiatico seguro sin conflicto aereo'),
  ('kr', 5, 'Destino asiatico seguro sin conflicto aereo'),
  ('sg', 5, 'Destino asiatico seguro sin conflicto aereo')
ON CONFLICT (country_code) DO UPDATE SET
  extra_demand_pct = EXCLUDED.extra_demand_pct,
  reason = EXCLUDED.reason;
