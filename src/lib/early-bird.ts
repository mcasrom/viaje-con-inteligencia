import { createLogger } from '@/lib/logger';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { getTodosLosPaises } from '@/data/paises';

const log = createLogger('EarlyBird');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const ADMIN_EMAIL = 'info@viajeinteligencia.com';
const Resend = typeof process !== 'undefined' && process.env.RESEND_API_KEY
  ? (await import('resend')).Resend
  : null;
const resend = process.env.RESEND_API_KEY ? new (await import('resend')).Resend(process.env.RESEND_API_KEY) : null;

const TYPE_ICON: Record<string, string> = {
  terrorism: '⚠️',
  airspace_closure: '✈️',
  conflict: '💥',
  natural_disaster: '🌍',
  flight_disruption: '🛫',
  health_outbreak: '🏥',
  protest: '📢',
  travel_advisory: '📋',
  security_threat: '🔒',
  infrastructure: '🏗️',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

const RISK_EMOJI: Record<string, string> = {
  'sin-riesgo': '🟢',
  'bajo': '🟡',
  'medio': '🟠',
  'alto': '🔴',
  'muy-alto': '⚫',
};

function escapeMD(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

async function getRecentIncidents(hours = 24): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('incidents')
    .select('country_code, type, severity, description, detected_at, tone_score')
    .gte('detected_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('severity', { ascending: true })
    .order('detected_at', { ascending: false });
  return data || [];
}

async function getRecentMAECChanges(hours = 48): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('maec_risk_history')
    .select('country_code, old_level, new_level, changed_at')
    .gte('changed_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('changed_at', { ascending: false })
    .limit(10);
  return data || [];
}

async function getSentimentAlerts(hours = 24): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('sentiment_alerts')
    .select('country_code, avg_tone_7d, tone_trend_7d, triggered_at')
    .gte('triggered_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('avg_tone_7d', { ascending: true })
    .limit(10);
  return data || [];
}

export async function buildEarlyBirdDigest(): Promise<string | null> {
  try {
    const paises = getTodosLosPaises();
    const paisMap = new Map(paises.map(p => [p.codigo, p]));

    const [incidents, maecChanges, sentimentAlerts] = await Promise.all([
      getRecentIncidents(24),
      getRecentMAECChanges(48),
      getSentimentAlerts(24),
    ]);

    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const lines: string[] = [];

    lines.push(`🌅 *Early Bird — ${escapeMD(today)}*`);
    lines.push('');

    // === CAMBIOS MAEC ===
    if (maecChanges.length > 0) {
      lines.push(`📊 *Cambios MAEC (últimas 48h)*`);
      lines.push('');
      for (const c of maecChanges.slice(0, 5)) {
        const pais = paisMap.get(c.country_code);
        const emoji = pais?.bandera || '🌍';
        const oldEmoji = RISK_EMOJI[c.old_level] || '❓';
        const newEmoji = RISK_EMOJI[c.new_level] || '❓';
        const arrow = c.old_level === c.new_level ? '→' : (c.new_level > c.old_level ? '⬆️' : '⬇️');
        lines.push(`${emoji} *${pais?.nombre || c.country_code}* ${oldEmoji} ${arrow} ${newEmoji}`);
      }
      lines.push('');
    }

    // === INCIDENTES ===
    if (incidents.length > 0) {
      lines.push(`🚨 *Incidentes nuevos (24h)*`);
      lines.push('');
      const grouped = new Map<string, any[]>();
      for (const inc of incidents) {
        const key = `${inc.type}_${inc.severity}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(inc);
      }
      for (const sev of SEVERITY_ORDER) {
        for (const [typeKey, items] of grouped) {
          if (!typeKey.endsWith(sev)) continue;
          const [type] = typeKey.split('_');
          const icon = TYPE_ICON[type] || '📌';
          const label = type.replace(/_/g, ' ');
          const countries = items.map(i => {
            const pais = paisMap.get(i.country_code);
            return pais?.nombre || i.country_code;
          }).join(', ');
          lines.push(`${icon} *${escapeMD(label)}* (${escapeMD(sev)}) — ${escapeMD(countries)}`);
        }
      }
      lines.push('');
    }

    // === SENTIMIENTO ===
    if (sentimentAlerts.length > 0) {
      lines.push(`📉 *Sentimiento negativo (24h)*`);
      lines.push('');
      for (const s of sentimentAlerts.slice(0, 5)) {
        const pais = paisMap.get(s.country_code);
        const emoji = pais?.bandera || '🌍';
        const tone = s.avg_tone_7d?.toFixed(1) || '0';
        const trend = s.tone_trend_7d > 0 ? '📈' : '📉';
        lines.push(`${emoji} *${pais?.nombre || s.country_code}* tone: ${tone} ${trend}`);
      }
      lines.push('');
    }

    // === RESUMEN ===
    const totalIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    const negativeSentiment = sentimentAlerts.filter(s => s.avg_tone_7d < -5).length;

    lines.push(`📋 *Resumen*`);
    lines.push(`• Incidentes: ${totalIncidents} (${criticalIncidents} críticos/altos)`);
    lines.push(`• Cambios MAEC: ${maecChanges.length}`);
    lines.push(`• Sentimiento negativo: ${negativeSentiment} países`);
    lines.push('');
    lines.push(`🔗 Dashboard: https://www.viajeinteligencia.com/admin/dashboard`);
    lines.push(`🔗 OSINT: https://www.viajeinteligencia.com/admin/osint`);

    return lines.join('\n');
  } catch (err) {
    log.error('Error building early bird digest', err);
    return null;
  }
}

export async function sendEarlyBirdDigest(text: string): Promise<boolean> {
  try {
    // Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, text, parse_mode: 'Markdown' }),
        });
        log.info('Early bird sent to Telegram');
      } catch (e) {
        log.error('Failed to send early bird to Telegram', e);
      }
    }

    // Email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Viaje con Inteligencia <earlybird@viajeinteligencia.com>',
          to: ADMIN_EMAIL,
          subject: `🌅 Early Bird — ${new Date().toLocaleDateString('es-ES')}`,
          html: `<pre style="background:#1e293b;padding:16px;border-radius:8px;color:#cbd5e1;font-size:13px;font-family:monospace;">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
        });
        log.info('Early bird sent to email');
      } catch (e) {
        log.error('Failed to send early bird email', e);
      }
    }

    return true;
  } catch (err) {
    log.error('Error sending early bird digest', err);
    return false;
  }
}
