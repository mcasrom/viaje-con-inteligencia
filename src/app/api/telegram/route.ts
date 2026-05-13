import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { paisesData } from '@/data/paises';
import {
  getUserState,
  setUserState,
  resetUserState,
  getMainKeyboard,
  getCountryKeyboard,
  formatCountryInfo,
  getAlertasRiesgo,
  getTipoCambioInfo,
  getChecklistPreview,
  getPremiumInfo,
  searchCountry,
  getWeatherForCountry,
  getTravelAlertsSummary,
  getTravelAlertsAll,
  formatTravelAlertsShort,
  formatTravelAlertsDetailed,
  getAlertsKeyboard,
  getAlertsFullKeyboard,
  getSubscriptionKeyboard,
  formatSubscriptionsList,
} from '@/lib/telegram-bot';
import {
  subscribeToCountry,
  unsubscribeFromCountry,
  unsubscribeAll,
  getMySubscriptions,
} from '@/lib/telegram-channel';

const log = createLogger('Telegram');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function trackStart(chatId: number, username?: string, firstName?: string) {
  if (!isSupabaseConfigured()) return;
  
  const { error } = await supabase!.from('bot_stats').upsert({
    chat_id: chatId,
    username,
    first_name: firstName,
    started_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  }, { onConflict: 'chat_id' });
  
  if (error) log.error('Track start error', error);
}

async function trackCommand(chatId: number, command: string) {
  if (!isSupabaseConfigured()) return;
  
  await supabase!.from('bot_commands').insert({
    chat_id: chatId,
    command,
  });
  
  await supabase!.from('bot_stats').update({
    last_active: new Date().toISOString(),
  }).eq('chat_id', chatId);
}

interface TelegramKeyboard {
  reply_markup?: {
    keyboard?: { text: string }[][];
    inline_keyboard?: { text: string; callback_data?: string }[][];
    resize_keyboard?: boolean;
  };
}

const translations = {
  es: {
    welcome: (name: string) => `¡Hola ${name}! 👋\n\n🌍 *Viaje con Inteligencia - Riesgo Zero*\n\nTu asistente de viaje inteligente. Consulta riesgos, requisitos y consejos para viajar seguro.\n\nSelecciona una opción:`,
    menu: () => ({
      keyboard: [
        [{ text: '🌍 Buscar país' }],
        [{ text: '🌤️ Clima' }, { text: '🤖 Chat IA' }],
        [{ text: '⚠️ Alertas de riesgo' }, { text: '✈️🛤️ Alertas viaje' }],
        [{ text: '🔔 Alertas personalizadas' }, { text: '📋 Checklist viaje' }],
        [{ text: '⭐ Premium' }],
      ],
    }),
    selectCountry: () => '🔍 *Selecciona un país*\n\n_Escribe el código (ej: ES, FR, DE) o elige de los ejemplos abajo._',
    back: () => 'Volviendo al menú principal.',
    aiIntro: () => `🤖 *Chat con IA*\n\nPregúntame lo que quieras sobre viajes, países, seguridad, recomendaciones...\n\nEjemplos:\n• "¿Es seguro viajar a Japón?"\n• "Planifica un viaje a Thailandia"\n• "¿Qué vacunas necesito para Bali?"\n\nEscribe /salir para volver al menú.`,
    aiThinking: () => '🤖 Pensando...',
    aiExit: () => 'Volviendo al menú principal.',
    notUnderstood: () => '🤖 No entendí. Usa los botones o prueba:\n• Escribe un país (ej: "Japón")\n• /help para ayuda',
    help: () => `*📚 Comandos disponibles:*

/start - Iniciar bot
/pais [nombre] - Info de un país
/clima [país] - Ver clima actual
/chat o /ia - Chat con IA
/alertas - Riesgos países (MAEC)
✈️🛤️ Alertas viaje - Vuelos/trenes/clima
/cambio - Tipos de cambio
/checklist - Preview checklist
/premium - Info premium
/lang - Cambiar idioma (EN/ES)
/help - Esta ayuda

💡 *Usa /alertasviaje para alertas de viaje!*`,
    aiNotAvailable: () => '🤖 IA no disponible. Configure GROQ_API_KEY en Vercel para activar el chat IA.',
    aiError: () => '🤖 Error de IA. Intenta de nuevo.',
    aiConnectionError: () => '🤖 Error de conexión con IA. Intenta de nuevo.',
    langChanged: (lang: string) => `✅ Idioma cambiado a ${lang === 'es' ? 'Español' : 'English'}`,
    chooseLang: () => '🌍 Selecciona tu idioma:',
  },
  en: {
    welcome: (name: string) => `Hello ${name}! 👋\n\n🌍 *Travel with Intelligence - Risk Zero*\n\nYour smart travel assistant. Check risks, requirements and tips to travel safe.\n\nSelect an option:`,
    menu: () => ({
      keyboard: [
        [{ text: '🌍 Search country' }],
        [{ text: '🤖 AI Chat' }],
        [{ text: '⚠️ Risk alerts' }, { text: '✈️🛤️ Travel alerts' }],
        [{ text: '🔔 Custom alerts' }, { text: '📋 Travel checklist' }],
        [{ text: '⭐ Premium' }],
      ],
    }),
    selectCountry: () => '🔍 *Select a country*\n\nChoose a destination to see detailed information:',
    back: () => 'Returning to main menu.',
    aiIntro: () => `🤖 *AI Chat*\n\nAsk me anything about travel, countries, safety, recommendations...\n\nExamples:\n• "Is it safe to travel to Japan?"\n• "Plan a trip to Thailand"\n• "What vaccines do I need for Bali?"\n\nType /salir to return to menu.`,
    aiThinking: () => '🤖 Thinking...',
    aiExit: () => 'Returning to main menu.',
    notUnderstood: () => '🤖 I didn\'t understand. Use the buttons or try:\n• Type a country (e.g. "Japan")\n• /help for help',
    help: () => `*📚 Available commands:*\n\n/start - Start bot\n/country [name] - Country info\n/chat or /ai - AI chat\n/alerts - View risks\n/cambio - Exchange rates\n/checklist - Preview checklist\n/premium - Premium info\n/lang - Change language (EN/ES)\n/help - This help`,
    aiNotAvailable: () => '🤖 AI not available. Configure GROQ_API_KEY in Vercel to activate AI chat.',
    aiError: () => '🤖 AI error. Try again.',
    aiConnectionError: () => '🤖 AI connection error. Try again.',
    langChanged: (lang: string) => `✅ Language changed to ${lang === 'es' ? 'Español' : 'English'}`,
    chooseLang: () => '🌍 Select your language:',
  },
};

type Lang = 'es' | 'en';

function detectLanguage(text: string): Lang {
  const lower = text.toLowerCase();
  const enWords = ['the', 'is', 'it', 'you', 'to', 'and', 'what', 'how', 'where', 'when', 'travel', 'trip', 'country', 'safe', 'help', 'hello', 'hi'];
  
  const enCount = enWords.filter(w => lower.includes(` ${w} `) || lower.startsWith(`${w} `)).length;
  
  if (enCount > 0) return 'en';
  return 'es';
}

async function sendMessage(chatId: number, text: string, keyboard?: TelegramKeyboard) {
  if (!TELEGRAM_BOT_TOKEN) {
    log.info('Mensaje (sin bot configurado)', text.substring(0, 50));
    return;
  }
  
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        ...keyboard,
      }),
    });
  } catch (error) {
    log.error('Error sending message', error);
  }
}

async function chatWithAI(message: string, chatHistory: { role: string; content: string }[] = [], lang: Lang = 'es'): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return translations[lang].aiNotAvailable();
  }

  const systemPrompt = lang === 'en'
    ? `You are an expert and friendly travel assistant. You help with:
- Destination recommendations
- Safety tips
- Trip planning
- Country information
- Visa requirements
- Vaccines and health
- Currency and budget

Respond in English, clearly and helpfully. Max 500 characters.`
    : `Eres un asistente de viajes experto y amigable. Ayudas con:
- Recomendaciones de destinos
- Consejos de seguridad
- Planificación de viajes
- Información sobre países
- Requisitos de visado
- Vacunas y salud
- Moneda y presupuesto

Responde en español, de forma clara y útil. Máximo 500 caracteres.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-10).map((h: any) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      log.error('Groq error', await response.text());
      return translations[lang].aiError();
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No pude procesar tu mensaje.';
  } catch (error) {
    log.error('AI chat error', error);
    return translations[lang].aiConnectionError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, callback_query, inline_query } = body;
    
    // Handle inline keyboards (callback queries)
    if (callback_query) {
      // We switched to regular keyboard, handle any legacy callbacks
      return NextResponse.json({ ok: true });
    }
    
    if (inline_query) {
      const query = (inline_query.query || '').trim();
      if (query.length > 0) {
        const paisesModule = await import('@/data/paises');
        const matches = Object.values(paisesModule.paisesData).filter(p =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.capital.toLowerCase().includes(query.toLowerCase())
        );
        
        const results = matches.slice(0, 5).map((pais) => ({
          type: 'article',
          id: pais.codigo,
          title: `${pais.bandera} ${pais.nombre}`,
          description: `${pais.capital} - ${pais.nivelRiesgo === 'sin-riesgo' ? '🟢 Sin riesgo' : pais.nivelRiesgo === 'bajo' ? '🟡 Riesgo bajo' : pais.nivelRiesgo === 'medio' ? '🟠 Riesgo medio' : '🔴 Riesgo alto'}`,
          input_message_content: {
            message_text: formatCountryInfo(pais.codigo),
            parse_mode: 'Markdown',
          },
        }));
        
        await answerInlineQuery(inline_query.id, results);
      } else {
        await answerInlineQuery(inline_query.id, []);
      }
      return NextResponse.json({ ok: true });
    }
    
    if (!message && !callback_query) {
      return NextResponse.json({ ok: true });
    }
    
    const chatId = message?.chat?.id || callback_query?.message?.chat?.id;
    const text = message?.text || '';
    const firstName = message?.chat?.first_name || 'traveler';
    const username = message?.chat?.username;
    const lang: Lang = (message?.chat?.language_code?.startsWith('en') ? 'en' : 'es') as Lang;
    const t = translations[lang];
    
    if (!chatId) {
      return NextResponse.json({ ok: true });
    }
    
// FIRST: Check for country code (works from ANY state)
    const codeMatch = text.match(/^([A-Za-z]{2})$/i);
    if (codeMatch) {
      const upperCode = codeMatch[1].toUpperCase();
      const paisesModule = await import('@/data/paises');
      const allPaises = Object.values(paisesModule.paisesData);
      const country = allPaises.find(p => p.codigo.toUpperCase() === upperCode);
      if (country) {
        resetUserState(chatId);
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) info += '\n\n' + weather;
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      }
    }
    
    // Handle /pais or /country command
    if (text.startsWith('/pais') || text.startsWith('/country')) {
      const query = text.replace(/^\/(pais|country)\s*/i, '').trim().toLowerCase();
      log.info('/pais command - query', query);
      
      if (!query) {
        await sendMessage(chatId, '🇬🇧 *Buscar país*\n\nUsa: /pais [código o nombre]\n\n_Ejemplos:_\n/pais ES\n/pais España\n/pais Japón', {
          reply_markup: t.menu()
        });
        return NextResponse.json({ ok: true });
      }
      
      const paisesModule = await import('@/data/paises');
      const allPaises = Object.values(paisesModule.paisesData);
      
      // Search by code first, then by name
      let country = allPaises.find(p => p.codigo.toLowerCase() === query);
      if (!country) {
        country = allPaises.find(p => 
          p.nombre.toLowerCase().includes(query) ||
          p.nombre.toLowerCase().split(' ').some(word => word.startsWith(query))
        );
      }
      
      if (country) {
        log.info('Found country', country.nombre);
        resetUserState(chatId);
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) info += '\n\n' + weather;
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      } else {
        await sendMessage(chatId, `❌ No encontré "${query}". Prueba: ES, España, Francia, Japón, Australia...`, {
          reply_markup: t.menu()
        });
        return NextResponse.json({ ok: true });
      }
    }
    
    // Also check by name
    if (text && !text.startsWith('/')) {
      const paisesModule = await import('@/data/paises');
      const country = Object.values(paisesModule.paisesData).find(
        p => p.nombre.toLowerCase().includes(text.toLowerCase()) ||
             p.codigo.toLowerCase() === text.toLowerCase()
      );
      if (country) {
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) info += '\n\n' + weather;
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      }
    }
    
    // THEN check state
    const state = getUserState(chatId);
    
    const currencyResult = processCurrencyCommand(text);
    if (currencyResult) {
      await sendMessage(chatId, currencyResult, {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/start' || text.startsWith('/start ')) {
      resetUserState(chatId);
      trackStart(chatId, username || undefined, firstName || undefined);
      
      // Handle /start login token
      const params = text.replace('/start ', '').trim();
      if (params === 'login' && isSupabaseConfigured()) {
        await sendMessage(chatId, '✅ Sesión iniciada correctamente!\n\n🔗 https://www.viajeinteligencia.com/dashboard?telegram_login=1');
        return NextResponse.json({ ok: true });
      }
      
      await sendMessage(chatId, t.welcome(firstName), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '« Volver' || text === '« Back') {
      resetUserState(chatId);
      await sendMessage(chatId, t.back(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🏦 Tipo cambio' || text === '🏦 Exchange rate' || text === '🏦 Câmbio') {
      setUserState(chatId, { step: 'selecting_country' });
      await sendMessage(chatId, t.selectCountry(), getCountryKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🌤️ Clima' || text === '🌤️ Weather') {
      await sendMessage(chatId, '🌤️ *Clima por país*\n\n_escribe: /clima [nombre del país]_\n\nejem: /clima Francia', {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '⚠️ Alertas de riesgo' || text === '⚠️ Risk alerts' || text === '⚠️ Alertas de risco') {
      await sendMessage(chatId, getAlertasRiesgo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '✈️🛤️ Alertas viaje' || text === '✈️🛤️ Travel alerts' || text === 'Viaje') {
      const alerts = await getTravelAlertsAll();
      const formatted = formatTravelAlertsDetailed(alerts);
      await sendMessage(chatId, formatted, {
        reply_markup: getAlertsFullKeyboard() as any
      });
      return NextResponse.json({ ok: true });
    }
    
    // Subscription handlers
    if (text === '🔔 Alertas personalizadas' || text === '🔔 Custom alerts') {
      await sendMessage(chatId,
        `🔔 *Alertas personalizadas*\n\n` +
        `Recibe notificaciones cuando se detecten incidentes en los países que te interesan.\n\n` +
        `• Pulsa "Suscribirse" para elegir país\n` +
        `• Recibirás alertas en tiempo real\n` +
        `• Puedes cancelar en cualquier momento`,
        getSubscriptionKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '➕ Suscribirse a país' || text === '/suscribir' || text === '/subscribe') {
      setUserState(chatId, { step: 'subscribing_country' });
      const paisesModule = await import('@/data/paises');
      const countries = Object.values(paisesModule.paisesData);
      const list = countries.slice(0, 30).map(c => `${c.bandera} ${c.codigo.toUpperCase()} - ${c.nombre}`).join('\n');
      await sendMessage(chatId,
        `🌍 *Suscribirse a alertas*\n\n` +
        `Escribe el código del país (ej: ES, FR, TH) o su nombre.\n\n` +
        `*Países disponibles:*\n${list}\n\n` +
        `_o escribe /cancelar para salir_`,
        { reply_markup: { keyboard: [[{ text: '« Volver' }]], resize_keyboard: true } }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '📋 Mis alertas' || text === '/mis-alertas' || text === '/myalerts') {
      const { subscriptions, error } = await getMySubscriptions(chatId);
      const message = error
        ? `❌ Error: ${error}`
        : formatSubscriptionsList(subscriptions);
      await sendMessage(chatId, message, getSubscriptionKeyboard());
      return NextResponse.json({ ok: true });
    }

    if (text === '❌ Cancelar suscripción') {
      setUserState(chatId, { step: 'unsubscribing_country' });
      const { subscriptions } = await getMySubscriptions(chatId);
      if (!subscriptions || subscriptions.length === 0) {
        await sendMessage(chatId, '🔔 No tienes suscripciones activas.', getSubscriptionKeyboard());
        return NextResponse.json({ ok: true });
      }
      const list = subscriptions.map(s => {
        const country = paisesData[s.country_code];
        return `${country?.bandera || '🌍'} ${s.country_code} - ${country?.nombre || s.country_code}`;
      }).join('\n');
      await sendMessage(chatId,
        `❌ *Cancelar suscripción*\n\n` +
        `Escribe el código del país para cancelar:\n\n${list}\n\n` +
        `_o escribe /cancelar para salir_`,
        { reply_markup: { keyboard: [[{ text: '« Volver' }]], resize_keyboard: true } }
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '🗑️ Cancelar todas') {
      const { success, error } = await unsubscribeAll(chatId);
      if (success) {
        await sendMessage(chatId, '✅ Canceladas todas tus suscripciones.', getSubscriptionKeyboard());
      } else {
        await sendMessage(chatId, `❌ Error: ${error}`, getSubscriptionKeyboard());
      }
      return NextResponse.json({ ok: true });
    }

    if (text === '✈️ Ver aeropuertos' || text === '✈️ Airports') {
      const alerts = await getTravelAlertsAll();
      const airports = (alerts.allAlerts || []).filter((a: any) => a.type === 'airport');
      let msg = `✈️ *Aeropuertos*\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;
      airports.forEach((a: any) => {
        const emoji = a.status === 'ok' ? '✅' : a.delay > 60 ? '🔴' : '⚠️';
        msg += `${emoji} ${a.name}: ${a.delay}min\n`;
      });
      await sendMessage(chatId, msg, { reply_markup: getAlertsFullKeyboard() as any });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🚂 Ver trenes' || text === '🚂 Trains') {
      const alerts = await getTravelAlertsAll();
      const trains = (alerts.allAlerts || []).filter((a: any) => a.type === 'train');
      let msg = `🚂 *Trenes*\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;
      trains.forEach((a: any) => {
        const emoji = a.status === 'ok' ? '✅' : a.delay > 30 ? '🔴' : '⚠️';
        msg += `${emoji} ${a.name || a.origin}: ${a.delay}min\n`;
      });
      await sendMessage(chatId, msg, { reply_markup: getAlertsFullKeyboard() as any });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🌧️ Ver clima' || text === '🌧️ Weather') {
      const alerts = await getTravelAlertsAll();
      const weather = (alerts.allAlerts || []).filter((a: any) => a.type === 'weather');
      let msg = `🌧️ *Meteorología*\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;
      weather.forEach((a: any) => {
        const emoji = a.level === 'low' ? '✅' : a.level === 'warning' ? '⚠️' : '🔴';
        msg += `${emoji} ${a.location}: ${a.condition}\n`;
      });
      await sendMessage(chatId, msg, { reply_markup: getAlertsFullKeyboard() as any });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🔄 Actualizar alertas' || text === '🔄 Refresh alerts') {
      const alerts = await getTravelAlertsAll();
      const formatted = formatTravelAlertsDetailed(alerts);
      await sendMessage(chatId, formatted, {
        reply_markup: getAlertsFullKeyboard() as any
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🏦 Tipo cambio' || text === '🏦 Exchange rate' || text === '🏦 Câmbio') {
      await sendMessage(chatId, getTipoCambioInfo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '📋 Checklist viaje' || text === '📋 Travel checklist' || text === '📋 Checklist viagem') {
      await sendMessage(chatId, getChecklistPreview(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '⭐ Premium') {
      await sendMessage(chatId, getPremiumInfo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🤖 Chat IA' || text === '🤖 AI Chat' || text === '🤖 Chat IA' || text === '/chat' || text === '/ia') {
      setUserState(chatId, { step: 'ai_chat', chatHistory: [] });
      await sendMessage(chatId, t.aiIntro(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/salir' || text === '/exit') {
      resetUserState(chatId);
      await sendMessage(chatId, t.aiExit(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (state.step === 'ai_chat') {
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: t.aiThinking(),
        }),
      });
      
      const history = state.chatHistory || [];
      history.push({ role: 'user', content: text });
      
      const response = await chatWithAI(text, history, lang);
      
      history.push({ role: 'assistant', content: response });
      setUserState(chatId, { step: 'ai_chat', chatHistory: history.slice(-20) });
      
      await sendMessage(chatId, response, {
        reply_markup: {
          keyboard: [
            [{ text: lang === 'en' ? '🤖 Continue chat' : '🤖 Continuar chat' }],
            [{ text: lang === 'en' ? '« Back' : '« Volver' }],
          ],
          resize_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (state.step === 'subscribing_country' && text) {
      if (text === '/cancelar' || text === '« Volver') {
        resetUserState(chatId);
        await sendMessage(chatId, 'Cancelado.', getSubscriptionKeyboard());
        return NextResponse.json({ ok: true });
      }
      const paisesModule = await import('@/data/paises');
      const allCountries = Object.values(paisesModule.paisesData);
      const searchText = text.toLowerCase().trim();
      let country = allCountries.find(p =>
        p.codigo.toLowerCase() === searchText ||
        p.nombre.toLowerCase().includes(searchText) ||
        p.capital.toLowerCase().includes(searchText)
      );
      if (!country) {
        await sendMessage(chatId, `❌ No encontré "${text}". Prueba con código (ES, FR) o nombre.`, {
          reply_markup: { keyboard: [[{ text: '« Volver' }]], resize_keyboard: true }
        });
        return NextResponse.json({ ok: true });
      }
      const result = await subscribeToCountry({
        chatId,
        username: username || undefined,
        countryCode: country.codigo,
      });
      if (result.success) {
        await sendMessage(chatId,
          `✅ *Suscrito a ${country.bandera} ${country.nombre}*\n\n` +
          `Recibirás alertas de incidentes en este país.\n` +
          `Usa /mis-alertas para ver tus suscripciones.`,
          getSubscriptionKeyboard()
        );
      } else {
        await sendMessage(chatId, `❌ Error: ${result.error}`, getSubscriptionKeyboard());
      }
      resetUserState(chatId);
      return NextResponse.json({ ok: true });
    }

    if (state.step === 'unsubscribing_country' && text) {
      if (text === '/cancelar' || text === '« Volver') {
        resetUserState(chatId);
        await sendMessage(chatId, 'Cancelado.', getSubscriptionKeyboard());
        return NextResponse.json({ ok: true });
      }
      const paisesModule = await import('@/data/paises');
      const allCountries = Object.values(paisesModule.paisesData);
      const searchText = text.toLowerCase().trim();
      let country = allCountries.find(p =>
        p.codigo.toLowerCase() === searchText ||
        p.nombre.toLowerCase().includes(searchText)
      );
      if (!country) {
        await sendMessage(chatId, `❌ No encontré "${text}". Prueba con código (ES, FR) o nombre.`, {
          reply_markup: { keyboard: [[{ text: '« Volver' }]], resize_keyboard: true }
        });
        return NextResponse.json({ ok: true });
      }
      const result = await unsubscribeFromCountry(chatId, country.codigo);
      if (result.success) {
        await sendMessage(chatId,
          `✅ Cancelada suscripción a ${country.bandera} ${country.nombre}`,
          getSubscriptionKeyboard()
        );
      } else {
        await sendMessage(chatId, `❌ Error: ${result.error}`, getSubscriptionKeyboard());
      }
      resetUserState(chatId);
      return NextResponse.json({ ok: true });
    }
    
    if (state.step === 'selecting_country' && text) {
      const paisesModule = await import('@/data/paises');
      const allCountries = Object.values(paisesModule.paisesData);
      
      // Clean text - remove emoji flags, extra whitespace
      const cleanText = text.trim()
        .replace(/🇺🇸|🇪🇺|🇬🇧|🇦🇺|🇨🇦|🇧🇷|🇲🇽|🇯🇵|🇰🇷|🇨🇳|🇮🇳|🇹🇭|🇻🇳|🇵🇭|🇲🇾|🇮🇩|🇪🇬|🇿🇦|🇪🇬|🇲🇦|🇪🇬|🇱🇧|🇸🇦|🇲🇲|🇰🇭|🇪🇬|🇻🇪/g, '')
        .replace(/^\//, '')
        .replace(/\s+/g, '')
        .toUpperCase();
      
      // Check if it's 2 letters (country code) - ES, FR, US, etc.
      if (/^[A-Z]{2}$/.test(cleanText)) {
        const country = allCountries.find(p => p.codigo.toUpperCase() === cleanText);
        
        if (country) {
          resetUserState(chatId);
          const weather = await getWeatherForCountry(country.codigo);
          let info = formatCountryInfo(country.codigo);
          if (weather) info += '\n\n' + weather;
          await sendMessage(chatId, info, getMainKeyboard());
          return NextResponse.json({ ok: true });
        }
      }
      
      // Also try the "ES - España" format
      if (text.includes(' - ')) {
        const code = text.replace(/^\//, '').split(' - ')[0].trim().toUpperCase();
        const country = allCountries.find(p => p.codigo.toUpperCase() === code);
        
        if (country) {
          resetUserState(chatId);
          const weather = await getWeatherForCountry(country.codigo);
          let info = formatCountryInfo(country.codigo);
          if (weather) info += '\n\n' + weather;
          await sendMessage(chatId, info, getMainKeyboard());
          return NextResponse.json({ ok: true });
        }
      }
      
      // Try by name (España, Francia, Germany, etc.)
      const searchText = text.toLowerCase().trim();
      let country = allCountries.find(p => 
        p.nombre.toLowerCase().includes(searchText) ||
        p.codigo.toLowerCase() === searchText
      );
      
      if (country) {
        resetUserState(chatId);
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) info += '\n\n' + weather;
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      }
      
      // Also search for alternative names (España -> Spain, Alemania -> Germany)
      const altNames: Record<string, string> = {
        'spain': 'es', 'españa': 'es',
        'france': 'fr', 'francia': 'fr',
        'germany': 'de', 'alemania': 'de',
        'italy': 'it', 'italia': 'it',
        'portugal': 'pt',
        'uk': 'gb', 'reino unido': 'gb',
        'united kingdom': 'gb',
        'japan': 'jp', 'japón': 'jp',
        'usa': 'us', 'eeuu': 'us', 'estados unidos': 'us',
        'mexico': 'mx',
        'argentina': 'ar',
        'brasil': 'br',
        'china': 'cn',
        'thailand': 'th', 'tailandia': 'th',
        'vietnam': 'vn',
        'india': 'in',
        'australia': 'au',
        'morocco': 'ma', 'marruecos': 'ma',
        'egypt': 'eg', 'egipcio': 'eg',
        'south africa': 'za',
        'turkey': 'tr', 'turquía': 'tr',
        'greece': 'gr', 'grecia': 'gr',
        'netherlands': 'nl', 'holanda': 'nl',
        'belgium': 'be', 'bélgica': 'be',
        'switzerland': 'ch', 'suiza': 'ch',
        'austria': 'at',
        'poland': 'pl', 'polonia': 'pl',
        'norway': 'no', 'noruega': 'no',
        'sweden': 'se', 'suecia': 'se',
        'finland': 'fi', 'finlandia': 'fi',
        'denmark': 'dk', 'dinamarca': 'dk',
        'ireland': 'ie', 'irlanda': 'ie',
        'canada': 'ca',
        'brazil': 'br',
      };
      
      const altCode = altNames[searchText];
      if (altCode) {
        country = allCountries.find(p => p.codigo.toLowerCase() === altCode);
        if (country) {
          resetUserState(chatId);
          const weather = await getWeatherForCountry(country.codigo);
          let info = formatCountryInfo(country.codigo);
          if (weather) info += '\n\n' + weather;
          await sendMessage(chatId, info, getMainKeyboard());
          return NextResponse.json({ ok: true });
        }
      }
      
      await sendMessage(chatId, '❌ No encontrado. Prueba: ES, España, FR, Francia, DE, Alemania...', getCountryKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    // Also handle direct country search from any state - country names directly typed
    // Skip commands but handle country name queries
    if (text && !text.startsWith('/') && state.step === 'initial') {
      const paisesModule = await import('@/data/paises');
      const country = Object.values(paisesModule.paisesData).find(
        (p) => p.nombre.toLowerCase().includes(text.toLowerCase()) ||
               p.capital.toLowerCase().includes(text.toLowerCase()) ||
               p.codigo.toLowerCase() === text.toLowerCase()
      );
      if (country) {
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) {
          info += '\n\n' + weather;
        }
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      }
    }
    
    // Also handle /pais command style like /España
    if (text.startsWith('/') && text.length > 2 && !['/start', '/help', '/clima', '/cambio', '/checklist', '/premium', '/salir', '/alertas'].includes(text.split(' ')[0].toLowerCase())) {
      const query = text.replace('/', '').trim();
      const paisesModule = await import('@/data/paises');
      const country = Object.values(paisesModule.paisesData).find(
        (p) => p.nombre.toLowerCase().includes(query.toLowerCase()) ||
               p.codigo.toLowerCase() === query.toLowerCase()
      );
      if (country) {
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) {
          info += '\n\n' + weather;
        }
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      }
    }
    
    if (text === '/alertas' || text === '/alerts') {
      await sendMessage(chatId, getAlertasRiesgo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/alertasviaje' || text === '/travelalerts' || text === '/viaje') {
      const alerts = await getTravelAlertsSummary();
      const formatted = formatTravelAlertsShort(alerts);
      await sendMessage(chatId, formatted, {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/alertasviaje full' || text === '/travelalerts full') {
      const alerts = await getTravelAlertsAll();
      const formatted = formatTravelAlertsDetailed(alerts);
      await sendMessage(chatId, formatted, {
        reply_markup: getAlertsKeyboard() as any
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text.startsWith('/clima ') || text.startsWith('/weather ')) {
      const query = text.replace(/^\/(clima|weather)\s+/i, '').trim();
      const paisesModule = await import('@/data/paises');
      const country = Object.values(paisesModule.paisesData).find(
        (p) => p.nombre.toLowerCase().includes(query.toLowerCase()) ||
               p.codigo.toLowerCase() === query.toLowerCase()
      );
      
      if (country) {
        const weather = await getWeatherForCountry(country.codigo);
        if (weather) {
          await sendMessage(chatId, weather, { reply_markup: t.menu() });
        } else {
          await sendMessage(chatId, '❌ No se pudo obtener el clima.', { reply_markup: t.menu() });
        }
      } else {
        await sendMessage(chatId, '❌ País no encontrado.', { reply_markup: t.menu() });
      }
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/cambio' || text === '/rate') {
      await sendMessage(chatId, getTipoCambioInfo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/checklist') {
      await sendMessage(chatId, getChecklistPreview(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/premium') {
      await sendMessage(chatId, getPremiumInfo(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/help' || text === '/ayuda') {
      await sendMessage(chatId, t.help(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
await sendMessage(chatId, t.notUnderstood(), {
      reply_markup: t.menu()
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error('Telegram webhook error', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Telegram Bot API endpoint',
    usage: 'POST updates here',
    commands: ['/start', '/pais', '/alertas', '/alertasviaje', '/cambio', '/checklist', '/premium', '/help', '/salir'],
    features: ['inline_search', 'currency_converter', 'travel_alerts']
  });
}

async function answerInlineQuery(inlineQueryId: string, results: any[]) {
  if (!TELEGRAM_BOT_TOKEN) return;
  
  try {
    await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inline_query_id: inlineQueryId,
        results: results,
        cache_time: 300,
      }),
    });
  } catch (error) {
    log.error('Inline query error', error);
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
      }),
    });
  } catch (error) {
    log.error('Callback query error', error);
  }
}

function convertCurrency(amount: number, from: string, to: string): string | null {
  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.08, GBP: 0.85, JPY: 162, MXN: 17.8, THB: 38, IDR: 17000, VND: 26000, AUD: 1.65, CAD: 1.47, BRL: 5.4, COP: 4100, PEN: 4.0, CLP: 980, ARS: 870, INR: 90, CNY: 7.8, KRW: 1430, SGD: 1.35, AED: 4.0, ZAR: 19, EGP: 33, MAD: 10.5, KES: 155 },
    USD: { EUR: 0.93, GBP: 0.79, JPY: 150, MXN: 16.5, THB: 35, IDR: 15700, VND: 24000, AUD: 1.53, CAD: 1.36, BRL: 5.0, COP: 3800, PEN: 3.7, CLP: 910, ARS: 805, INR: 83, CNY: 7.2, KRW: 1320, SGD: 1.25, AED: 3.67, ZAR: 17.6, EGP: 30.5, MAD: 9.7, KES: 143 },
    GBP: { EUR: 1.18, USD: 1.27 },
  };
  
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();
  
  if (fromUpper === toUpper) return amount.toFixed(2);
  
  let rate: number;
  
  if (rates[fromUpper]?.[toUpper]) {
    rate = rates[fromUpper][toUpper];
  } else if (rates[fromUpper]?.EUR && rates[toUpper]?.EUR) {
    const toEur = 1 / rates[fromUpper].EUR;
    const fromEur = rates[toUpper].EUR;
    rate = toEur * fromEur;
  } else if (rates[fromUpper]?.USD && rates[toUpper]?.USD) {
    const toUsd = 1 / rates[fromUpper].USD;
    const fromUsd = rates[toUpper].USD;
    rate = toUsd * fromUsd;
  } else {
    return null;
  }
  
  return (amount * rate).toFixed(2);
}

function processCurrencyCommand(text: string): string | null {
  const match = text.match(/\/cambio\s+(\d+(?:\.\d+)?)\s+(\w{3})\s+(\w{3})/i);
  if (!match) return null;
  
  const amount = parseFloat(match[1]);
  const from = match[2].toUpperCase();
  const to = match[3].toUpperCase();
  
  const result = convertCurrency(amount, from, to);
  
  if (result === null) {
    return `❌ No puedo convertir ${from} a ${to}.\n\nMonedas disponibles: EUR, USD, GBP, JPY, MXN, THB, AUD, CAD, BRL, INR, CNY, KRW, SGD, VND, IDR, AED, ZAR, PHP, MYR`;
  }
  
  const flag = { USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', MXN: '🇲🇽', THB: '🇹🇭', AUD: '🇦🇺', CAD: '🇨🇦', BRL: '🇧🇷', INR: '🇮🇳', CNY: '🇨🇳', KRW: '🇰🇷', SGD: '🇸🇬', VND: '🇻🇳', IDR: '🇮🇩', AED: '🇦🇪', ZAR: '🇿🇦', PHP: '🇵🇭', MYR: '🇲🇾' };
  
  return `💱 *Conversión de Moneda*\n\n` +
    `${amount} ${from} = ${result} ${to}\n\n` +
    `📊 Tasa orientativa. Verifica en tu entidad.`;
}
