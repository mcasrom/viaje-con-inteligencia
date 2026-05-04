-- Sprint 45: Travel Cost Intelligence (TCI)
-- Índice de coste de viaje basado en datos macroeconómicos

-- 1. Histórico de precios de petróleo Brent (USD/barril)
CREATE TABLE IF NOT EXISTS oil_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  price_usd NUMERIC(10,2),
  source TEXT DEFAULT 'EIA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oil_date ON oil_price_history(date DESC);

-- 2. Rutas piloto para futuras consultas Amadeus (placeholder)
CREATE TABLE IF NOT EXISTS flight_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_iata TEXT NOT NULL DEFAULT 'MAD',
  destination_iata TEXT NOT NULL,
  country_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_routes_country ON flight_routes(country_code);

-- 3. Histórico de costes de vuelo (para cuando Amadeus esté activo)
CREATE TABLE IF NOT EXISTS flight_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES flight_routes(id),
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  country_code TEXT NOT NULL,
  price_eur NUMERIC(10,2),
  airline TEXT,
  stops INTEGER,
  searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fch_country_date ON flight_cost_history(country_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fch_route ON flight_cost_history(route_id, created_at DESC);

-- 4. Cache del índice TCI calculado
CREATE TABLE IF NOT EXISTS flight_tci_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  tci_value NUMERIC(6,2),
  tci_trend TEXT,
  demand_idx NUMERIC(6,2),
  oil_idx NUMERIC(6,2),
  seasonality_idx NUMERIC(6,2),
  ipc_idx NUMERIC(6,2),
  risk_idx NUMERIC(6,2),
  recommendation TEXT,
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tci_country ON flight_tci_cache(country_code);
CREATE INDEX IF NOT EXISTS idx_tci_calculated ON flight_tci_cache(last_calculated DESC);

-- 5. Insertar rutas piloto (MAD como origen principal)
INSERT INTO flight_routes (origin_iata, destination_iata, country_code) VALUES
  ('MAD', 'NRT', 'JP'),
  ('MAD', 'BKK', 'TH'),
  ('MAD', 'CMN', 'MA'),
  ('MAD', 'CDG', 'FR'),
  ('MAD', 'FCO', 'IT'),
  ('MAD', 'LIS', 'PT'),
  ('MAD', 'ATH', 'GR'),
  ('MAD', 'JFK', 'US'),
  ('MAD', 'GRU', 'BR'),
  ('MAD', 'EZE', 'AR'),
  ('MAD', 'CUN', 'MX'),
  ('MAD', 'BOG', 'CO'),
  ('MAD', 'CAI', 'EG'),
  ('MAD', 'DEL', 'IN'),
  ('MAD', 'PEK', 'CN'),
  ('MAD', 'ICN', 'KR'),
  ('MAD', 'SIN', 'SG'),
  ('MAD', 'SYD', 'AU'),
  ('MAD', 'LHR', 'GB'),
  ('MAD', 'FRA', 'DE')
ON CONFLICT DO NOTHING;
