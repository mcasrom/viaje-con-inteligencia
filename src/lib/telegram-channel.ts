import { createLogger } from '@/lib/logger';
import { paisesData } from '@/data/paises';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';

const log = createLogger('TelegramChannel');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

/* =========================
   TYPES
========================= */

interface AlertMessage {
  title: string;
  body: string;
  type: 'riesgo' | 'info' | 'premium';
}

/* =========================
   UTILS
========================= */

function escapeMD(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/* =========================
   CORE SEND
========================= */

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    log.error('Missing BOT_TOKEN or CHANNEL_ID');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          text: escapeMD(text),
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      log.error('Telegram API error', result);
      return false;
    }

    return true;

  } catch (error) {
    log.error('Network error', error);
    return false;
  }
}

/* =========================
   BROADCAST
========================= */

export async function broadcastAlert(alert: AlertMessage): Promise<boolean> {
  const emoji = {
    riesgo: '⚠️',
    info: 'ℹ️',
    premium: '⭐',
  };

  const message =
    `${emoji[alert.type]} ${alert.title}\n\n` +
    `${alert.body}\n\n` +
    `Source: Viaje con Inteligencia`;

  return sendTelegramMessage(message);
}

/* =========================
   RISK SUMMARY
========================= */

export async function sendRiskUpdate(): Promise<boolean> {
  const all = Object.values(paisesData);

  const sinRiesgo = all.filter(p => p.nivelRiesgo === 'sin-riesgo');
  const bajo = all.filter(p => p.nivelRiesgo === 'bajo');

  const date = new Date().toLocaleDateString('es-ES');

  const message =
    `🔄 Actualización de Riesgos (${date})\n\n` +
    `🟢 Sin riesgo: ${sinRiesgo.length}\n` +
    `🟡 Riesgo bajo: ${bajo.length}\n\n` +
    `Bot: @ViajeConInteligenciaBot`;

  return sendTelegramMessage(message);
}

/* =========================
   COUNTRY ALERT
========================= */

export async function sendCountryAlert(countryCode: string): Promise<boolean> {
  const pais = paisesData[countryCode];
  if (!pais) return false;

  const emojiMap = {
    'sin-riesgo': '🟢',
    bajo: '🟡',
    medio: '🟠',
    alto: '🔴',
    'muy-alto': '⚫',
  };

  const emoji = emojiMap[pais.nivelRiesgo];

  const message =
    `${emoji} ALERTA: ${pais.nombre}\n\n` +
    `Riesgo: ${pais.nivelRiesgo}\n` +
    `Capital: ${pais.capital}\n` +
    `Moneda: ${pais.moneda}\n\n` +
    `https://www.viajeinteligencia.com/pais/${pais.codigo}`;

  return sendTelegramMessage(message);
}

/* =========================
   SUBSCRIPTIONS (DB-backed)
========================= */

interface SubscriptionParams {
  chatId: number;
  username?: string;
  countryCode: string;
  alertTypes?: string[];
  severityMin?: string;
}

export async function subscribeToCountry(params: SubscriptionParams): Promise<{ success: boolean; error?: string }> {
  const { chatId, username, countryCode, alertTypes, severityMin } = params;

  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Supabase no configurado' };
  }

  const country = countryCode.toUpperCase();

  try {
    await supabaseAdmin.from('alert_preferences')
      .delete()
      .eq('telegram_chat_id', chatId)
      .eq('country_code', country);

    const { error } = await supabaseAdmin.from('alert_preferences').insert({
      telegram_chat_id: chatId,
      telegram_username: username || null,
      country_code: country,
      alert_types: alertTypes || ['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
      severity_min: severityMin || 'medium',
      frequency: 'inmediato',
    });

    if (error) {
      log.error('Subscribe error', error);
      return { success: false, error: error.message };
    }

    log.info(`Subscribed ${chatId} (@${username || 'unknown'}) to ${country}`);
    return { success: true };
  } catch (e: any) {
    log.error('Subscribe exception', e);
    return { success: false, error: e.message };
  }
}

export async function unsubscribeFromCountry(
  chatId: number,
  countryCode: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('alert_preferences')
      .delete()
      .eq('telegram_chat_id', chatId)
      .eq('country_code', countryCode.toUpperCase());

    if (error) {
      return { success: false, error: error.message };
    }

    log.info(`Unsubscribed ${chatId} from ${countryCode}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function unsubscribeAll(chatId: number): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Supabase no configurado' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('alert_preferences')
      .delete()
      .eq('telegram_chat_id', chatId);

    if (error) {
      return { success: false, error: error.message };
    }

    log.info(`Unsubscribed ${chatId} from all`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getMySubscriptions(chatId: number): Promise<{
  subscriptions: any[];
  error?: string;
}> {
  if (!isSupabaseAdminConfigured()) {
    return { subscriptions: [], error: 'Supabase no configurado' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('alert_preferences')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .order('created_at', { ascending: false });

    if (error) {
      return { subscriptions: [], error: error.message };
    }

    return { subscriptions: data || [] };
  } catch (e: any) {
    return { subscriptions: [], error: e.message };
  }
}

/* =========================
   DEBUG
========================= */

export async function getBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    return { error: 'Bot token missing' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    return await res.json();
  } catch {
    return { error: 'getMe failed' };
  }
}

export async function getChannelInfo() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return { error: 'Missing config' };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHANNEL_ID}`
    );
    return await res.json();
  } catch {
    return { error: 'getChat failed' };
  }
}
