-- Airspace closures + affected routes for TCI real-time
-- Seed data from src/data/tci-engine.ts fallback

CREATE TABLE IF NOT EXISTS airspace_closures (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  closure_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_airspace_closures_active ON airspace_closures(is_active);

CREATE TABLE IF NOT EXISTS affected_routes (
  id SERIAL PRIMARY KEY,
  destination TEXT NOT NULL,
  country_code TEXT NOT NULL,
  closed_airspace TEXT NOT NULL REFERENCES airspace_closures(code),
  detour_km INTEGER NOT NULL,
  fuel_surcharge_pct NUMERIC(5,1) NOT NULL,
  time_extra_hours NUMERIC(4,1) NOT NULL,
  alternative_route TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affected_routes_active ON affected_routes(is_active);

-- Seed data for airspace_closures
INSERT INTO airspace_closures (code, name, closure_date, reason, severity, is_active, notes) VALUES
  ('RU', 'Rusia', '2022-02-24', 'Conflicto Ucrania-Rusia, sanciones', 'critical', true, 'Cerrado para aerolineas occidentales'),
  ('UA', 'Ucrania', '2022-02-24', 'Invasion rusa', 'critical', true, 'Completamente cerrado'),
  ('SY', 'Siria', '2012-03-01', 'Guerra civil', 'critical', true, 'Zona de exclusion'),
  ('LY', 'Libia', '2014-07-01', 'Guerra civil', 'high', true, 'Restricciones severas'),
  ('YE', 'Yemen', '2015-03-01', 'Guerra civil', 'critical', true, 'Cerrado'),
  ('AF', 'Afganistan', '2021-08-15', 'Taliban', 'high', true, 'Vuelos muy limitados'),
  ('IQ', 'Irak', '2024-04-01', 'Escalada de tensiones Iran-Israel y milicias', 'high', true, 'Sobrevuelo muy restringido — corredores limitados'),
  ('SO', 'Somalia', '2007-01-01', 'Terrorismo', 'medium', true, 'FAA prohibe sobrevuelo'),
  ('SD', 'Sudan', '2023-04-15', 'Conflicto SAF-RSF', 'critical', true, 'Cerrado desde abril 2023'),
  ('IR', 'Iran', '2025-06-01', 'Conflicto Israel-Iran, cierre de espacio aereo', 'critical', true, 'Cierre parcial — la mayoria de aerolineas evitan'),
  ('IL', 'Israel', '2023-10-07', 'Conflicto Gaza-Israel, ataques con misiles', 'critical', true, 'Apertura intermitente — cierres frecuentes'),
  ('LB', 'Libano', '2024-09-01', 'Escalada Hezbollah-Israel', 'critical', true, 'Aeropuerto Beirut operatividad muy reducida'),
  ('PS', 'Palestina / Gaza', '2023-10-07', 'Conflicto Israel-Gaza', 'critical', true, 'Cerrado totalmente')
ON CONFLICT DO NOTHING;

-- Seed data for affected_routes
INSERT INTO affected_routes (destination, country_code, closed_airspace, detour_km, fuel_surcharge_pct, time_extra_hours, alternative_route, is_active) VALUES
  -- Rutas afectadas por cierre de espacio aereo ruso
  ('Tokio', 'JP', 'RU', 4200, 18.5, 3.5, 'MAD→ANC→NRT', true),
  ('Seul', 'KR', 'RU', 3800, 16.0, 3.0, 'MAD→DEL→ICN', true),
  ('Pekin', 'CN', 'RU', 3500, 15.0, 2.5, 'MAD→DOH→PEK', true),
  ('Shanghai', 'CN', 'RU', 3600, 15.5, 2.5, 'MAD→IST→PVG', true),
  ('Delhi', 'IN', 'RU', 800, 3.5, 0.5, 'Desvio sur de Rusia', true),
  ('Mumbai', 'IN', 'RU', 600, 2.5, 0.5, 'Desvio sur de Rusia', true),
  -- Rutas afectadas por conflicto Iran-Israel 2025-2026
  ('Tel Aviv', 'IL', 'IL', 2200, 35.0, 4.0, 'Vuelos a Chipre + transporte terrestre', true),
  ('Teheran', 'IR', 'IR', 1800, 28.0, 3.0, 'Sin vuelos directos desde Europa', true),
  ('Beirut', 'LB', 'LB', 1500, 30.0, 3.5, 'Via Aman (Jordania) + transporte terrestre', true),
  ('Bagdad', 'IQ', 'IQ', 1200, 22.0, 2.0, 'Corredor norte limitado', true),
  ('Doha', 'QA', 'IR', 600, 5.0, 0.5, 'Desvio sur de Iran por Golfo Persico', true),
  -- Rutas afectadas por otros conflictos
  ('Dubai', 'AE', 'IR', 400, 3.0, 0.3, 'Desvio sur de Iran', true),
  ('El Cairo', 'EG', 'LY', 500, 2.5, 0.5, 'Ruta este de Libia', true),
  ('Adis Abeba', 'ET', 'SD', 800, 4.0, 0.5, 'Ruta este de Sudan', true),
  ('Sana', 'YE', 'YE', 1000, 25.0, 2.0, 'Sin vuelos — Djibouti + ferry', true),
  ('Kabul', 'AF', 'AF', 800, 20.0, 1.5, 'Via Islamabad (limitado)', true)
ON CONFLICT DO NOTHING;
