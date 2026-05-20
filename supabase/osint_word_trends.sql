CREATE TABLE IF NOT EXISTS osint_word_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  country_code text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  frequency int NOT NULL DEFAULT 0,
  baseline_7d float,
  stddev_7d float,
  z_score float,
  anomaly boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (word, country_code, date)
);

CREATE INDEX idx_word_trends_date ON osint_word_trends (date DESC);
CREATE INDEX idx_word_trends_anomaly ON osint_word_trends (anomaly) WHERE anomaly = true;
CREATE INDEX idx_word_trends_lookup ON osint_word_trends (word, country_code, date);
