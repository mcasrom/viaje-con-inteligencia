const { Client } = require('pg');

const PROJECT_REF = 'nczkvsnuafkwtmgokiuo';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jemt2c251YWZrd3RtZ29raXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQyNjA3NCwiZXhwIjoyMDkyMDAyMDc0fQ.EY0WAz3bDzq9qIOc5shZRgbIwETb8CyJcTveCIvXn3o';

const SQL = `
CREATE TABLE IF NOT EXISTS public.risk_predictions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL,
  current_risk TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  probability_up_7d NUMERIC(4,3) DEFAULT 0,
  probability_up_14d NUMERIC(4,3) DEFAULT 0,
  probability_up_30d NUMERIC(4,3) DEFAULT 0,
  signal_count_7d INTEGER DEFAULT 0,
  incident_count_7d INTEGER DEFAULT 0,
  top_factors TEXT[] DEFAULT '{}',
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, predicted_at)
);

CREATE INDEX IF NOT EXISTS idx_risk_predictions_country ON public.risk_predictions(country_code);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_date ON public.risk_predictions(predicted_at);

CREATE TABLE IF NOT EXISTS public.maec_risk_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, date)
);
`;

async function run() {
  console.log('Connecting to Supabase via pooler...');
  const client = new Client({
    connectionString: `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('Connected successfully, running migration...');
    await client.query(SQL);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Error type:', err.constructor?.name);
    console.error('Error message:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (err.errno) console.error('Errno:', err.errno);
    if (err.syscall) console.error('Syscall:', err.syscall);
    if (err.address) console.error('Address:', err.address);
    if (err.port) console.error('Port:', err.port);
    process.exit(1);
  } finally {
    try { await client.end(); } catch {}
  }
}

run();
