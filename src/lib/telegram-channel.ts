import { paisesData } from '@/data/paises';

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
    console.error('[Telegram] Missing BOT_TOKEN or CHANNEL_ID');
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
      console.error('[Telegram API ERROR]', result);
      return false;
    }

    return true;

  } catch (error) {
    console.error('[Telegram] Network error:', error);
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
   SUBSCRIPTIONS (placeholder)
========================= */

export async function subscribeUser(chatId: number, username?: string): Promise<boolean> {
  console.log(`[Subscription] ${chatId} (@${username || 'unknown'})`);
  return true;
}

export async function unsubscribeUser(chatId: number): Promise<boolean> {
  console.log(`[Unsubscribe] ${chatId}`);
  return true;
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
