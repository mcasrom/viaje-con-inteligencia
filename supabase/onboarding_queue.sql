CREATE TABLE IF NOT EXISTS onboarding_queue (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  email_1_sent boolean DEFAULT false,
  email_1_sent_at timestamptz,
  email_2_sent boolean DEFAULT false,
  email_2_sent_at timestamptz,
  email_3_sent boolean DEFAULT false,
  email_3_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_onboarding_queue_email_1 ON onboarding_queue (email_1_sent) WHERE NOT email_1_sent;
CREATE INDEX idx_onboarding_queue_email_2 ON onboarding_queue (email_1_sent, email_2_sent) WHERE email_1_sent AND NOT email_2_sent;
CREATE INDEX idx_onboarding_queue_email_3 ON onboarding_queue (email_2_sent, email_3_sent) WHERE email_2_sent AND NOT email_3_sent;

ALTER TABLE onboarding_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden ver todo" ON onboarding_queue
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');
