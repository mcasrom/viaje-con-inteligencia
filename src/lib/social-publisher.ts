import { createLogger } from '@/lib/logger';
import { paisesData } from '@/data/paises';
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import type { NewsletterIssue, RecentIncident } from '@/lib/newsletter-generator';

const log = createLogger('SocialPublisher');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;
const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE || 'https://mastodon.social';
const BLUESKY_IDENTIFIER = process.env.BLUESKY_HANDLE || process.env.BLUESKY_IDENTIFIER;
const BLUESKY_APP_PASSWORD = process.env.BLUESKY_APP_PASSWORD;

const MAX_TG_LENGTH = 4000;
const MAX_MASTODON_LENGTH = 500;

const TYPE_ICON: Record<string, string> = {
  terrorism: '⚠️', airspace_closure: '✈️', conflict: '💥', natural_disaster: '🌍',
  flight_disruption: '🛫', health_outbreak: '🏥', protest: '📢', travel_advisory: '📋',
  security_threat: '🔒', infrastructure: '🏗️',
};

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Leve', medium: 'Moderado', high: 'Alto', critical: 'Crítico',
};

function escapeMD(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export function buildNewsletterSummary(issue: NewsletterIssue): {
  full: string;
  short: string;
  mastodonThread: string[];
} {
  const lines: string[] = [];
  lines.push(`📬 *Briefing Semanal* · Edición #${issue.edition}`);
  lines.push(`📅 ${issue.weekDate}`);
  lines.push('');

  const alertCount = issue.countryAlerts.filter(a => a.type === 'alert').length;
  const changeCount = issue.irvChanges;
  if (alertCount > 0 || changeCount > 0) {
    lines.push(`*📊 Resumen:*`);
    lines.push(`🔴 Alertas activas: ${alertCount}`);
    lines.push(`🔄 Cambios IRV: ${changeCount}`);
    lines.push(`🟢 Países estables: ${issue.stableCountries}`);
    lines.push('');
  }

  const topAlerts = issue.countryAlerts.slice(0, 3);
  if (topAlerts.length > 0) {
    lines.push('*⚠️ Alertas destacadas:*');
    for (const a of topAlerts) {
      const emoji = a.type === 'alert' ? '🔴' : a.type === 'irv_up' ? '🟠' : '🟢';
      lines.push(`${emoji} *${a.country_name}*: ${a.title}`);
    }
    lines.push('');
  }

  if (issue.recentIncidents.length > 0) {
    lines.push('*📱 Incidentes recientes:*');
    for (const inc of issue.recentIncidents.slice(0, 3)) {
      const pais = paisesData[inc.country_code];
      const icon = TYPE_ICON[inc.type] || '📌';
      const sev = SEVERITY_LABEL[inc.severity] || inc.severity;
      lines.push(`${icon} *${pais?.nombre || inc.country_code}* · ${sev}`);
    }
    lines.push('');
  }

  if (issue.destinationSpotlight) {
    const d = issue.destinationSpotlight;
    lines.push(`*🌟 Destino destacado:* ${d.name}`);
    lines.push(`IRV ${d.irv}/100 · ${d.safetyLabel}`);
    lines.push('');

    const firstProfile = d.whoIsItFor?.[0];
    if (firstProfile) {
      lines.push(`*Para quién:* ${firstProfile.profile} — ${firstProfile.verdict}`);
      lines.push('');
    }
  }

  if (issue.weeklyQuestion) {
    lines.push(`*❓ Pregunta de la semana:*`);
    lines.push(issue.weeklyQuestion.answer.length > 200
      ? issue.weeklyQuestion.answer.substring(0, 200) + '…'
      : issue.weeklyQuestion.answer
    );
    lines.push('');
  }

  lines.push('🔗 viajeinteligencia.com');
  lines.push('🤖 @ViajeConInteligenciaBot');
  lines.push('');
  lines.push('#ViajeInteligente #TravelRisk #SeguridadViaje');

  const full = lines.join('\n');

  const shortLines: string[] = [];
  shortLines.push(`📬 Briefing #${issue.edition}`);
  const sa = issue.countryAlerts.filter(a => a.type === 'alert').length;
  const sc = issue.irvChanges;
  if (sa > 0 || sc > 0) {
    shortLines.push(`🔴 ${sa} alertas · 🔄 ${sc} cambios · 🟢 ${issue.stableCountries} estables`);
  }
  if (issue.recentIncidents.length > 0) {
    const incs = issue.recentIncidents.slice(0, 2).map(i => {
      const p = paisesData[i.country_code];
      return `${p?.nombre || i.country_code} (${SEVERITY_LABEL[i.severity] || i.severity})`;
    });
    shortLines.push(`📱 Incidentes: ${incs.join(', ')}`);
  }
  if (issue.destinationSpotlight) {
    shortLines.push(`🌟 Destino: ${issue.destinationSpotlight.name}`);
  }
  shortLines.push('🔗 viajeinteligencia.com');

  const short = shortLines.join(' · ');

  const mastodonThread: string[] = [];
  const mastodonRaw = `📬 Briefing Semanal #${issue.edition} — ${issue.weekDate}

📊 ${issue.countryAlerts.filter(a => a.type === 'alert').length} alertas · ${issue.irvChanges} cambios · ${issue.stableCountries} estables

${topAlerts.length > 0 ? topAlerts.map(a => `• ${a.country_name}: ${a.title}`).join('\n') + '\n\n' : ''}${issue.destinationSpotlight ? `🌟 Destino: ${issue.destinationSpotlight.name}\n\n` : ''}🔗 https://viajeinteligencia.com

#ViajeInteligente #TravelRisk #TravelSecurity`;

  const chars = mastodonRaw.length;
  if (chars <= MAX_MASTODON_LENGTH) {
    mastodonThread.push(mastodonRaw);
  } else {
    const intro = `📬 Briefing #${issue.edition} — ${issue.weekDate}`;
    const statsLine = `📊 ${issue.countryAlerts.filter(a => a.type === 'alert').length} alertas · ${issue.irvChanges} cambios`;
    mastodonThread.push(`${intro}\n\n${statsLine}\n\n${topAlerts.length > 0 ? topAlerts.map(a => `• ${a.country_name}: ${a.title}`).join('\n') : 'Sin alertas destacadas.'}\n\n🧵 Sigue...`);
    mastodonThread.push(`${issue.destinationSpotlight ? `🌟 Destino: ${issue.destinationSpotlight.name}\n\n` : ''}${issue.weeklyQuestion ? `❓ ${issue.weeklyQuestion.answer.substring(0, 150)}…\n\n` : ''}🔗 https://viajeinteligencia.com\n\n#ViajeInteligente #TravelRisk`);
  }

  return { full, short, mastodonThread };
}

export async function publishToTelegramChannel(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    log.warn('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID — skipping');
    return false;
  }

  try {
    const chunks: string[] = [];
    if (text.length <= MAX_TG_LENGTH) {
      chunks.push(text);
    } else {
      const parts = text.split('\n\n');
      let current = '';
      for (const part of parts) {
        if (current.length + part.length + 2 > MAX_TG_LENGTH) {
          chunks.push(current);
          current = part;
        } else {
          current += (current ? '\n\n' : '') + part;
        }
      }
      if (current) chunks.push(current);
    }

    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHANNEL_ID,
            text: escapeMD(chunk),
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: false,
          }),
        }
      );
      const result = await response.json();
      if (!result.ok) {
        log.error('Telegram channel error', result);
        return false;
      }
    }
    return true;
  } catch (error) {
    log.error('Telegram channel network error', error);
    return false;
  }
}

export async function publishToMastodon(text: string): Promise<boolean> {
  if (!MASTODON_ACCESS_TOKEN) {
    log.warn('Missing MASTODON_ACCESS_TOKEN — skipping');
    return false;
  }

  try {
    const response = await fetch(
      `${MASTODON_INSTANCE}/api/v1/statuses`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MASTODON_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `newsletter-${Date.now()}`,
        },
        body: JSON.stringify({
          status: text,
          visibility: 'public',
          language: 'es',
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      log.error('Mastodon API error', { status: response.status, body });
      return false;
    }
    return true;
  } catch (error) {
    log.error('Mastodon network error', error);
    return false;
  }
}

export async function publishToBlueSky(text: string): Promise<boolean> {
  if (!BLUESKY_IDENTIFIER || !BLUESKY_APP_PASSWORD) {
    log.warn('Missing BLUESKY_IDENTIFIER or APP_PASSWORD — skipping');
    return false;
  }

  try {
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: BLUESKY_IDENTIFIER,
        password: BLUESKY_APP_PASSWORD,
      }),
    });

    if (!sessionRes.ok) {
      log.error('BlueSky auth error', { status: sessionRes.status });
      return false;
    }

    const session = await sessionRes.json();
    const did = session.did;

    const now = new Date().toISOString();

    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: did,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text: text.length > 300 ? text.substring(0, 297) + '…' : text,
          createdAt: now,
          langs: ['es'],
        },
      }),
    });

    if (!postRes.ok) {
      const body = await postRes.text();
      log.error('BlueSky API error', { status: postRes.status, body });
      return false;
    }
    return true;
  } catch (error) {
    log.error('BlueSky network error', error);
    return false;
  }
}

export async function publishToTelegramSubscribers(text: string): Promise<{ sent: number; errors: number }> {
  if (!TELEGRAM_BOT_TOKEN || !isSupabaseAdminConfigured()) {
    log.warn('Missing TELEGRAM_BOT_TOKEN or supabase admin — skipping subscriber broadcast');
    return { sent: 0, errors: 0 };
  }

  const { data: chatIds } = await supabaseAdmin!
    .from('alert_preferences')
    .select('telegram_chat_id, telegram_username')
    .not('telegram_chat_id', 'is', null);

  if (!chatIds || chatIds.length === 0) {
    log.info('No Telegram subscribers to notify');
    return { sent: 0, errors: 0 };
  }

  const uniqueIds = Array.from(new Set(chatIds.map(r => Number(r.telegram_chat_id)).filter(id => !isNaN(id))));

  let sent = 0;
  let errors = 0;

  for (const chatId of uniqueIds) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: escapeMD(text),
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: false,
          }),
        }
      );
      const result = await response.json();
      if (result.ok) {
        sent++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  log.info(`Telegram subscriber broadcast: ${sent} sent, ${errors} errors`);
  return { sent, errors };
}
