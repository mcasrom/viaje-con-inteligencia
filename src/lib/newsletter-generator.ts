import { groqClient } from './groq-ai';
import { supabaseAdmin } from './supabase-admin';
import { paisesData } from '@/data/paises';

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': 'Bajo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
};

export interface WeeklyDigestData {
  riskChanges: Array<{ country_code: string; old_risk: string; new_risk: string; created_at: string }>;
  topSignals: Array<{ title: string; category: string; urgency: string; summary: string }>;
  destination: { code: string; name: string; risk: string; capital: string; currency: string };
}

export async function generateWeeklyContent(data: WeeklyDigestData): Promise<{
  riskSection: string;
  signalsSection: string;
  destinationSection: string;
}> {
  const [riskSection, signalsSection, destinationSection] = await Promise.all([
    generateRiskSummary(data.riskChanges),
    generateSignalsSummary(data.topSignals),
    generateDestinationSpotlight(data.destination),
  ]);

  return { riskSection, signalsSection, destinationSection };
}

async function generateRiskSummary(changes: WeeklyDigestData['riskChanges']): Promise<string> {
  if (changes.length === 0) {
    return 'No hubo cambios en los niveles de riesgo esta semana.';
  }

  const changeLines = changes
    .map(c => {
      const pais = paisesData[c.country_code];
      const nombre = pais ? pais.nombre : c.country_code;
      const oldL = riesgoLabels[c.old_risk] || c.old_risk;
      const newL = riesgoLabels[c.new_risk] || c.new_risk;
      return `${nombre}: ${oldL} → ${newL}`;
    })
    .join('\n');

  try {
    const res = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un analista de riesgos de viaje. Escribe un resumen conciso en español (40-60 palabras) sobre los cambios de riesgo de esta semana. Sé directo, sin rodeos.',
        },
        {
          role: 'user',
          content: `Cambios de riesgo esta semana:\n${changeLines}\n\nEscribe un resumen útil para viajeros.`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 200,
    });

    return res.choices[0]?.message?.content?.trim() || `Cambios detectados:\n${changeLines}`;
  } catch {
    return `Cambios detectados:\n${changeLines}`;
  }
}

async function generateSignalsSummary(signals: WeeklyDigestData['topSignals']): Promise<string> {
  if (signals.length === 0) {
    return 'Sin señales relevantes esta semana.';
  }

  const signalLines = signals.slice(0, 5)
    .map(s => `• [${s.category}] ${s.summary || s.title}`)
    .join('\n');

  try {
    const res = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un editor de noticias de viajes. Escribe un resumen conciso en español (30-50 palabras) sobre las señales OSINT más relevantes. Sin alarmismo, datos concretos.',
        },
        {
          role: 'user',
          content: `Señales detectadas:\n${signalLines}\n\nResume lo más relevante para viajeros.`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 200,
    });

    return res.choices[0]?.message?.content?.trim() || signalLines;
  } catch {
    return signalLines;
  }
}

async function generateDestinationSpotlight(dest: WeeklyDigestData['destination']): Promise<string> {
  try {
    const res = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor de viajes. Escribe un párrafo de 40-50 palabras sobre un destino para viajeros españoles. Incluye: por qué visitar, mejor época, dato curioso. Tono profesional pero cercano. Sin emojis. Sin frases genéricas como "destino fascinante".',
        },
        {
          role: 'user',
          content: `Destino: ${dest.name}
Capital: ${dest.capital}
Moneda: ${dest.currency}
Riesgo MAEC: ${dest.risk}

Escribe un spotlight para newsletter.`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.6,
      max_tokens: 200,
    });

    return res.choices[0]?.message?.content?.trim() || `${dest.name}: Capital ${dest.capital}, moneda ${dest.currency}. Riesgo MAEC: ${dest.risk}.`;
  } catch {
    return `${dest.name}: Capital ${dest.capital}, moneda ${dest.currency}. Riesgo MAEC: ${dest.risk}.`;
  }
}

export async function buildWeeklyEmailHtml(
  name: string,
  content: { riskSection: string; signalsSection: string; destinationSection: string },
  weekDate: string
): Promise<string> {
  const riskHtml = content.riskSection.split('\n').map(l => {
    const trimmed = l.trim();
    if (!trimmed) return '';
    return `<p style="margin:4px 0;font-size:14px;color:#1e293b;line-height:1.5;">${trimmed}</p>`;
  }).join('');
  const signalsHtml = content.signalsSection.split('\n').map(l => {
    const trimmed = l.trim();
    if (!trimmed) return '';
    return `<p style="margin:4px 0;font-size:14px;color:#1e293b;line-height:1.5;">${trimmed}</p>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1e293b;border-radius:12px 12px 0 0;padding:24px;">
          <h1 style="color:#60a5fa;font-size:22px;margin:0 0 4px;">📬 Resumen Semanal</h1>
          <p style="color:#94a3b8;font-size:13px;margin:0;">${weekDate} · Viaje con Inteligencia</p>
        </td></tr>

        <!-- Risk Section -->
        <tr><td style="background:#ffffff;border-radius:0;padding:20px;border-left:4px solid #fbbf24;border-right:4px solid #fbbf24;">
          <h2 style="color:#d97706;font-size:16px;margin:0 0 12px;">🔔 Cambios de Riesgo</h2>
          ${riskHtml}
        </td></tr>

        <!-- OSINT Signals -->
        <tr><td style="background:#ffffff;padding:20px;border-left:4px solid #34d399;border-right:4px solid #34d399;">
          <h2 style="color:#059669;font-size:16px;margin:0 0 12px;">📡 Señales Relevantes</h2>
          ${signalsHtml}
        </td></tr>

        <!-- Destination Spotlight -->
        <tr><td style="background:#ffffff;padding:20px;border-left:4px solid #3b82f6;border-right:4px solid #3b82f6;">
          <h2 style="color:#2563eb;font-size:16px;margin:0 0 12px;">🌍 Destino de la Semana</h2>
          <p style="color:#1e293b;font-size:14px;line-height:1.6;margin:0;">${content.destinationSection}</p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:20px;text-align:center;border-left:4px solid #1e293b;border-right:4px solid #1e293b;">
          <a href="https://www.viajeinteligencia.com" style="display:inline-block;background:#3b82f6;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Ver mapa interactivo
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:16px 0 0;">
          <p style="color:#64748b;font-size:12px;margin:4px 0;">Datos: MAEC, USGS, GDACS, GDELT</p>
          <p style="color:#64748b;font-size:12px;margin:4px 0;">
            <a href="https://www.viajeinteligencia.com/api/newsletter/subscribe?action=unsubscribe&email={{EMAIL}}" style="color:#475569;text-decoration:underline;">Cancelar suscripción</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function collectWeeklyData(): Promise<{
  subscribers: Array<{ email: string; name: string }>;
  digestData: WeeklyDigestData;
}> {
  if (!supabaseAdmin) {
    throw new Error('No supabase admin client');
  }

  const { data: subs } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, name')
    .eq('verified', true)
    .is('unsubscribed_at', null);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: alerts } = await supabaseAdmin
    .from('risk_alerts')
    .select('country_code, old_risk, new_risk, created_at')
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: signals } = await supabaseAdmin
    .from('osint_signals')
    .select('title, category, urgency, summary')
    .gte('post_timestamp', weekAgo)
    .in('urgency', ['high', 'critical'])
    .order('post_timestamp', { ascending: false })
    .limit(10);

  // Pick a random visible country for destination spotlight
  const visibleCountries = Object.values(paisesData).filter(p => p.visible !== false);
  const randomDest = visibleCountries[Math.floor(Math.random() * visibleCountries.length)];
  const pais = paisesData[randomDest.codigo];

  const digestData: WeeklyDigestData = {
    riskChanges: alerts || [],
    topSignals: (signals || []).map(s => ({
      title: s.title || '',
      category: s.category || 'otro',
      urgency: s.urgency || 'low',
      summary: s.summary || s.title || '',
    })),
    destination: {
      code: randomDest.codigo,
      name: pais ? pais.nombre : randomDest.codigo,
      risk: riesgoLabels[pais?.nivelRiesgo || ''] || pais?.nivelRiesgo || 'N/A',
      capital: pais?.capital || '',
      currency: pais?.moneda || '',
    },
  };

  return {
    subscribers: (subs || []).map(s => ({ email: s.email, name: s.name || '' })),
    digestData,
  };
}
