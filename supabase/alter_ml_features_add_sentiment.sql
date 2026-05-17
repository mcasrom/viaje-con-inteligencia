-- Sentiment analysis features for ML models
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS avg_tone_7d NUMERIC(6,3);
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS avg_tone_30d NUMERIC(6,3);
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS tone_trend_7d NUMERIC(6,3) DEFAULT 0;
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS negative_ratio_7d NUMERIC(5,3) DEFAULT 0;
ALTER TABLE ml_features ADD COLUMN IF NOT EXISTS tone_volatility_7d NUMERIC(6,3) DEFAULT 0;
