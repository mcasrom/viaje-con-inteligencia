CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  traveler_type TEXT NOT NULL DEFAULT 'mochilero' CHECK (traveler_type IN ('mochilero','lujo','familiar','aventura','negocios')),
  risk_tolerance TEXT NOT NULL DEFAULT 'media' CHECK (risk_tolerance IN ('baja','media','alta')),
  budget_range TEXT NOT NULL DEFAULT 'medio' CHECK (budget_range IN ('bajo','medio','alto')),
  preferred_categories TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
