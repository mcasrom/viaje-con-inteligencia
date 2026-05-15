CREATE TABLE editor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  month DATE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  author TEXT DEFAULT 'Editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_editor_notes_month ON editor_notes(month DESC);

ALTER TABLE editor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on editor_notes"
  ON editor_notes
  USING (true)
  WITH CHECK (true);
