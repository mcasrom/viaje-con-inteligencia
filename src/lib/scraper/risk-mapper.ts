import { supabaseAdmin } from '@/lib/supabase-admin';

export function mapUSLevelToMAEC(level: number): string {
  if (level <= 1) return 'sin-riesgo';
  if (level === 2) return 'bajo';
  if (level === 3) return 'medio';
  return 'alto';
}

export async function getCurrentLiveRiskLevels(): Promise<Record<string, string>> {
  try {
    const { data } = await supabaseAdmin
      .from('external_risk')
      .select('country_code, risk_level')
      .eq('source', 'us_state_dept');

    const levels: Record<string, string> = {};
    for (const row of data || []) {
      levels[row.country_code.toLowerCase()] = mapUSLevelToMAEC(row.risk_level);
    }
    return levels;
  } catch {
    return {};
  }
}
