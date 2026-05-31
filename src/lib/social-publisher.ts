import { createLogger } from '@/lib/logger';
import { getPaisesData } from '@/lib/paises-db';
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { NOMBRES_EN } from '@/data/nombres-en';
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

export function getDayLanguage(): 'es' | 'en' {
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - startOfYear) / 86400000);
  return dayOfYear % 2 === 0 ? 'es' : 'en';
}

const I18N = {
  es: {
    briefingTitle: 'Briefing Semanal',
    summary: 'Resumen',
    activeAlerts: 'Alertas activas',
    irvChanges: 'Cambios IRV',
    stableCountries: 'Países estables',
    featuredAlerts: 'Alertas destacadas',
    recentIncidents: 'Incidentes recientes',
    destinationSpotlight: 'Destino destacado',
    forWhom: 'Para quién',
    weeklyQuestion: 'Pregunta de la semana',
    hashtags: '#ViajeInteligente #TravelRisk #SeguridadViaje',
    botMention: '🤖 @ViajeConInteligenciaBot',
    separator: '·',
  },
  en: {
    briefingTitle: 'Weekly Briefing',
    summary: 'Summary',
    activeAlerts: 'Active alerts',
    irvChanges: 'IRV changes',
    stableCountries: 'Stable countries',
    featuredAlerts: 'Featured alerts',
    recentIncidents: 'Recent incidents',
    destinationSpotlight: 'Destination spotlight',
    forWhom: 'For whom',
    weeklyQuestion: 'Question of the week',
    hashtags: '#TravelIntelligence #TravelRisk #SmartTravel',
    botMention: '🤖 @ViajeConInteligenciaBot',
    separator: '·',
  },
};

const TYPE_ICON: Record<string, string> = {
  terrorism: '⚠️', airspace_closure: '✈️', conflict: '💥', natural_disaster: '🌍',
  flight_disruption: '🛫', health_outbreak: '🏥', protest: '📢', travel_advisory: '📋',
  security_threat: '🔒', infrastructure: '🏗️',
};

const SEVERITY_LABEL: Record<string, Record<string, string>> = {
  es: { low: 'Leve', medium: 'Moderado', high: 'Alto', critical: 'Crítico' },
  en: { low: 'Low', medium: 'Moderate', high: 'High', critical: 'Critical' },
};

function escapeMD(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function buildNewsletterSummary(issue: NewsletterIssue, lang: 'es' | 'en' = 'es'): Promise<{
  full: string;
  short: string;
  mastodonThread: string[];
  lang: 'es' | 'en';
}> {
  const t = I18N[lang];
  const sev = SEVERITY_LABEL[lang];

  const allPaises = await getPaisesData();

  const lines: string[] = [];
  lines.push(`📬 *${t.briefingTitle}* · Edition #${issue.edition}`);
  lines.push(`📅 ${issue.weekDate}`);
  lines.push('');

  const alertCount = issue.countryAlerts.filter(a => a.type === 'alert').length;
  const changeCount = issue.irvChanges;
  if (alertCount > 0 || changeCount > 0) {
    lines.push(`*📊 ${t.summary}:*`);
    lines.push(`🔴 ${t.activeAlerts}: ${alertCount}`);
    lines.push(`🔄 ${t.irvChanges}: ${changeCount}`);
    lines.push(`🟢 ${t.stableCountries}: ${issue.stableCountries}`);
    lines.push('');
  }

  const topAlerts = issue.countryAlerts.slice(0, 3);
  if (topAlerts.length > 0) {
    lines.push(`*⚠️ ${t.featuredAlerts}:*`);
    for (const a of topAlerts) {
      const emoji = a.type === 'alert' ? '🔴' : a.type === 'irv_up' ? '🟠' : '🟢';
      lines.push(`${emoji} *${a.country_name}*: ${a.title}`);
    }
    lines.push('');
  }

  if (issue.recentIncidents.length > 0) {
    lines.push(`*📱 ${t.recentIncidents}:*`);
    for (const inc of issue.recentIncidents.slice(0, 3)) {
      const pais = allPaises[inc.country_code];
      const icon = TYPE_ICON[inc.type] || '📌';
      const countryName = lang === 'en'
        ? (NOMBRES_EN[inc.country_code] || pais?.nombre || inc.country_code)
        : (pais?.nombre || inc.country_code);
      const sevLabel = sev[inc.severity] || inc.severity;
      lines.push(`${icon} *${countryName}* ${t.separator} ${sevLabel}`);
    }
    lines.push('');
  }

  if (issue.destinationSpotlight) {
    const d = issue.destinationSpotlight;
    lines.push(`*🌟 ${t.destinationSpotlight}:* ${d.name}`);
    lines.push(`IRV ${d.irv}/100 ${t.separator} ${d.safetyLabel}`);
    lines.push('');

    const firstProfile = d.whoIsItFor?.[0];
    if (firstProfile) {
      lines.push(`*${t.forWhom}:* ${firstProfile.profile} — ${firstProfile.verdict}`);
      lines.push('');
    }
  }

  if (issue.weeklyQuestion) {
    lines.push(`*❓ ${t.weeklyQuestion}:*`);
    lines.push(issue.weeklyQuestion.answer.length > 200
      ? issue.weeklyQuestion.answer.substring(0, 200) + '…'
      : issue.weeklyQuestion.answer
    );
    lines.push('');
  }

  lines.push('🔗 viajeinteligencia.com');
  lines.push(t.botMention);
  lines.push('');
  lines.push(t.hashtags);

  const full = lines.join('\n');

  const shortLabels = lang === 'en'
    ? { alerts: 'alerts', changes: 'changes', stable: 'stable', incidents: 'Incidents', destination: 'Destination' }
    : { alerts: 'alertas', changes: 'cambios', stable: 'estables', incidents: 'Incidentes', destination: 'Destino' };

  const shortLines: string[] = [];
  shortLines.push(`📬 Briefing #${issue.edition}`);
  const sa = issue.countryAlerts.filter(a => a.type === 'alert').length;
  const sc = issue.irvChanges;
  if (sa > 0 || sc > 0) {
    shortLines.push(`🔴 ${sa} ${shortLabels.alerts} ${t.separator} 🔄 ${sc} ${shortLabels.changes} ${t.separator} 🟢 ${issue.stableCountries} ${shortLabels.stable}`);
  }
  if (issue.recentIncidents.length > 0) {
    const incs = issue.recentIncidents.slice(0, 2).map(i => {
      const p = allPaises[i.country_code];
      return `${p?.nombre || i.country_code} (${sev[i.severity] || i.severity})`;
    });
    shortLines.push(`📱 ${shortLabels.incidents}: ${incs.join(', ')}`);
  }
  if (issue.destinationSpotlight) {
    shortLines.push(`🌟 ${shortLabels.destination}: ${issue.destinationSpotlight.name}`);
  }
  shortLines.push('🔗 viajeinteligencia.com');

  const short = shortLines.join(` ${t.separator} `);

  const mastodonThread: string[] = [];
  const mastodonTitle = lang === 'en' ? 'Weekly Briefing' : 'Briefing Semanal';
  const mastodonAlerts = lang === 'en' ? 'alerts' : 'alertas';
  const mastodonChanges = lang === 'en' ? 'changes' : 'cambios';
  const mastodonStable = lang === 'en' ? 'stable' : 'estables';
  const mastodonDestination = lang === 'en' ? 'Destination' : 'Destino';
  const mastodonNoAlerts = lang === 'en' ? 'No featured alerts' : 'Sin alertas destacadas';
  const mastodonHashtags = lang === 'en'
    ? '#TravelIntelligence #TravelRisk #TravelSecurity'
    : '#ViajeInteligente #TravelRisk #TravelSecurity';

  const mastodonRaw = `📬 ${mastodonTitle} #${issue.edition} — ${issue.weekDate}

📊 ${issue.countryAlerts.filter(a => a.type === 'alert').length} ${mastodonAlerts} ${t.separator} ${issue.irvChanges} ${mastodonChanges} ${t.separator} ${issue.stableCountries} ${mastodonStable}

${topAlerts.length > 0 ? topAlerts.map(a => `• ${a.country_name}: ${a.title}`).join('\n') + '\n\n' : ''}${issue.destinationSpotlight ? `🌟 ${mastodonDestination}: ${issue.destinationSpotlight.name}\n\n` : ''}🔗 https://viajeinteligencia.com

${mastodonHashtags}`;

  const chars = mastodonRaw.length;
  if (chars <= MAX_MASTODON_LENGTH) {
    mastodonThread.push(mastodonRaw);
  } else {
    const intro = `📬 ${mastodonTitle} #${issue.edition} — ${issue.weekDate}`;
    const statsLine = `📊 ${issue.countryAlerts.filter(a => a.type === 'alert').length} ${mastodonAlerts} ${t.separator} ${issue.irvChanges} ${mastodonChanges}`;
    mastodonThread.push(`${intro}\n\n${statsLine}\n\n${topAlerts.length > 0 ? topAlerts.map(a => `• ${a.country_name}: ${a.title}`).join('\n') : mastodonNoAlerts}\n\n🧵 ${lang === 'en' ? 'Follow...' : 'Sigue...'}`);
    mastodonThread.push(`${issue.destinationSpotlight ? `🌟 ${mastodonDestination}: ${issue.destinationSpotlight.name}\n\n` : ''}${issue.weeklyQuestion ? `❓ ${issue.weeklyQuestion.answer.substring(0, 150)}…\n\n` : ''}🔗 https://viajeinteligencia.com\n\n${mastodonHashtags}`);
  }

  return { full, short, mastodonThread, lang };
}

const TG_SEPARATOR = '\n━━━━━━━━━━━━━\n\n';

export async function publishToTelegramChannel(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    log.warn('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID — skipping');
    return false;
  }

  try {
    const full = TG_SEPARATOR + text;
    const chunks: string[] = [];
    if (full.length <= MAX_TG_LENGTH) {
      chunks.push(full);
    } else {
      const parts = full.split('\n\n');
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
            disable_web_page_preview: true,
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

export async function publishToMastodon(text: string, lang: 'es' | 'en' = 'es'): Promise<boolean> {
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
          'Idempotency-Key': `newsletter-${Date.now()}-${lang}`,
        },
        body: JSON.stringify({
          status: text,
          visibility: 'public',
          language: lang,
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

export async function publishToBlueSky(text: string, lang: 'es' | 'en' = 'es'): Promise<boolean> {
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
            langs: [lang],
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
