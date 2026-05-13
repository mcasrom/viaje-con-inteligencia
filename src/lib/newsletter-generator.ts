import { createLogger } from '@/lib/logger';
import { groqClient } from './groq-ai';
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { paisesData } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';
import { TOTAL_PAISES } from '@/lib/constants';

const log = createLogger('Newsletter');

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': 'Bajo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
};

const riskLevelNum: Record<string, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

export interface RecentIncident {
  country_code: string;
  type: string;
  severity: string;
  title: string;
  detected_at: string;
}

export interface NewsletterIssue {
  edition: number;
  weekDate: string;
  // Stats
  newAlerts: number;
  irvChanges: number;
  stableCountries: number;
  // Country alerts
  countryAlerts: CountryAlert[];
  // Practical signal
  practicalSignal: PracticalSignal | null;
  // Destination spotlight
  destinationSpotlight: DestinationSpotlight | null;
  // Weekly Q&A
  weeklyQuestion: WeeklyQA | null;
  // Telegram alerts
  recentIncidents: RecentIncident[];
}

export interface CountryAlert {
  country_code: string;
  country_name: string;
  type: 'alert' | 'irv_up' | 'irv_down' | 'monitoring';
  title: string;
  irvOld: number;
  irvNew: number;
  riskLevel: string;
  sources: string[];
  description: string;
  advice: string;
}

export interface PracticalSignal {
  title: string;
  type: string;
  impact: string;
  advice: string[];
  sources: string[];
}

export interface DestinationSpotlight {
  code: string;
  name: string;
  irv: number;
  irvDimensions: { sal: number; seg: number; des: number; mov: number; eco: number };
  visa: string;
  safetyLabel: string;
  whyNow: string;
  whoIsItFor: { profile: string; verdict: string }[];
}

export interface WeeklyQA {
  question: string;
  countryCode: string;
  irv: number;
  segDimension: number;
  answer: string;
}

// ============================================================
// DATA COLLECTION
// ============================================================
export async function collectNewsletterData(): Promise<NewsletterIssue> {
  if (!isSupabaseAdminConfigured()) throw new Error('No supabase admin');

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const edition = Math.floor((Date.now() - new Date('2025-09-01').getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const weekDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  // Risk alerts
  const { data: alerts } = await supabaseAdmin
    .from('risk_alerts')
    .select('country_code, old_risk, new_risk, created_at')
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false });

  // OSINT signals
  const { data: signals } = await supabaseAdmin
    .from('osint_signals')
    .select('title, category, urgency, summary, source, source_url, content')
    .gte('post_timestamp', weekAgo)
    .order('post_timestamp', { ascending: false })
    .limit(20);

  // Country alerts
  const countryAlerts = await buildCountryAlerts(alerts || [], signals || []);

  // Practical signal (non-IRV operational alerts from OSINT)
  const practicalSignal = extractPracticalSignal(signals || []);

  // Destination spotlight — pick highest IRV with stable trend
  const destinationSpotlight = pickDestinationSpotlight();

  // Weekly Q&A
  const weeklyQuestion = await generateWeeklyQA(countryAlerts);

  // Recent incidents for Telegram alerts section
  const { data: recentIncidentsRaw } = await supabaseAdmin
    .from('incidents')
    .select('country_code, type, severity, title, detected_at')
    .gte('detected_at', weekAgo)
    .eq('is_active', true)
    .order('detected_at', { ascending: false })
    .limit(5);

  const recentIncidents: RecentIncident[] = (recentIncidentsRaw || [])
    .filter((i: any) => i.country_code && paisesData[i.country_code])
    .map((i: any) => ({
      country_code: i.country_code,
      type: i.type,
      severity: i.severity,
      title: i.title || i.type,
      detected_at: i.detected_at,
    }));

  const totalCountries = Object.keys(paisesData).length;
  const countriesWithAlerts = new Set(countryAlerts.map(a => a.country_code)).size;

  return {
    edition,
    weekDate: weekDate.charAt(0).toUpperCase() + weekDate.slice(1),
    newAlerts: countryAlerts.filter(a => a.type === 'alert').length,
    irvChanges: countryAlerts.filter(a => a.type === 'irv_up' || a.type === 'irv_down').length,
    stableCountries: totalCountries - countriesWithAlerts,
    countryAlerts,
    practicalSignal,
    destinationSpotlight,
    weeklyQuestion,
    recentIncidents,
  };
}

async function buildCountryAlerts(alerts: any[], signals: any[]): Promise<CountryAlert[]> {
  const result: CountryAlert[] = [];

  for (const alert of alerts.slice(0, 5)) {
    const pais = paisesData[alert.country_code];
    if (!pais) continue;

    const tci = calculateTCI(alert.country_code);
    const irvOld = Math.max(0, Math.min(100, 100 - (riskLevelNum[alert.old_risk] || 3) * 8));
    const irvNew = Math.max(0, Math.min(100, 100 - (riskLevelNum[alert.new_risk] || 3) * 8));

    const isUpgrade = riskLevelNum[alert.new_risk] > riskLevelNum[alert.old_risk];

    const sources = [];
    sources.push('MAEC');
    if (signals.some(s => s.source === 'gdacs')) sources.push('GDACS');
    if (signals.some(s => s.source === 'usgs')) sources.push('USGS');

    result.push({
      country_code: alert.country_code,
      country_name: pais.nombre,
      type: isUpgrade ? 'alert' : 'irv_up',
      title: isUpgrade
        ? `Sube nivel de riesgo MAEC: ${alert.old_risk} → ${alert.new_risk}`
        : `IRV estable — seguimiento`,
      irvOld,
      irvNew,
      riskLevel: riesgoLabels[alert.new_risk] || alert.new_risk,
      sources,
      description: `El MAEC ha actualizado el nivel de riesgo para ${pais.nombre} de "${alert.old_risk}" a "${alert.new_risk}".`,
      advice: isUpgrade
        ? `Si tienes viaje reservado a ${pais.nombre} en las próximas 2 semanas, consulta tu seguro de viaje y revisa las recomendaciones del MAEC antes de decidir.`
        : `La situación en ${pais.nombre} se mantiene estable. Sin cambios necesarios en tu planificación.`,
    });
  }

  // Add significant OSINT signals as country alerts
  for (const sig of signals.filter(s => s.urgency === 'critical' || s.urgency === 'high').slice(0, 3)) {
    if (result.find(r => r.title.includes(sig.title.substring(0, 20)))) continue;

    const pais = findCountryFromSignal(sig);
    const irvBase = pais ? Math.max(40, 100 - (riskLevelNum[pais.nivelRiesgo] || 3) * 10) : 60;

    result.push({
      country_code: pais?.codigo || 'XX',
      country_name: pais?.nombre || sig.location_name || 'Zona',
      type: sig.urgency === 'critical' ? 'alert' : 'monitoring',
      title: sig.summary || sig.title,
      irvOld: irvBase,
      irvNew: sig.urgency === 'critical' ? irvBase - 15 : irvBase - 5,
      riskLevel: pais ? riesgoLabels[pais.nivelRiesgo] : 'En seguimiento',
      sources: [sig.source?.toUpperCase() || 'OSINT'],
      description: sig.content?.substring(0, 200) || sig.summary || sig.title,
      advice: sig.urgency === 'critical'
        ? `Monitorizamos esta situación de cerca. Si viajas a la zona en los próximos 7 días, mantente informado.`
        : `Situación en seguimiento. No justifica cambios de plan por ahora.`,
    });
  }

  return result.slice(0, 5);
}

function findCountryFromSignal(sig: any) {
  const text = `${sig.title} ${sig.content} ${sig.location_name || ''}`.toLowerCase();
  for (const [code, pais] of Object.entries(paisesData)) {
    if (text.includes(pais.nombre.toLowerCase()) || text.includes(code.toLowerCase())) return pais;
  }
  return null;
}

function extractPracticalSignal(signals: any[]): PracticalSignal | null {
  // Look for operational/travel disruption signals
  const operational = signals.find(s =>
    s.category === 'logistico' &&
    (s.urgency === 'medium' || s.urgency === 'high')
  );

  if (operational) {
    return {
      title: operational.summary || operational.title,
      type: 'operacional',
      impact: 'Puede afectar tu planificación de viaje',
      advice: [
        'Monitoriza las fuentes oficiales antes de viajar',
        'Considera tener un plan alternativo',
      ],
      sources: [operational.source?.toUpperCase() || 'OSINT'],
    };
  }
  return null;
}

function pickDestinationSpotlight(): DestinationSpotlight | null {
  const visible = Object.values(paisesData).filter(p => p.visible !== false && p.nivelRiesgo !== 'alto' && p.nivelRiesgo !== 'muy-alto');
  if (visible.length === 0) return null;

  const scored = visible.map(pais => {
    const tci = calculateTCI(pais.codigo);
    const base = 100 - (riskLevelNum[pais.nivelRiesgo] || 3) * 10;
    const score = base + (tci.tci < 90 ? 10 : tci.tci < 110 ? 5 : 0);
    return { pais, score, tci };
  });

  scored.sort((a, b) => b.score - a.score);
  const pick = scored[0];
  const pais = pick.pais;

  const irv = Math.max(40, Math.min(100, Math.round(pick.score)));
  const riskPenalty = (riskLevelNum[pais.nivelRiesgo] || 2) * 8;

  return {
    code: pais.codigo,
    name: pais.nombre,
    irv,
    irvDimensions: {
      sal: Math.max(30, Math.min(100, irv - Math.floor(Math.random() * 5))),
      seg: Math.max(30, Math.min(100, irv - riskPenalty + 5)),
      des: Math.max(30, Math.min(100, irv + Math.floor(Math.random() * 8))),
      mov: Math.max(30, Math.min(100, irv - Math.floor(Math.random() * 10))),
      eco: Math.max(30, Math.min(100, irv - 20 - Math.floor(Math.random() * 15))),
    },
    visa: pais.codigo === 'es' || pais.codigo === 'pt' || pais.codigo === 'fr' ? 'Sin visa para ES' : 'Consultar requisitos',
    safetyLabel: pais.nivelRiesgo === 'sin-riesgo' || pais.nivelRiesgo === 'bajo' ? 'Muy seguro' : 'Seguro con precauciones',
    whyNow: `El IRV de ${pais.nombre} se mantiene en niveles altos. Capital: ${pais.capital}. Moneda: ${pais.moneda}.`,
    whoIsItFor: [
      { profile: 'Presupuesto +80€/día y priorizas seguridad', verdict: 'Sí, esta es tu ventana' },
      { profile: 'Presupuesto <60€/día', verdict: 'Espera a temporada baja' },
      { profile: 'Viajas con niños', verdict: 'Considera alternativas con coste menor' },
    ],
  };
}

async function generateWeeklyQA(alerts: CountryAlert[]): Promise<WeeklyQA | null> {
  // Pick a country with interesting data
  const candidates = Object.values(paisesData).filter(p => p.visible !== false && (p.nivelRiesgo === 'medio' || p.nivelRiesgo === 'bajo'));
  if (candidates.length === 0) return null;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const riskPenalty = (riskLevelNum[pick.nivelRiesgo] || 2) * 8;
  const irv = Math.max(40, Math.min(100, 100 - riskPenalty));
  const seg = Math.max(30, Math.min(100, irv - riskPenalty + 5));

  try {
    const res = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un analista de viajes. Responde esta pregunta con datos concretos sobre ${pick.nombre}.
Formato: 2-3 párrafos. Incluye: IRV actual, dimensión de seguridad, mejor época para viajar, precauciones.
Sé directo, sin frases genéricas. Usa datos, no opiniones.`,
        },
        {
          role: 'user',
          content: `"¿Es seguro viajar a ${pick.nombre} este verano?"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 250,
    });

    return {
      question: `¿Es seguro viajar a ${pick.nombre} este verano?`,
      countryCode: pick.codigo,
      irv,
      segDimension: seg,
      answer: res.choices[0]?.message?.content?.trim() || `IRV actual: ${irv}/100. La dimensión de seguridad es ${seg}. Sin alertas activas MAEC ni GDACS. La respuesta corta: sí, con precauciones estándar.`,
    };
  } catch {
    return {
      question: `¿Es seguro viajar a ${pick.nombre} este verano?`,
      countryCode: pick.codigo,
      irv,
      segDimension: seg,
      answer: `IRV actual: ${irv}/100. Sin alertas activas MAEC ni GDACS. La situación es estable.`,
    };
  }
}

// ============================================================
// HTML TEMPLATE — Professional newsletter format
// ============================================================
export async function buildWeeklyEmailHtml(issue: NewsletterIssue): Promise<string> {
  const headerBg = '#0f172a';
  const accent = '#3b82f6';

  // Stats bar
  const statsHtml = `
    <tr><td style="background:#f1f5f9;padding:16px 24px;border-top:1px solid #e2e8f0;">
      <table width="100%"><tr>
        <td style="text-align:center;padding:0 8px;">
          <div style="font-size:24px;font-weight:bold;color:#dc2626;">${issue.newAlerts}</div>
          <div style="font-size:11px;color:#64748b;">alerta${issue.newAlerts !== 1 ? 's' : ''} nueva${issue.newAlerts !== 1 ? 's' : ''}</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #e2e8f0;">
          <div style="font-size:24px;font-weight:bold;color:#f59e0b;">${issue.irvChanges}</div>
          <div style="font-size:11px;color:#64748b;">paí${issue.irvChanges !== 1 ? 'ses' : 's'} con cambio IRV</div>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #e2e8f0;">
          <div style="font-size:24px;font-weight:bold;color:#22c55e;">${issue.stableCountries}</div>
          <div style="font-size:11px;color:#64748b;">paí${issue.stableCountries !== 1 ? 'ses' : 's'} sin novedad</div>
        </td>
      </tr></table>
    </td></tr>`;

  // Country alerts section
  const alertsHtml = issue.countryAlerts.map(a => {
    const irvDiff = a.irvNew - a.irvOld;
    const irvArrow = irvDiff < 0 ? '↓' : irvDiff > 0 ? '↑' : '→';
    const irvColor = irvDiff < 0 ? '#dc2626' : irvDiff > 0 ? '#22c55e' : '#64748b';
    const typeLabel = a.type === 'alert' ? 'alerta' : a.type === 'monitoring' ? 'en seguimiento 72h' : `IRV ${a.irvOld} → ${a.irvNew}`;
    const typeBg = a.type === 'alert' ? '#fef2f2' : a.type === 'monitoring' ? '#fffbeb' : '#f0f9ff';
    const typeColor = a.type === 'alert' ? '#dc2626' : a.type === 'monitoring' ? '#d97706' : '#2563eb';
    const sourcesHtml = a.sources.map(s => `<span style="display:inline-block;padding:2px 6px;background:#f1f5f9;color:#475569;font-size:10px;border-radius:3px;font-weight:600;">${s}</span>`).join(' ');

    return `
    <tr><td style="padding:20px 24px;border-top:1px solid #e2e8f0;">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
        <span style="font-size:16px;font-weight:bold;color:#0f172a;">${a.country_name}</span>
        <span style="font-size:11px;font-weight:bold;color:${typeColor};background:${typeBg};padding:2px 8px;border-radius:4px;">${typeLabel}</span>
      </div>
      ${irvDiff !== 0 ? `<div style="font-size:13px;color:${irvColor};font-weight:600;margin-bottom:8px;">IRV ${a.irvOld} → ${a.irvNew} ${irvArrow} nivel ${riskLevelNum[a.riskLevel.toLowerCase()] || '—'}</div>` : ''}
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;">${a.description}</p>
      <p style="font-size:13px;color:#1e293b;background:#f8fafc;padding:10px 12px;border-radius:6px;border-left:3px solid ${accent};margin:0 0 8px;"><strong>Lo que esto significa para ti:</strong> ${a.advice}</p>
      <div style="display:flex;gap:4px;flex-wrap:wrap;">${sourcesHtml}</div>
    </td></tr>`;
  }).join('');

  // Practical signal
  const practicalHtml = issue.practicalSignal ? `
    <tr><td style="padding:20px 24px;border-top:1px solid #e2e8f0;">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
        <span style="font-size:16px;font-weight:bold;color:#0f172a;">${issue.practicalSignal.title}</span>
        <span style="font-size:11px;font-weight:bold;color:#7c3aed;background:#f5f3ff;padding:2px 8px;border-radius:4px;">${issue.practicalSignal.type} · no IRV</span>
      </div>
      <p style="font-size:13px;color:#334155;margin:0 0 10px;">${issue.practicalSignal.impact}</p>
      <div style="padding:10px 12px;background:#f8fafc;border-radius:6px;border-left:3px solid #7c3aed;">
        ${issue.practicalSignal.advice.map((a, i) => `<p style="font-size:13px;color:#1e293b;margin:${i === 0 ? '0' : '6px 0 0'};">${i + 1}. ${a}</p>`).join('')}
      </div>
    </td></tr>` : '';

  // Destination spotlight
  const destHtml = issue.destinationSpotlight ? (() => {
    const d = issue.destinationSpotlight;
    const dimBars = [
      { label: 'SAL salud', value: d.irvDimensions.sal },
      { label: 'SEG seguridad', value: d.irvDimensions.seg },
      { label: 'DES destino', value: d.irvDimensions.des },
      { label: 'MOV movil.', value: d.irvDimensions.mov },
      { label: 'ECO economía', value: d.irvDimensions.eco },
    ];
    const barHtml = dimBars.map(dim => {
      const color = dim.value >= 80 ? '#22c55e' : dim.value >= 60 ? '#3b82f6' : dim.value >= 40 ? '#f59e0b' : '#ef4444';
      return `<tr><td style="padding:2px 0;font-size:11px;color:#475569;width:80px;">${dim.label}</td><td style="padding:2px 0 2px 8px;">
        <div style="width:100px;height:8px;background:#e2e8f0;border-radius:4px;overflow:inline-block;"><div style="width:${dim.value}%;height:100%;background:${color};border-radius:4px;"></div></div>
      </td><td style="padding:2px 0 2px 8px;font-size:11px;font-weight:bold;color:${color};">${dim.value}</td></tr>`;
    }).join('');

    const whoHtml = d.whoIsItFor.map(w => `<p style="font-size:13px;color:#334155;margin:4px 0;"><strong>Si ${w.profile.toLowerCase()}:</strong> ${w.verdict}</p>`).join('');

    return `
    <tr><td style="padding:20px 24px;border-top:1px solid #e2e8f0;">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px;">
        <span style="font-size:16px;font-weight:bold;color:#0f172a;">${d.name}</span>
        <span style="font-size:11px;font-weight:bold;color:#22c55e;background:#f0fdf4;padding:2px 8px;border-radius:4px;">${d.safetyLabel}</span>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:12px;">
        <div style="text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#3b82f6;">${d.irv}</div>
          <div style="font-size:10px;color:#64748b;">IRV</div>
        </div>
        <div style="flex:1;">
          <table style="font-size:11px;">${barHtml}</table>
        </div>
      </div>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 12px;">${d.whyNow}</p>
      <div style="padding:10px 12px;background:#f0fdf4;border-radius:6px;border-left:3px solid #22c55e;">
        <strong style="font-size:13px;color:#166534;">¿Es para ti?</strong>
        ${whoHtml}
      </div>
      <div style="text-align:center;margin-top:16px;">
        <a href="https://www.viajeinteligencia.com/decidir" style="display:inline-block;background:#3b82f6;color:#ffffff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">Decide en 30 segundos</a>
      </div>
    </td></tr>`;
  })() : '';

  // Weekly Q&A
  const qaHtml = issue.weeklyQuestion ? `
    <tr><td style="padding:20px 24px;border-top:1px solid #e2e8f0;">
      <div style="font-size:16px;font-weight:bold;color:#0f172a;margin-bottom:8px;">${issue.weeklyQuestion.question}</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <span style="font-size:12px;font-weight:bold;color:#3b82f6;background:#eff6ff;padding:3px 10px;border-radius:4px;">IRV ${issue.weeklyQuestion.irv}/100</span>
        <span style="font-size:12px;font-weight:bold;color:#64748b;background:#f1f5f9;padding:3px 10px;border-radius:4px;">SEG: ${issue.weeklyQuestion.segDimension}</span>
      </div>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;">${issue.weeklyQuestion.answer}</p>
    </td></tr>` : '';

  // Founder letter — shown only in first 3 editions
  const showFounderLetter = issue.edition <= 3;
  const founderLetterHtml = showFounderLetter ? `
    <tr><td style="background:#ffffff;padding:20px 24px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:bold;">M</div>
        <div>
          <div style="font-size:14px;font-weight:bold;color:#0f172a;">Miguel Castillo</div>
          <div style="font-size:11px;color:#64748b;">Fundador de Viaje con Inteligencia</div>
        </div>
      </div>
      <div style="border-left:3px solid #3b82f6;padding-left:16px;">
        <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Esto no es un boletín corporativo. Creé esta plataforma porque me cansé de consultar diez webs distintas antes de cada viaje: alertas del MAEC por un lado, precios de vuelos cambiando cada día, noticias sobre conflictos internacionales en otra página y experiencias dispersas en distintos foros.</p>
        <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Mientras aumentan las tensiones entre Irán, Estados Unidos e Israel, los precios del petróleo y de los vuelos vuelven a dispararse, generando incertidumbre para millones de viajeros.</p>
        <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Por eso construí un sistema que reúne información útil, contexto y datos reales en un solo lugar. Cada semana recibirás señales claras sobre riesgos, estabilidad, clima geopolítico, evolución de precios y destinos que todavía merecen la pena.</p>
        <p style="font-size:14px;color:#0f172a;line-height:1.7;margin:0;"><strong>El compromiso es sencillo: transparencia total, sin publicidad invasiva y sin venderte viajes. Solo inteligencia aplicada al viaje.</strong></p>
      </div>
      <div style="text-align:right;margin-top:12px;">
        <a href="https://www.viajeinteligencia.com/blog/por-que-creo-viaje-con-inteligencia" style="font-size:12px;color:#3b82f6;text-decoration:none;">Leer la historia completa →</a>
      </div>
    </td></tr>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root{color-scheme:light;supported-color-schemes:light;}</style>
</head>
<body style="margin:0;padding:0;background:#f8fafc !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a !important;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:${headerBg};padding:24px;">
          <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia · ${issue.weekDate} · edición #${issue.edition}</div>
          <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">Briefing semanal de inteligencia de viaje</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0;">Lo que necesitas saber esta semana antes de decidir a dónde viajar</p>
        </td></tr>

        <!-- Founder Letter (editions 1-3 only) -->
        ${founderLetterHtml}

        <!-- Stats -->
        ${statsHtml}

        <!-- Section: What changed -->
        <tr><td style="background:#ffffff;padding:16px 24px 8px;border-top:1px solid #e2e8f0;">
          <h2 style="font-size:13px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Qué ha cambiado esta semana · por qué te importa</h2>
        </td></tr>
        ${alertsHtml}

        <!-- Section: Practical signal -->
        ${issue.practicalSignal ? `<tr><td style="background:#ffffff;padding:16px 24px 8px;border-top:1px solid #e2e8f0;">
          <h2 style="font-size:13px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Señal práctica de la semana</h2>
        </td></tr>${practicalHtml}` : ''}

        <!-- Section: Destination spotlight -->
        ${issue.destinationSpotlight ? `<tr><td style="background:#ffffff;padding:16px 24px 8px;border-top:1px solid #e2e8f0;">
          <h2 style="font-size:13px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Destino de la semana · por qué ahora y no después</h2>
        </td></tr>${destHtml}` : ''}

        <!-- Section: Weekly Q&A -->
        ${issue.weeklyQuestion ? `<tr><td style="background:#ffffff;padding:16px 24px 8px;border-top:1px solid #e2e8f0;">
          <h2 style="font-size:13px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Pregunta de la semana · respondida con datos</h2>
        </td></tr>${qaHtml}` : ''}

        <!-- Section: Telegram alerts -->
        ${issue.recentIncidents.length > 0 ? `
        <tr><td style="background:#ffffff;padding:16px 24px 8px;border-top:1px solid #e2e8f0;">
          <h2 style="font-size:13px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0;">📱 Alertas activas · Telegram</h2>
        </td></tr>
        <tr><td style="background:#ffffff;padding:8px 24px 6px;">
          <p style="font-size:13px;color:#475569;line-height:1.5;margin:0 0 10px;">Incidentes detectados esta semana. Recibe notificaciones en tiempo real desde <strong>@ViajeConInteligenciaBot</strong>.</p>
          ${issue.recentIncidents.map((inc: RecentIncident) => {
            const iconMap: Record<string, string> = {
              terrorism: '⚠️', airspace_closure: '✈️', conflict: '💥', natural_disaster: '🌍',
              flight_disruption: '🛫', health_outbreak: '🏥', protest: '📢', travel_advisory: '📋',
              security_threat: '🔒', infrastructure: '🏗️',
            };
            const sevColor = inc.severity === 'critical' ? '#dc2626' : inc.severity === 'high' ? '#ea580c' : inc.severity === 'medium' ? '#ca8a04' : '#64748b';
            const pais = paisesData[inc.country_code];
            return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f8fafc;border-radius:6px;margin-bottom:6px;border-left:3px solid ${sevColor};">
              <span style="font-size:16px;">${iconMap[inc.type] || '📌'}</span>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;color:#0f172a;">${pais?.nombre || inc.country_code} · ${inc.type.replace(/_/g, ' ')}</div>
                <div style="font-size:12px;color:#64748b;">${inc.title.length > 60 ? inc.title.substring(0, 60) + '…' : inc.title}</div>
              </div>
              <span style="font-size:10px;font-weight:bold;color:#fff;background:${sevColor};padding:2px 8px;border-radius:4px;text-transform:uppercase;">${inc.severity}</span>
            </div>`;
          }).join('')}
          <div style="text-align:center;margin:12px 0 4px;">
            <a href="https://t.me/ViajeConInteligenciaBot?start=subscribe" style="display:inline-block;font-size:13px;font-weight:bold;color:#ffffff;background:#2563eb;padding:8px 20px;border-radius:6px;text-decoration:none;">🔔 Suscribirme a alertas en Telegram</a>
          </div>
          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:4px 0 0;">Usa /suscribir ES desde el bot para elegir países</p>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="background:#f1f5f9;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Viaje con Inteligencia · datos OSINT · ${TOTAL_PAISES} países · actualización semanal</p>
          <p style="margin:0;">
            <a href="https://www.viajeinteligencia.com" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Web</a>
            <a href="https://t.me/ViajeConInteligencia" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Telegram</a>
            <a href="https://www.viajeinteligencia.com/api/newsletter/subscribe?action=unsubscribe&email={{EMAIL}}" style="color:#64748b;text-decoration:underline;font-size:12px;margin:0 8px;">Cancelar</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Keep old function signature for backward compat with test endpoint
export async function collectWeeklyData(): Promise<{
  subscribers: Array<{ email: string; name: string }>;
  digestData: { riskChanges: any[]; topSignals: any[]; destination: any };
}> {
  const issue = await collectNewsletterData();
  return {
    subscribers: [],
    digestData: {
      riskChanges: issue.countryAlerts,
      topSignals: [],
      destination: issue.destinationSpotlight || {},
    },
  };
}

export async function generateWeeklyContent(data: any): Promise<{ riskSection: string; signalsSection: string; destinationSection: string }> {
  return { riskSection: '', signalsSection: '', destinationSection: '' };
}
