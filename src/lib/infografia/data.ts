import { paisesData as paisesFallback } from '@/data/paises';
import { getPaisesData } from '@/lib/paises-db';
import { getGPI, getGTI, getHDI, getIPC } from '@/lib/indices';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface RiskCountry {
  code: string;
  name: string;
  flag: string;
  region: string;
  riskLevel: string;
  riskScore: number;
}

export interface RiskDistribution {
  sinRiesgo: number;
  bajo: number;
  medio: number;
  alto: number;
  muyAlto: number;
}

export interface GWIComponents {
  riskScore: number;
  gpiScore: number;
  gtiScore: number;
  hdiScore: number;
  ipcScore: number;
  incidentScore: number;
  total: number;
}

export interface InfografiaData {
  weekStart: string;
  weekEnd: string;
  edition: number;
  title: string;
  subtitle: string;
  stats: {
    totalPaises: number;
    totalContinentes: number;
    sinRiesgo: number;
    riesgoBajo: number;
    riesgoMedio: number;
    riesgoAlto: number;
    riesgoMuyAlto: number;
    seguroOBajo: number;
    altoOMuyAlto: number;
  };
  riskDistribution: RiskDistribution;
  topRiskCountries: RiskCountry[];
  topSafeCountries: RiskCountry[];
  gwi: GWIComponents;
  gwiTrend: number | null;
  incidentsThisWeek: number;
  countriesChanged: { code: string; from: string; to: string }[];
  timestamp: string;
}

function riskLevelToScore(level: string): number {
  const map: Record<string, number> = {
    'sin-riesgo': 1,
    'bajo': 2,
    'medio': 3,
    'alto': 4,
    'muy-alto': 5,
  };
  return map[level] || 3;
}

export async function collectInfografiaData(edition?: number): Promise<InfografiaData> {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = sunday.toISOString().split('T')[0];

  const dbData = await getPaisesData();
  const paisesData = dbData && Object.keys(dbData).length > 0 ? dbData : paisesFallback;

  const paises = Object.entries(paisesData).filter(([code]) => code !== 'cu');
  const totalPaises = paises.length;
  const totalContinentes = [...new Set(paises.map(([, p]) => p.continente))].length;
  const sinRiesgo = paises.filter(([, p]) => p.nivelRiesgo === 'sin-riesgo').length;
  const riesgoBajo = paises.filter(([, p]) => p.nivelRiesgo === 'bajo').length;
  const riesgoMedio = paises.filter(([, p]) => p.nivelRiesgo === 'medio').length;
  const riesgoAlto = paises.filter(([, p]) => p.nivelRiesgo === 'alto').length;
  const riesgoMuyAlto = paises.filter(([, p]) => p.nivelRiesgo === 'muy-alto').length;

  const riskDistribution: RiskDistribution = {
    sinRiesgo,
    bajo: riesgoBajo,
    medio: riesgoMedio,
    alto: riesgoAlto,
    muyAlto: riesgoMuyAlto,
  };

  const countries: RiskCountry[] = paises.map(([code, p]) => ({
    code: code.toUpperCase(),
    name: p.nombre,
    flag: p.bandera,
    region: p.continente,
    riskLevel: p.nivelRiesgo,
    riskScore: riskLevelToScore(p.nivelRiesgo),
  }));

  const topRiskCountries = [...countries]
    .sort((a, b) => b.riskScore - a.riskScore || a.name.localeCompare(b.name))
    .slice(0, 10);

  const topSafeCountries = [...countries]
    .sort((a, b) => a.riskScore - b.riskScore || a.name.localeCompare(b.name))
    .slice(0, 10);

  // Global Weekly Index
  let gpiData: { score: number }[] = [];
  let gtiData: { score: number }[] = [];
  let hdiData: { score: number }[] = [];
  let ipcData: string[] = [];

  try {
    gpiData = (await getGPI()) as any;
    gtiData = (await getGTI()) as any;
    hdiData = (await getHDI()) as any;
    ipcData = (await getIPC()) as any;
  } catch {}

  const avgGPI = gpiData.length > 0 ? gpiData.reduce((s, r) => s + r.score, 0) / gpiData.length : 0;
  const avgGTI = gtiData.length > 0 ? gtiData.reduce((s, r) => s + r.score, 0) / gtiData.length : 0;
  const avgHDI = hdiData.length > 0 ? hdiData.reduce((s, r) => s + r.score, 0) / hdiData.length : 0;

  const altoOMuyAlto = riesgoAlto + riesgoMuyAlto;
  const riskScoreNorm = (altoOMuyAlto / Math.max(totalPaises, 1)) * 100;
  const gpiNorm = Math.min(100, (avgGPI / 5) * 100);
  const gtiNorm = Math.min(100, (avgGTI / 5) * 100);
  const hdiNorm = 100 - Math.min(100, (avgHDI / 1) * 100);
  const ipcNorm = 50;

  // Recent incidents
  let incidentsThisWeek = 0;
  try {
    const { count } = await supabaseAdmin
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd);
    incidentsThisWeek = count || 0;
  } catch {}

  // Risk changes this week
  const countriesChanged: { code: string; from: string; to: string }[] = [];
  try {
    const { data: riskHistory } = await supabaseAdmin
      .from('maec_risk_history')
      .select('country_code, nivel_riesgo')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: false });
    const seen = new Set<string>();
    for (const row of riskHistory || []) {
      if (!seen.has(row.country_code)) seen.add(row.country_code);
    }
    const { data: prevHistory } = await supabaseAdmin
      .from('maec_risk_history')
      .select('country_code, nivel_riesgo')
      .lt('date', weekStart)
      .order('date', { ascending: false });
    const prevMap = new Map<string, string>();
    for (const row of prevHistory || []) {
      if (!prevMap.has(row.country_code)) prevMap.set(row.country_code, row.nivel_riesgo);
    }
    for (const [code, pais] of Object.entries(paisesData)) {
      const prev = prevMap.get(code);
      if (prev && prev !== pais.nivelRiesgo) {
        countriesChanged.push({ code: code.toUpperCase(), from: prev, to: pais.nivelRiesgo });
      }
    }
  } catch {}

  const gwi: GWIComponents = {
    riskScore: Math.round(riskScoreNorm * 10) / 10,
    gpiScore: Math.round(gpiNorm * 10) / 10,
    gtiScore: Math.round(gtiNorm * 10) / 10,
    hdiScore: Math.round(hdiNorm * 10) / 10,
    ipcScore: ipcNorm,
    incidentScore: Math.min(100, incidentsThisWeek * 5),
    total: 0,
  };
  gwi.total = Math.round(
    (gwi.riskScore * 0.3 + gwi.gpiScore * 0.2 + gwi.gtiScore * 0.15 + gwi.hdiScore * 0.1 + gwi.ipcScore * 0.1 + gwi.incidentScore * 0.15) * 10
  ) / 10;

  let gwiTrend: number | null = null;
  try {
    const { data: prevInfografia } = await supabaseAdmin
      .from('infografias')
      .select('gwi_score')
      .eq('is_published', true)
      .order('week_start', { ascending: false })
      .limit(1);
    if (prevInfografia && prevInfografia.length > 0 && prevInfografia[0].gwi_score !== null) {
      gwiTrend = Math.round((gwi.total - Number(prevInfografia[0].gwi_score)) * 100) / 100;
    }
  } catch {}

  const baseEdition = edition || 0;
  const actualEdition = baseEdition > 0
    ? baseEdition
    : Math.floor((now.getTime() - new Date('2026-01-05').getTime()) / (7 * 86400000)) + 1;

  return {
    weekStart,
    weekEnd,
    edition: actualEdition,
    title: `Informe Semanal de Riesgos Globales #${actualEdition}`,
    subtitle: `${weekStart} — ${weekEnd}`,
    stats: {
      totalPaises,
      totalContinentes,
      sinRiesgo,
      riesgoBajo,
      riesgoMedio,
      riesgoAlto,
      riesgoMuyAlto,
      seguroOBajo: sinRiesgo + riesgoBajo,
      altoOMuyAlto,
    },
    riskDistribution,
    topRiskCountries,
    topSafeCountries,
    gwi,
    gwiTrend,
    incidentsThisWeek,
    countriesChanged,
    timestamp: now.toISOString(),
  };
}
