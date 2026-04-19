import { paisesData, getPaisPorCodigo, getLabelRiesgo } from '@/data/paises';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

/* =========================
   USER STATE
========================= */

interface UserState {
  step: 'initial' | 'selecting_country' | 'viewing_country' | 'ai_chat';
  selectedCountry?: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

const userStates: Record<number, UserState> = {};

export function getUserState(chatId: number): UserState {
  return userStates[chatId] || { step: 'initial', chatHistory: [] };
}

export function setUserState(chatId: number, state: UserState): void {
  userStates[chatId] = state;
}

export function resetUserState(chatId: number): void {
  delete userStates[chatId];
}

/* =========================
   MAIN MENU
========================= */

export function getMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '🌍 Buscar país' }],
        [{ text: '🌤️ Clima' }, { text: '🤖 Chat IA' }],
        [{ text: '⚠️ Alertas de riesgo' }, { text: '🏦 Tipo cambio' }],
        [{ text: '📋 Checklist viaje' }],
        [{ text: '⭐ Premium' }],
      ],
      resize_keyboard: true,
    },
  };
}

/* =========================
   REGULAR COUNTRY KEYBOARD ( ReplyKeyboard)
========================= */

export function getCountryKeyboard() {
  const countries = Object.values(paisesData).slice(0, 58);
  const keyboard = [];

  for (let i = 0; i < countries.length; i += 3) {
    const row = [];
    for (let j = 0; j < 3 && i + j < countries.length; j++) {
      const c = countries[i + j];
      row.push({ text: `${c.bandera} ${c.codigo.toUpperCase()}` });
    }
    if (row.length > 0) keyboard.push(row);
  }

  keyboard.push([
    { text: '« Volver' },
  ]);

  return {
    reply_markup: {
      keyboard,
      resize_keyboard: true,
    },
  };
}

/* =========================
   INLINE COUNTRY SELECTOR
========================= */

export function getCountryKeyboardInline() {
  const countries = Object.values(paisesData).slice(0, 20);
  const inline_keyboard = [];

  for (let i = 0; i < countries.length; i += 2) {
    const row = [];

    const c1 = countries[i];
    row.push({
      text: `${c1.bandera} ${c1.codigo.toUpperCase()}`,
      callback_data: JSON.stringify({
        action: 'select_country',
        code: c1.codigo,
      }),
    });

    if (countries[i + 1]) {
      const c2 = countries[i + 1];
      row.push({
        text: `${c2.bandera} ${c2.codigo.toUpperCase()}`,
        callback_data: JSON.stringify({
          action: 'select_country',
          code: c2.codigo,
        }),
      });
    }

    inline_keyboard.push(row);
  }

  inline_keyboard.push([
    {
      text: '⬅️ Volver',
      callback_data: JSON.stringify({ action: 'back' }),
    },
  ]);

  return {
    reply_markup: {
      inline_keyboard,
    },
  };
}

/* =========================
   HANDLE CALLBACKS
========================= */

export async function handleCallback(bot: any, query: any) {
  const chatId = query.message.chat.id;

  let data;
  try {
    data = JSON.parse(query.data);
  } catch {
    return;
  }

  if (data.action === 'select_country') {
    const state = getUserState(chatId);

    setUserState(chatId, {
      ...state,
      step: 'viewing_country',
      selectedCountry: data.code,
    });

    await bot.answerCallbackQuery(query.id);

    await bot.sendMessage(chatId, formatCountryInfo(data.code), {
      parse_mode: 'Markdown',
    });
  }

  if (data.action === 'back') {
    resetUserState(chatId);

    await bot.answerCallbackQuery(query.id);

    await bot.sendMessage(chatId, 'Menú principal', getMainKeyboard());
  }
}

/* =========================
   COUNTRY INFO
========================= */

export function formatCountryInfo(codigo: string): string {
  const pais = getPaisPorCodigo(codigo);
  if (!pais) return 'País no encontrado.';

  const nivelRiesgoEmoji = {
    'sin-riesgo': '🟢',
    bajo: '🟡',
    medio: '🟠',
    alto: '🔴',
    'muy-alto': '⚫',
  };

  const riesgoEmoji = nivelRiesgoEmoji[pais.nivelRiesgo];
  const riesgoLabel = getLabelRiesgo(pais.nivelRiesgo);

  let message = `*${pais.bandera} ${pais.nombre}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📍 *Capital:* ${pais.capital}\n`;
  message += `${riesgoEmoji} *Nivel riesgo:* ${riesgoLabel}\n`;
  message += `💰 *Moneda:* ${pais.moneda}\n`;
  message += `💱 *Cambio:* ${pais.tipoCambio}\n`;
  message += `🗣️ *Idioma:* ${pais.idioma}\n`;
  message += `🔌 *Voltaje:* ${pais.voltaje}\n`;
  message += `🚗 *Conducción:* ${
    pais.conduccion === 'derecha' ? 'Derecha ↱' : 'Izquierda ↰'
  }\n`;
  message += `⏰ *Zona horaria:* ${pais.zonaHoraria}\n\n`;

  if (pais.contactos.length > 0) {
    message += `🏛️ *Embajada España:*\n`;
    message += `📍 ${pais.contactos[0].direccion}\n`;
    message += `📞 ${pais.contactos[0].telefono}\n\n`;
  }

  message += `📝 *Requisitos:*\n`;
  if (pais.requerimientos[0]) {
    pais.requerimientos[0].items.slice(0, 3).forEach(item => {
      message += `• ${item}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔗 *Más info:* /pais_${pais.codigo}`;
  message += `\n🌐 [Ver en web](https://viaje-con-inteligencia.vercel.app/pais/${pais.codigo})`;

  return message;
}

/* =========================
   ALERTAS
========================= */

export function getAlertasRiesgo(): string {
  const allCountries = Object.values(paisesData);

  const riesgoAlto = allCountries.filter(
    p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto'
  );

  let message = `*⚠️ Riesgos de Viaje*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (riesgoAlto.length > 0) {
    message += `🔴 *Riesgo alto/muy alto:*\n`;
    message += riesgoAlto
      .slice(0, 15)
      .map(p => `${p.bandera} ${p.nombre}`)
      .join('\n');
  }

  return message;
}

/* =========================
   BUSCADOR
========================= */

export function searchCountry(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();

  const pais = Object.values(paisesData).find(
    p =>
      p.nombre.toLowerCase().includes(normalizedQuery) ||
      p.capital.toLowerCase().includes(normalizedQuery) ||
      p.codigo.toLowerCase() === normalizedQuery
  );

  return pais ? formatCountryInfo(pais.codigo) : null;
}

/* =========================
   WEATHER
========================= */

export async function getWeatherForCountry(
  codigo: string
): Promise<string | null> {
  const pais = getPaisPorCodigo(codigo);
  if (!pais) return null;

  const coords = pais.mapaCoordenadas;

  try {
    const res = await fetch(
      `${OPEN_METEO_API}?latitude=${coords[0]}&longitude=${coords[1]}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    const data = await res.json();

    return `🌤️ *Clima en ${pais.capital}:*\n🌡️ ${data.current.temperature_2m}°C\n💨 ${data.current.wind_speed_10m} km/h`;
  } catch {
    return null;
  }
}
