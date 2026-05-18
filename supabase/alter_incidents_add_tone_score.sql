ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tone_score float;

CREATE INDEX IF NOT EXISTS idx_incidents_tone ON incidents(tone_score) WHERE tone_score IS NOT NULL;

COMMENT ON COLUMN incidents.tone_score IS 'Average tone_score (-10 to +10) from clustered osint_signals. Null if no signal in the cluster had a tone_score. Updated every 48h by detectAndCreateIncidents().';
