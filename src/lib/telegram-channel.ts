import { paisesData } from '@/data/paises';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

interface AlertMessage {
  title: string;
  body: string;
  type: 'riesgo' | 'info' | 'premium';
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('[Telegram] Bot token not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    return false;
  }
}

export async function broadcastAlert(alert: AlertMessage): Promise<boolean> {
  const emoji = {
    riesgo: '⚠️',
    info: 'ℹ️',
    premium: '⭐',
  };

  const message = `${emoji[alert.type]} *${alert.title}*\n\n${alert.body}\n\n_Source: Viaje con Inteligencia_`;

  return sendTelegramMessage(message);
}

export async function sendRiskUpdate(): Promise<boolean> {
  const sinRiesgo = Object.values(paisesData).filter(p => p.nivelRiesgo === 'sin-riesgo');
  const riesgoBajo = Object.values(paisesData).filter(p => p.nivelRiesgo === 'bajo');

  const message = `🔄 *Actualización de Riesgos - ${new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}*\n\n` +
  `📊 *Resumen Global:*\n` +
  `• 🟢 Sin riesgo: ${sinRiesgo.length} países\n` +
  `• 🟡 Riesgo bajo: ${riesgoBajo.length} países\n\n` +
  `Verifica siempre la info en @ViajeConInteligenciaBot`;

  return sendTelegramMessage(message);
}

export async function sendCountryAlert(countryCode: string): Promise<boolean> {
  const pais = paisesData[countryCode];
  if (!pais) return false;

  const nivelRiesgoEmoji = {
    'sin-riesgo': '🟢',
    'bajo': '🟡',
    'medio': '🟠',
    'alto': '🔴',
    'muy-alto': '⚫',
  };

  const riesgoEmoji = nivelRiesgoEmoji[pais.nivelRiesgo];

  const message = `${riesgoEmoji} *ALERTA: ${pais.nombre}*\n\n` +
  `Nivel de riesgo: ${riesgoEmoji} ${pais.nivelRiesgo.replace('-', ' ').toUpperCase()}\n` +
  `Capital: ${pais.capital}\n` +
  `Moneda: ${pais.moneda}\n\n` +
  `Más info: /pais_${pais.codigo}`;

  return sendTelegramMessage(message);
}

export async function subscribeUser(chatId: number, username?: string): Promise<boolean> {
  console.log(`[Subscription] New user: ${chatId} (@${username || 'unknown'})`);
  return true;
}

export async function unsubscribeUser(chatId: number): Promise<boolean> {
  console.log(`[Subscription] User unsubscribed: ${chatId}`);
  return true;
}

export async function getBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    return { error: 'Bot token not configured' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    return response.json();
  } catch {
    return { error: 'Failed to get bot info' };
  }
}

export async function getChannelInfo() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return { error: 'Channel ID not configured' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHANNEL_ID}`);
    return response.json();
  } catch {
    return { error: 'Failed to get channel info' };
  }
}
