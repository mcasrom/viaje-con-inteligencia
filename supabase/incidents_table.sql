CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id text UNIQUE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  country_code text,
  location text,
  severity text NOT NULL DEFAULT 'low',
  recommendation text,
  action_verb text,
  source text DEFAULT 'osint',
  signal_count integer DEFAULT 1,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_active ON incidents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_incidents_country ON incidents(country_code);
CREATE INDEX IF NOT EXISTS idx_incidents_expires ON incidents(expires_at) WHERE is_active = true;
