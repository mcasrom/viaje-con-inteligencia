import { supabaseAdmin } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

const riskLevelNum: Record<string, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

export interface UserPolicy {
  id: number;
  user_id: string;
  policy_name: string;
  provider: string;
  medical_coverage: number;
  evacuation_coverage: number;
  cancelation_percent: number;
  covers_repatriation: boolean;
  covers_covid: boolean;
  covers_sports: boolean;
  covers_adventure_sports: boolean;
  covers_electronics: boolean;
  max_equipaje: number;
}

export interface InsuranceAlert {
  id?: number;
  user_id: string;
  policy_id: number;
  type: 'coverage_gap' | 'irv_change' | 'activity_warning';
  country_code: string | null;
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  read: boolean;
}

export async function getUserPolicies(userId: string): Promise<UserPolicy[]> {
  const { data } = await supabaseAdmin
    .from('user_insurance_policies')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function getUserAlerts(userId: string, onlyUnread = false): Promise<InsuranceAlert[]> {
  let query = supabaseAdmin
    .from('insurance_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (onlyUnread) {
    query = query.eq('read', false);
  }

  const { data } = await query;
  return data || [];
}

function getCoberturaRecomendada(irv: number): { medica: number; evacuacion: number } {
  if (irv > 65) return { medica: 1000000, evacuacion: 2000000 };
  if (irv > 50) return { medica: 500000, evacuacion: 1000000 };
  return { medica: 300000, evacuacion: 500000 };
}

export async function checkPolicyCoverage(
  userId: string,
  policy: UserPolicy,
  countryCode: string
): Promise<InsuranceAlert[]> {
  const pais = paisesData[countryCode.toLowerCase() as keyof typeof paisesData];
  if (!pais) return [];

  const nivel = riskLevelNum[pais.nivelRiesgo] || 2;
  const irv = Math.max(40, Math.min(100, 100 - nivel * 10));
  const rec = getCoberturaRecomendada(irv);
  const alerts: InsuranceAlert[] = [];

  if (policy.medical_coverage < rec.medica) {
    alerts.push({
      user_id: userId,
      policy_id: policy.id,
      type: 'coverage_gap',
      country_code: countryCode,
      severity: irv > 65 ? 'high' : 'medium',
      title: `Cobertura médica insuficiente para ${pais.nombre}`,
      message: `Tu póliza cubre ${(policy.medical_coverage / 1000000).toFixed(1)}M€. Para ${pais.nombre} (IRV ${irv}) se recomienda ≥${(rec.medica / 1000000).toFixed(1)}M€.`,
      read: false,
    });
  }

  if (policy.evacuation_coverage < rec.evacuacion) {
    alerts.push({
      user_id: userId,
      policy_id: policy.id,
      type: 'coverage_gap',
      country_code: countryCode,
      severity: irv > 65 ? 'high' : 'medium',
      title: `Evacuación insuficiente para ${pais.nombre}`,
      message: `Tu póliza cubre ${(policy.evacuation_coverage / 1000000).toFixed(1)}M€ en evacuación. Para ${pais.nombre} se recomienda ≥${(rec.evacuacion / 1000000).toFixed(1)}M€.`,
      read: false,
    });
  }

  return alerts;
}

export async function runMonitorForUser(userId: string): Promise<number> {
  const policies = await getUserPolicies(userId);
  if (policies.length === 0) return 0;

  const { data: favorites } = await supabaseAdmin
    .from('favorites')
    .select('country_code')
    .eq('user_id', userId);

  const countries = [...new Set((favorites || []).map(f => f.country_code))];
  if (countries.length === 0) return 0;

  let totalAlerts = 0;

  for (const policy of policies) {
    for (const country of countries) {
      const alerts = await checkPolicyCoverage(userId, policy, country);
      for (const alert of alerts) {
        const { error } = await supabaseAdmin
          .from('insurance_alerts')
          .insert({
            user_id: alert.user_id,
            policy_id: alert.policy_id,
            type: alert.type,
            country_code: alert.country_code,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            read: false,
          });
        if (!error) totalAlerts++;
      }
    }
  }

  return totalAlerts;
}

export async function markAlertRead(alertId: number): Promise<void> {
  await supabaseAdmin
    .from('insurance_alerts')
    .update({ read: true })
    .eq('id', alertId);
}

export async function savePolicy(userId: string, data: {
  policy_name: string;
  provider: string;
  medical_coverage: number;
  evacuation_coverage: number;
  cancelation_percent: number;
  covers_repatriation: boolean;
  covers_covid: boolean;
  covers_sports: boolean;
  covers_adventure_sports: boolean;
  covers_electronics: boolean;
  max_equipaje: number;
}): Promise<UserPolicy> {
  const { data: policy, error } = await supabaseAdmin
    .from('user_insurance_policies')
    .insert({ user_id: userId, ...data })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return policy;
}

export async function deletePolicy(policyId: number): Promise<void> {
  await supabaseAdmin
    .from('user_insurance_policies')
    .delete()
    .eq('id', policyId);
}
