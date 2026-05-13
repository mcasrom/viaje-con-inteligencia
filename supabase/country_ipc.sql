CREATE TABLE IF NOT EXISTS country_ipc (
  country_code TEXT PRIMARY KEY,
  country_name TEXT NOT NULL,
  ipc_value TEXT NOT NULL,
  nivel TEXT NOT NULL,
  region TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
