CREATE TABLE IF NOT EXISTS colaboraciones (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  redes text,
  message text NOT NULL,
  rol text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE colaboraciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden ver todo" ON colaboraciones
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mcasrom@gmail.com');
