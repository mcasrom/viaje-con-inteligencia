import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS risk_predictions (
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

CREATE INDEX IF NOT EXISTS idx_risk_predictions_country ON risk_predictions(country_code);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_date ON risk_predictions(predicted_at);

CREATE TABLE IF NOT EXISTS maec_risk_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_code TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, date)
);
`;

export async function GET() {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: MIGRATION_SQL });
    if (error) {
      // Fallback: try direct SQL via raw query
      const tables = ['risk_predictions', 'maec_risk_history'];
      const results: Record<string, any> = {};
      for (const table of tables) {
        const { data, error: e } = await supabaseAdmin
          .from(table)
          .select('id')
          .limit(1);
        results[table] = e ? `not_found: ${e.message}` : 'exists';
      }
      return NextResponse.json({ status: 'check', results, migrationError: error.message });
    }
    return NextResponse.json({ status: 'ok', message: 'Migration applied' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message });
  }
}
