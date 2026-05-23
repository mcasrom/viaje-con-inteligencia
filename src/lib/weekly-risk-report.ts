import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { getPaisesData } from '@/lib/paises-db';

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': 'Bajo', 'bajo': 'Bajo', 'medio': 'Medio',
  'alto': 'Alto', 'muy-alto': 'Muy alto',
};

export interface RiskChange {
  country_code: string;
  country_name: string;
  bandera: string;
  old_risk: string;
  new_risk: string;
  old_label: string;
  new_label: string;
  direction: 'up' | 'down';
  severity: number;
  created_at: string;
  incidents: { title: string; type: string; severity: string }[];
}

export async function getWeeklyRiskChanges(): Promise<{
  weekRange: string;
  totalChanges: number;
  topChanges: RiskChange[];
}> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const paisesData = await getPaisesData();

  const { data: history } = await supabaseAdmin
    .from('maec_risk_history')
    .select('*')
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false });

  const changes: RiskChange[] = [];
  const seen = new Set<string>();
  const severityOrder = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];

  for (const row of history || []) {
    const key = `${row.country_code}-${row.new_risk}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const pais = (paisesData as any)[row.country_code?.toLowerCase()] || {};
    const oldIdx = severityOrder.indexOf(row.old_risk);
    const newIdx = severityOrder.indexOf(row.new_risk);
    const direction = newIdx > oldIdx ? 'up' as const : 'down' as const;

    changes.push({
      country_code: row.country_code,
      country_name: pais.nombre || row.country_code?.toUpperCase(),
      bandera: pais.bandera || '',
      old_risk: row.old_risk,
      new_risk: row.new_risk,
      old_label: riesgoLabels[row.old_risk] || row.old_risk,
      new_label: riesgoLabels[row.new_risk] || row.new_risk,
      direction,
      severity: Math.abs(newIdx - oldIdx),
      created_at: row.created_at,
      incidents: [],
    });
  }

  changes.sort((a, b) => b.severity - a.severity);

  let top10 = changes.slice(0, 10);

  // Fallback: if no changes, show countries with active incidents this week
  if (top10.length === 0) {
    const weekAgoIncidents = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeIncidents } = await supabaseAdmin
      .from('incidents')
      .select('country_code, title, type, severity')
      .gte('detected_at', weekAgoIncidents)
      .not('country_code', 'is', null)
      .order('severity', { ascending: false })
      .limit(50);

    const countriesWithIncidents = new Map<string, any[]>();
    for (const inc of activeIncidents || []) {
      const cc = inc.country_code?.toLowerCase();
      if (!cc) continue;
      if (!countriesWithIncidents.has(cc)) countriesWithIncidents.set(cc, []);
      if (countriesWithIncidents.get(cc)!.length < 3) {
        countriesWithIncidents.get(cc)!.push({ title: inc.title, type: inc.type, severity: inc.severity });
      }
    }

    const highRisk = Array.from(countriesWithIncidents.entries())
      .slice(0, 10)
      .map(([cc, incs]) => {
        const pais = (paisesData as any)[cc] || {};
        return {
          country_code: cc.toUpperCase(),
          country_name: pais.nombre || cc.toUpperCase(),
          bandera: pais.bandera || '',
          old_risk: pais.nivelRiesgo || 'medio',
          new_risk: pais.nivelRiesgo || 'medio',
          old_label: riesgoLabels[pais.nivelRiesgo] || 'Medio',
          new_label: riesgoLabels[pais.nivelRiesgo] || 'Medio',
          direction: 'up' as const,
          severity: incs.some(i => i.severity === 'critical') ? 2 : 1,
          created_at: new Date().toISOString(),
          incidents: incs,
        };
      });
    top10 = highRisk;
  }

  for (const change of top10) {
    const { data: incs } = await supabaseAdmin
      .from('incidents')
      .select('title, type, severity')
      .eq('country_code', change.country_code)
      .eq('is_active', true)
      .limit(3);
    change.incidents = incs || [];
  }

  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date();
  const weekRange = `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return { weekRange, totalChanges: changes.length, topChanges: top10 };
}
