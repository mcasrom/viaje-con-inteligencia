import { createLogger } from '@/lib/logger';
import { paisesData, getPaisPorCodigo, getLabelRiesgo, DatoPais } from '@/data/paises';

const log = createLogger('TelegramBot');

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

/* =========================
   USER STATE
========================= */

interface UserState {
  step: 'initial' | 'selecting_country' | 'viewing_country' | 'ai_chat' | 'subscribing_country' | 'unsubscribing_country';
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
        [{ text: '⚠️ Alertas de riesgo' }, { text: '✈️🛤️ Alertas viaje' }],
        [{ text: '📋 Checklist viaje' }, { text: '⭐ Premium' }],
      ],
      resize_keyboard: true,
    },
  };
}

export function getAlertsFullKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '✈️ Ver aeropuertos' }],
        [{ text: '🚂 Ver trenes' }],
        [{ text: '🌧️ Ver clima' }],
        [{ text: '🔄 Actualizar alertas' }],
        [{ text: '« Volver' }],
      ],
      resize_keyboard: true,
    },
  };
}

/* =========================
   REGULAR COUNTRY KEYBOARD ( ReplyKeyboard)
========================= */

export function getCountryKeyboard() {
  // Usar una copia para evitar mutaciones
  const countries = Object.values(paisesData);
  const keyboard = [];

  for (let i = 0; i < countries.length; i += 3) {
    const row = [];
    for (let j = 0; j < 3 && i + j < countries.length; j++) {
      const c = countries[i + j];
      row.push({ text: `${c.bandera} ${c.codigo.toUpperCase()}` });
    }
    if (row.length > 0) keyboard.push(row);
  }

  keyboard.push([{ text: '« Volver' }]);

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

  const nivelRiesgoEmoji: Record<string, string> = {
    'sin-riesgo': '🟢',
    bajo: '🟡',
    medio: '🟠',
    alto: '🔴',
    'muy-alto': '⚫',
  };

  const riesgoEmoji = nivelRiesgoEmoji[pais.nivelRiesgo];
  const riesgoLabel = getLabelRiesgo(pais.nivelRiesgo);

  let message = `*${pais.bandera} ${pais.nombre}* (${pais.continente})\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📍 *Capital:* ${pais.capital}\n`;
  message += `👥 *Población:* ${pais.poblacion}\n`;
  message += `${riesgoEmoji} *Nivel riesgo:* ${riesgoLabel}\n`;
  message += `💰 *Moneda:* ${pais.moneda}\n`;
  message += `💱 *Cambio:* ${pais.tipoCambio}\n`;
  message += `🗣️ *Idioma:* ${pais.idioma}\n`;
  message += `🔌 *Voltaje:* ${pais.voltaje}\n`;
  message += `🚗 *Conducción:* ${
    pais.conduccion === 'derecha' ? 'Derecha ↱' : 'Izquierda ↰'
  }\n`;
  message += `⏰ *Zona horaria:* ${pais.zonaHoraria}\n`;

  if (pais.contactos && pais.contactos.length > 0) {
    message += `\n🏛️ *Embajada de España:*\n`;
    message += `📍 ${pais.contactos[0].direccion}\n`;
    message += `📞 ${pais.contactos[0].telefono}\n`;
  }

  message += `\n📋 *Requisitos de entrada:*\n`;
  const reqItems = pais.requerimientos?.[0]?.items || [];
  if (reqItems.length > 0) {
    reqItems.slice(0, 5).forEach(item => {
      message += `• ${item}\n`;
    });
  } else {
    message += `• Pasaporte vigente\n`;
    message += `• Visado no requerido\n`;
  }

if (pais.ultimoInforme) {
    message += `\n📄 *Último informe:* ${pais.ultimoInforme}\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🕐 *Actualizado:* Abril 2026\n`;
  message += `📊 *Fuente:* MAEC - Ministerio Asuntos Exteriores\n`;
  message += `\n🔗 Más detalles: https://www.viajeinteligencia.com/pais/${pais.codigo}`;

  return message;
}

/* =========================
   ALERTAS
========================= */

export function getAlertasRiesgo(): string {
  const allCountries = Object.values(paisesData);

  const riesgoMuyAlto = allCountries.filter(p => p.nivelRiesgo === 'muy-alto');
  const riesgoAlto = allCountries.filter(p => p.nivelRiesgo === 'alto');
  const riesgoMedio = allCountries.filter(p => p.nivelRiesgo === 'medio');
  const riesgoBajo = allCountries.filter(p => p.nivelRiesgo === 'bajo');
  const riesgoNinguno = allCountries.filter(p => p.nivelRiesgo === 'sin-riesgo');

  let message = `*⚠️ Alertas de Viaje - MAEC*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 *Fuente:* Ministerio Asuntos Exteriores\n`;
  message += `🕐 *Actualizado:* Abril 2026\n\n`;

  if (riesgoMuyAlto.length > 0) {
    message += `⚫ *Riesgo MUY ALTO (${riesgoMuyAlto.length}):*\n`;
    message += riesgoMuyAlto.map(p => `${p.bandera} ${p.nombre}`).join('\n');
    message += `\n\n`;
  }

  if (riesgoAlto.length > 0) {
    message += `🔴 *Riesgo ALTO (${riesgoAlto.length}):*\n`;
    message += riesgoAlto.map(p => `${p.bandera} ${p.nombre}`).join('\n');
    message += `\n\n`;
  }

  if (riesgoMedio.length > 0) {
    message += `🟠 *Riesgo MEDIO (${riesgoMedio.length}):*\n`;
    message += riesgoMedio.slice(0, 10).map(p => `${p.bandera} ${p.nombre}`).join('\n');
    if (riesgoMedio.length > 10) message += `\n...y otros ${riesgoMedio.length - 10}`;
    message += `\n\n`;
  }

  message += `🟢 *Países seguros:* ${riesgoBajo.length + riesgoNinguno.length}`;
  message += `\n\n🔗 Consultar: https://www.viajeinteligencia.com/pais/[código]`;

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

/* =========================
   TIPO CAMBIO
========================= */

export function getTipoCambioInfo(): string {
  const rates = {
    EUR: '1 EUR = 1.08 USD, 0.85 GBP, 162 JPY, 1.65 AUD, 1.47 CAD, 5.4 BRL',
    USD: '1 USD = 0.93 EUR, 0.78 GBP, 150 JPY, 1.53 AUD, 1.36 CAD, 5.0 BRL',
    GBP: '1 GBP = 1.18 EUR, 1.27 USD, 189 JPY',
    AUD: '1 AUD = 0.61 EUR, 0.65 USD, 99 JPY',
    CAD: '1 CAD = 0.68 EUR, 0.74 USD, 102 JPY',
    BRL: '1 BRL = 0.19 EUR, 0.20 USD, 27 JPY',
  };

  let message = `*🏦 Tipos de Cambio (orientativos)*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💱 *Principales:*\n\n`;
  message += `🇪🇺 EUR: ${rates.EUR}\n`;
  message += `🇺🇸 USD: ${rates.USD}\n`;
  message += `🇬🇧 GBP: ${rates.GBP}\n`;
  message += `🇦🇺 AUD: ${rates.AUD}\n`;
  message += `🇨🇦 CAD: ${rates.CAD}\n`;
  message += `🇧🇷 BRL: ${rates.BRL}\n\n`;
  message += `_💡 Usa: /cambio 100 EUR USD_`;
  return message;
}

/* =========================
   CHECKLIST PREVIEW
========================= */

export function getChecklistPreview(): string {
  const categories = {
    '📄 Documentos': [
      'Pasaporte (6+ meses de validez)',
      'Visado (si aplica)',
      'Billetes avion',
      'Reserva hotel',
      'Seguro de viaje',
      'Tarjeta sanitaria europea',
    ],
    '💰 Dinero': [
      'Efectivo (moneda local)',
      'Tarjetas credito/debito',
      'Confirmar roaming',
    ],
    '🔌 Tecnologia': [
      'Cargador mobile',
      'Adaptador enchufe',
      'Powerbank',
    ],
    '🧳 Equipaje': [
      'Ropa adecuada clima',
      'Medicamentos',
      'Primera necesidad',
    ],
  };

  let message = `*📋 Checklist de Viaje*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const [cat, items] of Object.entries(categories)) {
    message += `${cat}:\n`;
    items.forEach(item => {
      message += `✅ ${item}\n`;
    });
    message += `\n`;
  }

  message += `🔗 Ver completo: https://www.viajeinteligencia.com/checklist`;
  return message;
}

/* =========================
   PREMIUM INFO
 ========================= */

export function getPremiumInfo(): string {
  let message = `*⭐ Viaje con Inteligencia PRO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*Gratis:* Mapa riesgos, detalles países, checklist\n\n`;
  message += `*PRO (4.99€/mes):*\n`;
  message += `• Chat IA ilimitado\n`;
  message += `• Itinerarios IA\n`;
  message += `• Predicción riesgos\n`;
  message += `• Alertas push\n`;
  message += `• Historial guardado\n\n`;
  message += `🔗 https://www.viajeinteligencia.com/premium`;
  return message;
}

/* =========================
   TRAVEL ALERTS
 ========================= */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com';

export async function getTravelAlertsSummary(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/travel?type=summary`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    log.error('Error fetching travel alerts summary', e);
    return null;
  }
}

export async function getTravelAlertsAll(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/travel?type=all`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    log.error('Error fetching travel alerts all', e);
    return null;
  }
}

export function formatTravelAlertsShort(data: any): string {
  if (!data?.summary) return 'No hay datos de alertas disponibles.';
  
  const { summary, grouped } = data;
  const emoji = summary.critical > 0 ? '🔴' : summary.warning > 0 ? '⚠️' : '✅';
  
  let msg = `${emoji} *Alertas de Viaje*\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `Total: ${summary.total} | 🔴${summary.critical} | ⚠️${summary.warning} | 🟢${summary.ok}\n\n`;
  
  if (summary.critical > 0) {
    msg += `*CRÍTICAS:*\n`;
  }
  if (summary.warning > 0) {
    msg += `*AVISOS:*\n`;
  }
  
  msg += `\n🔗 /alertas - Ver detalle`;
  return msg;
}

export function formatTravelAlertsDetailed(data: any): string {
  if (!data?.summary) return 'No hay datos de alertas disponibles.';
  
  const { summary, allAlerts } = data;
  const critical = (allAlerts || []).filter((a: any) => a.status === 'critical' || a.level === 'critical');
  const warning = (allAlerts || []).filter((a: any) => a.status === 'warning' || a.level === 'warning');
  
  let msg = `✈️🚂🌧️ *Alertas de Viaje*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 Resumen: ${summary.total} total | 🔴${summary.critical} | ⚠️${summary.warning} | 🟢${summary.ok}\n\n`;
  
  if (critical.length > 0) {
    msg += `*🔴 CRÍTICAS:*\n`;
    critical.slice(0, 5).forEach((a: any) => {
      const name = a.name || a.code || a.location || 'N/A';
      const delay = a.delay || a.delayMin || '-';
      msg += `• ${name}: ${delay}min\n`;
    });
    msg += `\n`;
  }
  
  if (warning.length > 0) {
    msg += `*⚠️ AVISOS:*\n`;
    warning.slice(0, 10).forEach((a: any) => {
      const name = a.name || a.code || a.location || 'N/A';
      const delay = a.delay || a.delayMin || '-';
      const type = a.type || 'viaje';
      const icon = type === 'airport' ? '✈️' : type === 'train' ? '🚂' : '🌧️';
      msg += `${icon} ${name}: ${delay}min\n`;
    });
  }
  
  if (critical.length === 0 && warning.length === 0) {
    msg += `✅ *Sin alertas activas*\n`;
    msg += `Todo fluida en aeropuertos, trenes y meteorología.\n`;
  }
  
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔗 ${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/alertas`;
  return msg;
}

export function getAlertsKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '✈️ Ver aeropuertos' }],
        [{ text: '🚂 Ver trenes' }],
        [{ text: '🌧️ Ver clima' }],
        [{ text: '🔄 Actualizar alertas' }],
        [{ text: '« Volver' }],
      ],
      resize_keyboard: true,
    },
  };
}

/* =========================
   SUBSCRIPTION HELPERS
========================= */

export function getSubscriptionKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '➕ Suscribirse a país' }],
        [{ text: '📋 Mis alertas' }],
        [{ text: '❌ Cancelar suscripción' }],
        [{ text: '🗑️ Cancelar todas' }],
        [{ text: '« Volver' }],
      ],
      resize_keyboard: true,
    },
  };
}

export function formatSubscriptionsList(subscriptions: any[]): string {
  if (!subscriptions || subscriptions.length === 0) {
    return '🔔 *No tienes alertas activas*\n\nUsa /suscribir para añadir alertas por país.';
  }

  let msg = `🔔 *Tus Alertas (${subscriptions.length})*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const sub of subscriptions) {
    const country = getPaisPorCodigo(sub.country_code);
    const flag = country?.bandera || '🌍';
    const name = country?.nombre || sub.country_code.toUpperCase();
    const types = sub.alert_types || [];
    const severity = sub.severity_min || 'medium';
    const sevEmoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢';

    msg += `${flag} *${name}* (${sub.country_code})\n`;
    msg += `${sevEmoji} Severidad mín: ${severity}\n`;
    msg += `📂 Tipos: ${types.join(', ')}\n\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💡 Recibirás alertas cuando se detecten incidentes que coincidan con tus suscripciones.`;

  return msg;
}
