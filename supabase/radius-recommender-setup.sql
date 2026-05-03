-- RADIO INTELIGENTE: PostGIS + places table
-- Migration: radius-recommender-setup.sql

-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'city', 'town', 'poi', 'natural', 'beach', 'museum', 'heritage'
  country_code TEXT NOT NULL,
  country_name TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  description TEXT,
  risk_level TEXT, -- 'bajo', 'medio', 'alto', 'muy-alto', 'sin-riesgo'
  poi_count INTEGER DEFAULT 0,
  population TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create geographic index for fast radius queries
CREATE INDEX IF NOT EXISTS places_geom_idx ON places USING GIST (
  ST_SetSRID(ST_MakePoint(lon, lat), 4326)
);

-- 4. Create index for country_code filtering
CREATE INDEX IF NOT EXISTS places_country_idx ON places (country_code);

-- 5. Create index for type filtering
CREATE INDEX IF NOT EXISTS places_type_idx ON places (type);

-- 6. RLS Policies
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read places
CREATE POLICY "places_public_read" ON places
  FOR SELECT USING (true);

-- Only authenticated users with admin role can insert/update/delete
CREATE POLICY "places_admin_write" ON places
  FOR ALL USING (
    auth.role() = 'service_role'
  );
