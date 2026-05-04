-- Sprint 48: TCI Inteligente con ML + Histórico + Conflicto Aéreo

-- 1. Histórico diario de TCI por país
CREATE TABLE IF NOT EXISTS tci_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code TEXT NOT NULL,
  tci_value NUMERIC(6,2),
  tci_trend TEXT,
  demand_idx NUMERIC(6,2),
  oil_idx NUMERIC(6,2),
  seasonality_idx NUMERIC(6,2),
  ipc_idx NUMERIC(6,2),
  risk_idx NUMERIC(6,2),
  oil_price_usd NUMERIC(8,2),
  conflict_surcharge NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, country_code)
);

CREATE INDEX IF NOT EXISTS idx_tci_history_country_date ON tci_history(country_code, date DESC);
CREATE INDEX IF NOT EXISTS idx_tci_history_date ON tci_history(date DESC);

-- 2. Tabla de espacio aéreo cerrado por conflictos
CREATE TABLE IF NOT EXISTS airspace_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  closure_date DATE NOT NULL,
  reason TEXT,
  severity TEXT DEFAULT 'high', -- 'low', 'medium', 'high', 'critical'
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rutas afectadas por cierre de espacio aéreo
CREATE TABLE IF NOT EXISTS affected_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  closed_airspace TEXT NOT NULL, -- country code del espacio cerrado
  detour_km NUMERIC(8,1),
  fuel_surcharge_pct NUMERIC(5,2),
  time_extra_hours NUMERIC(4,1),
  alternative_route TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affected_routes_dest ON affected_routes(destination_country);
CREATE INDEX IF NOT EXISTS idx_affected_routes_airspace ON affected_routes(closed_airspace);

-- 4. RLS policies
ALTER TABLE tci_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE airspace_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE affected_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TCI history public read" ON tci_history FOR SELECT USING (true);
CREATE POLICY "Airspace closures public read" ON airspace_closures FOR SELECT USING (true);
CREATE POLICY "Affected routes public read" ON affected_routes FOR SELECT USING (true);

-- 5. Seed: espacios aéreos cerrados por conflictos (2024-2026)
INSERT INTO airspace_closures (country_code, country_name, closure_date, reason, severity, is_active, notes) VALUES
  ('RU', 'Rusia', '2022-02-24', 'Conflicto Ucrania-Rusia, sanciones internacionales', 'critical', true, 'Espacio aéreo cerrado para la mayoría de aerolíneas occidentales'),
  ('UA', 'Ucrania', '2022-02-24', 'Invasión rusa', 'critical', true, 'Espacio aéreo completamente cerrado'),
  ('BY', 'Bielorrusia', '2022-02-28', 'Sanciones por apoyo a Rusia', 'high', true, 'Restricciones para aerolíneas UE/EEUU'),
  ('SY', 'Siria', '2012-03-01', 'Guerra civil', 'critical', true, 'Zona de exclusión aérea prácticamente total'),
  ('LY', 'Libia', '2014-07-01', 'Guerra civil, milicias', 'high', true, 'Restricciones severas, vuelos limitados'),
  ('YE', 'Yemen', '2015-03-01', 'Guerra civil, conflicto Huthis', 'critical', true, 'Espacio aéreo cerrado'),
  ('AF', 'Afganistán', '2021-08-15', 'Talibán, caída de Kabul', 'high', true, 'Vuelos muy limitados'),
  ('IQ', 'Irak', '2003-03-01', 'Inestabilidad, zonas de conflicto', 'medium', true, 'Restricciones parciales, corredores limitados'),
  ('SO', 'Somalia', '2007-01-01', 'Inestabilidad, terrorismo', 'medium', true, 'FAA prohíbe sobrevuelo'),
  ('SS', 'Sudán del Sur', '2013-12-01', 'Guerra civil', 'medium', true, 'Restricciones severas'),
  ('KP', 'Corea del Norte', '2020-01-01', 'Sanciones internacionales, COVID', 'high', true, 'Sin vuelos comerciales'),
  ('ER', 'Eritrea', '2020-11-01', 'Conflicto Tigray', 'medium', false, 'Restricciones parciales'),
  ('ET', 'Etiopía', '2020-11-01', 'Conflicto Tigray (parcialmente resuelto)', 'medium', false, 'Mejorando, pero con precaución'),
  ('SD', 'Sudán', '2023-04-15', 'Conflicto SAF-RSF', 'critical', true, 'Espacio aéreo cerrado desde abril 2023'),
  ('IR', 'Irán', '2020-01-01', 'Tensiones geopolíticas, derribo PS752', 'medium', true, 'Algunas aerolíneas evitan espacio aéreo'),
  ('PS', 'Palestina/Gaza', '2023-10-07', 'Conflicto Israel-Hamás', 'critical', true, 'Restricciones totales en Gaza, parciales en Cisjordania')
ON CONFLICT (country_code) DO NOTHING;

-- 6. Seed: rutas afectadas desde MAD
INSERT INTO affected_routes (origin_iata, destination_iata, destination_country, closed_airspace, detour_km, fuel_surcharge_pct, time_extra_hours, alternative_route, is_active) VALUES
  ('MAD', 'NRT', 'JP', 'RU', 4200, 18.5, 3.5, 'MAD-ANC-NRT (ruta polar alternativa)', true),
  ('MAD', 'ICN', 'KR', 'RU', 3800, 16.0, 3.0, 'MAD-DEL-ICN (ruta sur)', true),
  ('MAD', 'PEK', 'CN', 'RU', 3500, 15.0, 2.5, 'MAD-DOH-PEK (ruta Golfo)', true),
  ('MAD', 'PVG', 'CN', 'RU', 3600, 15.5, 2.5, 'MAD-IST-PVG (ruta Turkish)', true),
  ('MAD', 'DEL', 'IN', 'RU', 800, 3.5, 0.5, 'Desvío menor sur de Rusia', true),
  ('MAD', 'BOM', 'IN', 'RU', 600, 2.5, 0.5, 'Desvío menor sur de Rusia', true),
  ('MAD', 'DXB', 'AE', 'IR', 400, 2.0, 0.3, 'Desvío sur de Irán', true),
  ('MAD', 'DOH', 'QA', 'IR', 300, 1.5, 0.3, 'Desvío sur de Irán', true),
  ('MAD', 'TLV', 'IL', 'PS', 150, 1.0, 0.2, 'Aproximación alternativa', true),
  ('MAD', 'CAI', 'EG', 'LY', 500, 2.5, 0.5, 'Ruta este de Libia', true),
  ('MAD', 'ADD', 'ET', 'SD', 800, 4.0, 0.5, 'Ruta este de Sudán', true),
  ('MAD', 'KBP', 'UA', 'UA', 0, 0, 0, 'Sin vuelos directos - destino afectado', false)
ON CONFLICT DO NOTHING;

-- 7. Seed inicial de histórico TCI (datos simulados para las últimas 12 semanas)
-- Esto se poblará automáticamente con el cron, pero insertamos datos base
-- para que el gráfico tenga datos desde el primer día
