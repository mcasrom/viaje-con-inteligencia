import { createLogger } from '@/lib/logger';
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';

const log = createLogger('IncidentNotifier');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

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

const INCIDENT_TYPE_TO_CATEGORY: Record<string, string> = {
  terrorism: 'seguridad',
  airspace_closure: 'logistico',
  conflict: 'geopolitico',
  natural_disaster: 'clima',
  flight_disruption: 'logistico',
  health_outbreak: 'salud',
  protest: 'geopolitico',
  travel_advisory: 'otro',
  security_threat: 'seguridad',
  infrastructure: 'logistico',
};

async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      log.error('Telegram send error', data);
    }
    return data.ok;
  } catch (e) {
    log.error('Telegram send exception', e);
    return false;
  }
}

export async function notifySubscribers(
  created: number,
  updated: number
): Promise<{ notified: number; errors: number }> {
  if (!isSupabaseAdminConfigured() || !TELEGRAM_BOT_TOKEN) {
    return { notified: 0, errors: 0 };
  }

  const recentWindow = new Date(Date.now() - 5 * 60 * 1000);

  const { data: recentIncidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .gte('created_at', recentWindow.toISOString())
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (!recentIncidents || recentIncidents.length === 0) {
    log.info('No recent incidents to notify about');
    return { notified: 0, errors: 0 };
  }

  const countryCodes = [...new Set(recentIncidents
    .map(i => i.country_code)
    .filter((c): c is string => !!c)
  )];

  if (countryCodes.length === 0) {
    log.info('No country codes in recent incidents');
    return { notified: 0, errors: 0 };
  }

  const { data: subscriptions } = await supabaseAdmin
    .from('alert_preferences')
    .select('*')
    .in('country_code', countryCodes)
    .not('telegram_chat_id', 'is', null);

  if (!subscriptions || subscriptions.length === 0) {
    log.info('No subscriptions match recent incidents');
    return { notified: 0, errors: 0 };
  }

  let notified = 0;
  let errors = 0;
  const sentSet = new Set<string>();

  for (const incident of recentIncidents) {
    const incidentSeverityIndex = SEVERITY_ORDER.indexOf(incident.severity || 'low');
    const category = INCIDENT_TYPE_TO_CATEGORY[incident.type] || 'otro';

    const matchingSubs = subscriptions.filter(sub => {
      if (sub.country_code !== incident.country_code) return false;
      const minSeverityIndex = SEVERITY_ORDER.indexOf(sub.severity_min || 'medium');
      if (incidentSeverityIndex < minSeverityIndex) return false;
      const types = sub.alert_types || ['riesgo', 'clima'];
      return types.includes(category);
    });

    for (const sub of matchingSubs) {
      const dedupKey = `${sub.telegram_chat_id}-${incident.id}`;
      if (sentSet.has(dedupKey)) continue;
      sentSet.add(dedupKey);

      const typeIcon = TYPE_ICON[incident.type] || '🔔';

      const severityEmoji = incident.severity === 'critical' ? '🔴' :
        incident.severity === 'high' ? '🟠' :
        incident.severity === 'medium' ? '🟡' : '🟢';

      const message =
        `${severityEmoji} *Alerta de ${incident.type?.replace(/_/g, ' ') || 'incidente'}*\n\n` +
        `${typeIcon} ${incident.title}\n\n` +
        (incident.description ? `${incident.description}\n\n` : '') +
        (incident.location ? `📍 ${incident.location}\n` : '') +
        `🌍 ${incident.country_code?.toUpperCase()}\n` +
        `⚠️ Severidad: ${incident.severity}\n` +
        (incident.recommendation ? `💡 ${incident.recommendation}\n\n` : '\n') +
        `🔗 https://www.viajeinteligencia.com/pais/${incident.country_code}`;

      const ok = await sendTelegramMessage(sub.telegram_chat_id, message);
      if (ok) notified++;
      else errors++;
    }
  }

  log.info(`Incident notifications: ${notified} sent, ${errors} errors`);
  return { notified, errors };
}
