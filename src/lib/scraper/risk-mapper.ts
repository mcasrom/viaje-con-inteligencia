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
      .select('country_code, risk_level, source')
      .in('source', ['us_state_dept', 'uk_fcdo']);

    const levels: Record<string, string> = {};
    const fcdcLevels: Record<string, string> = {};

    for (const row of data || []) {
      const level = mapUSLevelToMAEC(row.risk_level);
      if (row.source === 'uk_fcdo') {
        fcdcLevels[row.country_code.toLowerCase()] = level;
      } else {
        levels[row.country_code.toLowerCase()] = level;
      }
    }

    // Merge: US State Dept takes priority, FCDO fills gaps
    return { ...fcdcLevels, ...levels };
  } catch {
    return {};
  }
}
