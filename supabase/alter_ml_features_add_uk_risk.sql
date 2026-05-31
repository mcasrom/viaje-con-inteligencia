-- Add UK FCDO risk score to ml_features table
-- Supports triple-source government risk validation (MAEC + US + UK)
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS uk_risk_score INT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ml_features_uk_risk ON ml_features(uk_risk_score);

COMMENT ON COLUMN ml_features.uk_risk_score IS 'UK FCDO risk level (1-4) from external_risk table';
