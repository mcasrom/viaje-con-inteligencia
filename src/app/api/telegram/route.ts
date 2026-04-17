import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
  getWeatherForCountry
} from '@/lib/telegram-bot';

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
  
  if (error) console.error('Track start error:', error);
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
        [{ text: '⚠️ Alertas de riesgo' }, { text: '🏦 Tipo cambio' }],
        [{ text: '📋 Checklist viaje' }],
        [{ text: '⭐ Premium' }],
      ],
    }),
    selectCountry: () => '🔍 *Selecciona un país*\n\nElige un destino para ver información detallada:',
    back: () => 'Volviendo al menú principal.',
    aiIntro: () => `🤖 *Chat con IA*\n\nPregúntame lo que quieras sobre viajes, países, seguridad, recomendaciones...\n\nEjemplos:\n• "¿Es seguro viajar a Japón?"\n• "Planifica un viaje a Thailandia"\n• "¿Qué vacunas necesito para Bali?"\n\nEscribe /salir para volver al menú.`,
    aiThinking: () => '🤖 Pensando...',
    aiExit: () => 'Volviendo al menú principal.',
    notUnderstood: () => '🤖 No entendí. Usa los botones o prueba:\n• Escribe un país (ej: "Japón")\n• /help para ayuda',
    help: () => `*📚 Comandos disponibles:*\n\n/start - Iniciar bot\n/pais [nombre] - Info de un país\n/clima [país] - Ver clima actual\n/chat o /ia - Chat con IA\n/alertas - Ver riesgos\n/cambio - Tipos de cambio\n/checklist - Preview checklist\n/premium - Info premium\n/lang - Cambiar idioma (EN/ES/PT)\n/help - Esta ayuda`,
    aiNotAvailable: () => '🤖 IA no disponible. Configure GROQ_API_KEY en Vercel para activar el chat IA.',
    aiError: () => '🤖 Error de IA. Intenta de nuevo.',
    aiConnectionError: () => '🤖 Error de conexión con IA. Intenta de nuevo.',
    langChanged: (lang: string) => `✅ Idioma cambiado a ${lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}`,
    chooseLang: () => '🌍 Selecciona tu idioma:',
  },
  en: {
    welcome: (name: string) => `Hello ${name}! 👋\n\n🌍 *Travel with Intelligence - Risk Zero*\n\nYour smart travel assistant. Check risks, requirements and tips to travel safe.\n\nSelect an option:`,
    menu: () => ({
      keyboard: [
        [{ text: '🌍 Search country' }],
        [{ text: '🤖 AI Chat' }],
        [{ text: '⚠️ Risk alerts' }, { text: '🏦 Exchange rate' }],
        [{ text: '📋 Travel checklist' }],
        [{ text: '⭐ Premium' }],
      ],
    }),
    selectCountry: () => '🔍 *Select a country*\n\nChoose a destination to see detailed information:',
    back: () => 'Returning to main menu.',
    aiIntro: () => `🤖 *AI Chat*\n\nAsk me anything about travel, countries, safety, recommendations...\n\nExamples:\n• "Is it safe to travel to Japan?"\n• "Plan a trip to Thailand"\n• "What vaccines do I need for Bali?"\n\nType /salir to return to menu.`,
    aiThinking: () => '🤖 Thinking...',
    aiExit: () => 'Returning to main menu.',
    notUnderstood: () => '🤖 I didn\'t understand. Use the buttons or try:\n• Type a country (e.g. "Japan")\n• /help for help',
    help: () => `*📚 Available commands:*\n\n/start - Start bot\n/country [name] - Country info\n/chat or /ai - AI chat\n/alerts - View risks\n/cambio - Exchange rates\n/checklist - Preview checklist\n/premium - Premium info\n/lang - Change language (EN/ES/PT)\n/help - This help`,
    aiNotAvailable: () => '🤖 AI not available. Configure GROQ_API_KEY in Vercel to activate AI chat.',
    aiError: () => '🤖 AI error. Try again.',
    aiConnectionError: () => '🤖 AI connection error. Try again.',
    langChanged: (lang: string) => `✅ Language changed to ${lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}`,
    chooseLang: () => '🌍 Select your language:',
  },
  pt: {
    welcome: (name: string) => `Olá ${name}! 👋\n\n🌍 *Viaje com Inteligência - Risco Zero*\n\nSeu assistente de viagem inteligente. Consulte riscos, requisitos e dicas para viajar seguro.\n\nSelecione uma opção:`,
    menu: () => ({
      keyboard: [
        [{ text: '🌍 Pesquisar país' }],
        [{ text: '🤖 Chat IA' }],
        [{ text: '⚠️ Alertas de risco' }, { text: '🏦 Câmbio' }],
        [{ text: '📋 Checklist viagem' }],
        [{ text: '⭐ Premium' }],
      ],
    }),
    selectCountry: () => '🔍 *Selecione um país*\n\nEscolha um destino para ver informações detalhadas:',
    back: () => 'Voltando ao menu principal.',
    aiIntro: () => `🤖 *Chat com IA*\n\nPergunte-me qualquer coisa sobre viagens, países, segurança, recomendações...\n\nExemplos:\n• "É seguro viajar para o Japão?"\n• "Planeje uma viagem para Tailândia"\n• "Que vacinas preciso para Bali?"\n\nDigite /salir para voltar ao menu.`,
    aiThinking: () => '🤖 Pensando...',
    aiExit: () => 'Voltando ao menu principal.',
    notUnderstood: () => '🤖 Não entendi. Use os botões ou tente:\n• Digite um país (ex: "Japão")\n• /help para ajuda',
    help: () => `*📚 Comandos disponíveis:*\n\n/start - Iniciar bot\n/pais [nome] - Info do país\n/chat ou /ia - Chat com IA\n/alertas - Ver riscos\n/cambio - Câmbios\n/checklist - Preview checklist\n/premium - Info premium\n/lang - Mudar idioma (EN/ES/PT)\n/help - Esta ajuda`,
    aiNotAvailable: () => '🤖 IA não disponível. Configure GROQ_API_KEY no Vercel para ativar o chat IA.',
    aiError: () => '🤖 Erro de IA. Tente novamente.',
    aiConnectionError: () => '🤖 Erro de conexão com IA. Tente novamente.',
    langChanged: (lang: string) => `✅ Idioma alterado para ${lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}`,
    chooseLang: () => '🌍 Selecione seu idioma:',
  },
};

type Lang = 'es' | 'en' | 'pt';

function detectLanguage(text: string): Lang {
  const lower = text.toLowerCase();
  const enWords = ['the', 'is', 'it', 'you', 'to', 'and', 'what', 'how', 'where', 'when', 'travel', 'trip', 'country', 'safe', 'help', 'hello', 'hi'];
  const ptWords = ['o', 'a', 'é', 'para', 'que', 'como', 'onde', 'quando', 'viajem', 'viagem', 'país', 'seguro', 'ajuda', 'olá', 'oi'];
  
  const enCount = enWords.filter(w => lower.includes(` ${w} `) || lower.startsWith(`${w} `)).length;
  const ptCount = ptWords.filter(w => lower.includes(` ${w} `) || lower.startsWith(`${w} `)).length;
  
  if (enCount > ptCount) return 'en';
  if (ptCount > enCount) return 'pt';
  return 'es';
}

async function sendMessage(chatId: number, text: string, keyboard?: TelegramKeyboard) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Mensaje (sin bot configurado):', text.substring(0, 50));
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
    console.error('Error sending message:', error);
  }
}

async function chatWithAI(message: string, chatHistory: { role: string; content: string }[] = [], lang: Lang = 'es'): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return translations[lang].aiNotAvailable();
  }

  const systemPrompt = lang === 'es' 
    ? `Eres un asistente de viajes experto y amigable. Ayudas con:
- Recomendaciones de destinos
- Consejos de seguridad
- Planificación de viajes
- Información sobre países
- Requisitos de visado
- Vacunas y salud
- Moneda y presupuesto

Responde en español, de forma clara y útil. Máximo 500 caracteres.`
    : lang === 'en'
    ? `You are an expert and friendly travel assistant. You help with:
- Destination recommendations
- Safety tips
- Trip planning
- Country information
- Visa requirements
- Vaccines and health
- Currency and budget

Respond in English, clearly and helpfully. Max 500 characters.`
    : `Você é um assistente de viagem especialista e amigável. Ajuda com:
- Recomendações de destinos
- Dicas de segurança
- Planejamento de viagens
- Informações sobre países
- Requisitos de visto
- Vacinas e saúde
- Moeda e orçamento

Responda em português, de forma clara e útil. Máximo 500 caracteres.`;

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
      console.error('Groq error:', await response.text());
      return translations[lang].aiError();
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No pude procesar tu mensaje.';
  } catch (error) {
    console.error('AI chat error:', error);
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
    const lang: Lang = (message?.chat?.language_code?.startsWith('en') ? 'en' : 
                         message?.chat?.language_code?.startsWith('pt') ? 'pt' : 'es') as Lang;
    const t = translations[lang];
    
    if (!chatId) {
      return NextResponse.json({ ok: true });
    }
    
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
        await sendMessage(chatId, '✅ Sesión iniciada correctamente!\n\n🔗 https://viaje-con-inteligencia.vercel.app/dashboard?telegram_login=1');
        return NextResponse.json({ ok: true });
      }
      
      await sendMessage(chatId, t.welcome(firstName), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '« Volver' || text === '« Back' || text === '« Voltar') {
      resetUserState(chatId);
      await sendMessage(chatId, t.back(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🌍 Buscar país' || text === '🌍 Search country' || text === '🌍 Pesquisar país') {
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
    
    if (text === '/salir' || text === '/exit' || text === '/sair') {
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
            [{ text: lang === 'en' ? '🤖 Continue chat' : lang === 'pt' ? '🤖 Continuar chat' : '🤖 Continuar chat' }],
            [{ text: lang === 'en' ? '« Back' : lang === 'pt' ? '« Voltar' : '« Volver' }],
          ],
          resize_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }
    
    if (state.step === 'selecting_country' && text) {
      console.log('Selecting country, text:', text);
      
      const paisesModule = await import('@/data/paises');
      const allCountries = Object.values(paisesModule.paisesData);
      
      // Try country code first (ES, FR, DE, etc.)
      let country = allCountries.find(
        (p) => p.codigo.toLowerCase() === text.toLowerCase()
      );
      
      // Try exact name match
      if (!country) {
        country = allCountries.find(
          (p) => p.nombre.toLowerCase() === text.toLowerCase()
        );
      }
      
      // Try partial name match
      if (!country) {
        country = allCountries.find(
          (p) => p.nombre.toLowerCase().includes(text.toLowerCase()) ||
                 text.toLowerCase().includes(p.nombre.toLowerCase())
        );
      }
      
      console.log('Found:', country?.nombre);
      
      if (country) {
        resetUserState(chatId);
        const weather = await getWeatherForCountry(country.codigo);
        let info = formatCountryInfo(country.codigo);
        if (weather) {
          info += '\n\n' + weather;
        }
        await sendMessage(chatId, info, getMainKeyboard());
        return NextResponse.json({ ok: true });
      } else {
        await sendMessage(chatId, '❌ País no encontrado. Prueba con el código (ej: ES, FR, DE).', getCountryKeyboard());
        return NextResponse.json({ ok: true });
      }
    }
    
    // Also handle direct country search from any state
    if (text && !text.startsWith('/') && !text.match(/^[^\w\s]+ $/)) {
      // Skip if it looks like a keyboard button with only flag
      const searchText = text.replace(/^[^\w\s]+ /, '').trim();
      
      const paisesModule = await import('@/data/paises');
      const country = Object.values(paisesModule.paisesData).find(
        (p) => p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
               p.capital.toLowerCase().includes(searchText.toLowerCase()) ||
               p.codigo.toLowerCase() === searchText.toLowerCase()
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
    
    if (text.startsWith('/pais_')) {
      const codigo = text.replace('/pais_', '');
      await sendMessage(chatId, formatCountryInfo(codigo), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/help' || text === '/ayuda' || text === '/ajuda') {
      await sendMessage(chatId, t.help(), {
        reply_markup: t.menu()
      });
      return NextResponse.json({ ok: true });
    }
    
    if (text.startsWith('/pais') || text.startsWith('/country')) {
      const query = text.replace('/pais', '').replace('/country', '').trim();
      if (query) {
        const result = searchCountry(query);
        if (result) {
          // Try to get weather too
          const paisesModule = await import('@/data/paises');
          const country = Object.values(paisesModule.paisesData).find(
            p => result.includes(p.nombre)
          );
          let fullInfo = result;
          if (country) {
            const weather = await getWeatherForCountry(country.codigo);
            if (weather) {
              fullInfo += '\n\n' + weather;
            }
          }
          await sendMessage(chatId, fullInfo, {
            reply_markup: t.menu()
          });
        } else {
          await sendMessage(chatId, 
            `❌ No encontré "${query}". Prueba con otro nombre.`,
            {
              reply_markup: t.menu()
            }
          );
        }
      } else {
        setUserState(chatId, { step: 'selecting_country' });
        await sendMessage(chatId, lang === 'en' ? 'Type the country name:' : lang === 'pt' ? 'Digite o nome do país:' : 'Escribe el nombre del país:', getCountryKeyboard());
      }
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/alertas' || text === '/alerts') {
      await sendMessage(chatId, getAlertasRiesgo(), {
        reply_markup: t.menu()
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
    
    await sendMessage(chatId, t.notUnderstood(), {
      reply_markup: t.menu()
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram Bot API endpoint',
    usage: 'POST updates here',
    commands: ['/start', '/pais', '/alertas', '/cambio', '/checklist', '/premium', '/help', '/salir'],
    features: ['inline_search', 'currency_converter']
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
    console.error('Inline query error:', error);
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
    console.error('Callback query error:', error);
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
