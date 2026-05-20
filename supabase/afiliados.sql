CREATE TABLE IF NOT EXISTS afiliados (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  web text,
  audiencia text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden ver todo" ON afiliados
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');
