import { paisesData, getPaisPorCodigo, getLabelRiesgo } from '@/data/paises';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

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

export function getCountryKeyboard() {
  const countries = Object.values(paisesData).slice(0, 16);
  const keyboard: { text: string }[][] = [];
  
  for (let i = 0; i < countries.length; i += 2) {
    const row: { text: string }[] = [];
    // Show country code + first 6 letters of name
    row.push({ text: `${countries[i].codigo.toUpperCase()}` });
    if (countries[i + 1]) {
      row.push({ text: `${countries[i + 1].codigo.toUpperCase()}` });
    }
    keyboard.push(row);
  }
  
  // Add row with example full names
  keyboard.push([{ text: 'ES - España' }, { text: 'FR - Francia' }]);
  keyboard.push([{ text: 'DE - Alemania' }, { text: 'IT - Italia' }]);
  keyboard.push([{ text: '« Volver' }]);
  
  return {
    reply_markup: {
      keyboard,
      resize_keyboard: true,
    },
  };
}

export function formatCountryInfo(codigo: string): string {
  const pais = getPaisPorCodigo(codigo);
  if (!pais) return 'País no encontrado.';
  
  const nivelRiesgoEmoji = {
    'sin-riesgo': '🟢',
    'bajo': '🟡',
    'medio': '🟠',
    'alto': '🔴',
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
  message += `🚗 *Conducción:* ${pais.conduccion === 'derecha' ? 'Derecha ↱' : 'Izquierda ↰'}\n`;
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

export function getAlertasRiesgo(): string {
  const allCountries = Object.values(paisesData);
  const sinRiesgo = allCountries.filter(p => p.nivelRiesgo === 'sin-riesgo');
  const riesgoBajo = allCountries.filter(p => p.nivelRiesgo === 'bajo');
  const riesgoMedio = allCountries.filter(p => p.nivelRiesgo === 'medio');
  const riesgoAlto = allCountries.filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto');
  
  const total = allCountries.length;
  const fechaActual = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  let message = `*⚠️ Riesgos de Viaje - ${total} países*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 Actualizado: ${fechaActual}\n`;
  message += `📊 Fuente: MAEC - Ministerio Asuntos Exteriores\n`;
  message += `🔗 viaje-con-inteligencia.vercel.app\n\n`;
  
  message += `🟢 *Sin riesgo* (${sinRiesgo.length}):\n`;
  if (sinRiesgo.length > 0) {
    message += sinRiesgo.slice(0, 15).map(p => `  ${p.bandera} ${p.nombre}`).join('\n');
    if (sinRiesgo.length > 15) message += `\n  → y ${sinRiesgo.length - 15} más`;
  } else {
    message += `  Ninguno`;
  }
  message += `\n\n`;
  
  message += `🟡 *Riesgo bajo* (${riesgoBajo.length}):\n`;
  if (riesgoBajo.length > 0) {
    message += riesgoBajo.slice(0, 15).map(p => `  ${p.bandera} ${p.nombre}`).join('\n');
    if (riesgoBajo.length > 15) message += `\n  → y ${riesgoBajo.length - 15} más`;
  } else {
    message += `  Ninguno`;
  }
  message += `\n\n`;
  
  message += `🟠 *Riesgo medio* (${riesgoMedio.length}):\n`;
  if (riesgoMedio.length > 0) {
    message += riesgoMedio.slice(0, 15).map(p => `  ${p.bandera} ${p.nombre}`).join('\n');
    if (riesgoMedio.length > 15) message += `\n  → y ${riesgoMedio.length - 15} más`;
  } else {
    message += `  Ninguno`;
  }
  message += `\n\n`;
  
  if (riesgoAlto.length > 0) {
    message += `🔴 *Riesgo alto/muy alto* (${riesgoAlto.length}):\n`;
    message += riesgoAlto.slice(0, 15).map(p => `  ${p.bandera} ${p.nombre}`).join('\n');
    if (riesgoAlto.length > 15) message += `\n  → y ${riesgoAlto.length - 15} más`;
  }
  
  message += `\n\n💡 *Usa* /alertas *para más detalle*\n`;
  message += `🔔 *Usa* /buscar *[país]* *para ver un país específico*\n`;
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 Última actualización: ${fechaActual}`;
  
  return message;
}

export function getTipoCambioInfo(): string {
  let message = `*🏦 Tipos de Cambio*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  const sampleCountries = ['fr', 'us', 'gb', 'jp', 'mx', 'br', 'cn', 'ma'];
  
  sampleCountries.forEach(codigo => {
    const pais = getPaisPorCodigo(codigo);
    if (pais) {
      message += `${pais.bandera} *${pais.nombre}:* ${pais.tipoCambio}\n`;
      message += `   💹 IPC: ${pais.indicadores.ipc} | Precio: ${pais.indicadores.indicePrecios}\n\n`;
    }
  });
  
  message += `_Precios orientativos. Verificar en tu entidad._`;
  
  return message;
}

export function getChecklistPreview(): string {
  let message = `*📋 Checklist de Viaje*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `*GRATIS:*\n`;
  message += `✅ Lista básica de documentos\n`;
  message += `✅ Nivel de riesgo por país\n`;
  message += `✅ Consejos generales\n\n`;
  
  message += `*⭐ PREMIUM:*\n`;
  message += `✅ Checklist completo imprimible\n`;
  message += `✅ IA personalizada para tu viaje\n`;
  message += `✅ Alertas en tiempo real\n`;
  message += `✅ Itinerario inteligente\n`;
  message += `✅ Análisis de gastos\n\n`;
  
  message += `_Usa /premium para más info_`;
  
  return message;
}

export function getPremiumInfo(): string {
  let message = `*⭐ Viaje con Inteligencia PREMIUM*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  message += `*Planes disponibles:*\n\n`;
  
  message += `*Mensual (4.99€/mes):*\n`;
  message += `• 🤖 Chat IA Groq\n`;
  message += `• 📊 Análisis profundo\n`;
  message += `• ⚡ Alertas tiempo real\n`;
  message += `• 📋 Checklist completo\n`;
  message += `• 🗺️ Itinerario IA\n`;
  message += `• 📱 Notificaciones Telegram\n\n`;
  
  message += `*Anual (19.99€/año):*\n`;
  message += `• Todo lo anterior\n`;
  message += `• 🎫 Acceso prioritario\n`;
  message += `• 💰 Ahorra 60%\n\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🔗 * WEB:* https://viaje-con-inteligencia.vercel.app/premium\n\n`;
  
  message += `💡 *Acceder:* Envía /start login para vincular tu cuenta o crea una en la web.\n\n`;
  
  message += `_Usa /start para volver al menú_`;
  
  return message;
}

export function searchCountry(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  const pais = Object.values(paisesData).find(p => 
    p.nombre.toLowerCase().includes(normalizedQuery) ||
    p.capital.toLowerCase().includes(normalizedQuery) ||
    p.codigo.toLowerCase() === normalizedQuery
  );
  
  if (pais) {
    return formatCountryInfo(pais.codigo);
  }
  
  const matches = Object.values(paisesData).filter(p =>
    p.nombre.toLowerCase().includes(normalizedQuery) ||
    p.capital.toLowerCase().includes(normalizedQuery)
  );
  
  if (matches.length > 0) {
    let message = `*🔍 Resultados para "${query}":*\n\n`;
    matches.slice(0, 5).forEach(p => {
      message += `${p.bandera} ${p.nombre} (${p.capital})\n`;
    });
    if (matches.length > 5) {
      message += `\n... y ${matches.length - 5} más`;
    }
    return message;
  }
  
  return null;
}

export async function getWeatherForCountry(codigo: string): Promise<string | null> {
  const pais = getPaisPorCodigo(codigo);
  if (!pais) return null;
  
  const coords = pais.mapaCoordenadas;
  try {
    const res = await fetch(
      `${OPEN_METEO_API}?latitude=${coords[0]}&longitude=${coords[1]}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    const data = await res.json();
    
    const temp = data.current?.temperature_2m;
    const wind = data.current?.wind_speed_10m;
    const code = data.current?.weather_code;
    
    const weatherEmoji: Record<string, string> = {
      '0': '☀️', '1': '🌤️', '2': '⛅', '3': '☁️',
      '45': '🌫️', '48': '🌫️', '51': '🌧️', '53': '🌧️', '55': '🌧️',
      '61': '🌧️', '63': '🌧️', '65': '🌧️', '71': '🌨️', '73': '🌨️', '75': '🌨️',
      '80': '🌧️', '81': '🌧️', '82': '🌧️', '95': '⛈️', '96': '⛈️', '99': '⛈️'
    };
    
    const emoji = weatherEmoji[code?.toString()] || '🌡️';
    
    return `${emoji} *Clima actual:*\n• Temperatura: ${temp}°C\n• Viento: ${wind} km/h\n• ${pais.capital}`;
  } catch {
    return null;
  }
}
