CREATE TABLE IF NOT EXISTS user_insurance_policies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  medical_coverage NUMERIC DEFAULT 0,
  evacuation_coverage NUMERIC DEFAULT 0,
  cancelation_percent NUMERIC DEFAULT 0,
  covers_repatriation BOOLEAN DEFAULT FALSE,
  covers_covid BOOLEAN DEFAULT FALSE,
  covers_sports BOOLEAN DEFAULT FALSE,
  covers_adventure_sports BOOLEAN DEFAULT FALSE,
  covers_electronics BOOLEAN DEFAULT FALSE,
  max_equipaje NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_user ON user_insurance_policies(user_id);

CREATE TABLE IF NOT EXISTS insurance_alerts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id BIGINT REFERENCES user_insurance_policies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  country_code TEXT,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_alerts_user ON insurance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_alerts_unread ON insurance_alerts(user_id, read);
