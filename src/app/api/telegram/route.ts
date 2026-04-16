import { NextRequest, NextResponse } from 'next/server';
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
  searchCountry
} from '@/lib/telegram-bot';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramKeyboard {
  reply_markup?: {
    keyboard: { text: string }[][];
    resize_keyboard?: boolean;
  };
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

async function chatWithAI(message: string, chatHistory: { role: string; content: string }[] = []): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return '🤖 IA no disponible. Configure GROQ_API_KEY en Vercel para activar el chat IA.';
  }

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
          {
            role: 'system',
            content: `Eres un asistente de viajes experto y amigable. Ayudas con:
- Recomendaciones de destinos
- Consejos de seguridad
- Planificación de viajes
- Información sobre países
- Requisitos de visado
- Vacunas y salud
- Moneda y presupuesto

Responde en español, de forma clara y útil. Máximo 500 caracteres.`
          },
          ...chatHistory.slice(-10).map((h: any) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq error:', error);
      return '🤖 Error de IA. Intenta de nuevo.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No pude procesar tu mensaje.';
  } catch (error) {
    console.error('AI chat error:', error);
    return '🤖 Error de conexión con IA. Intenta de nuevo.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, callback_query } = body;
    
    if (!message && !callback_query) {
      return NextResponse.json({ ok: true });
    }
    
    const chatId = message?.chat?.id || callback_query?.message?.chat?.id;
    const text = message?.text || '';
    const firstName = message?.chat?.first_name || 'viajero';
    
    if (!chatId) {
      return NextResponse.json({ ok: true });
    }
    
    const state = getUserState(chatId);
    
    if (text === '/start' || text === '« Volver') {
      resetUserState(chatId);
      await sendMessage(chatId, 
        `¡Hola ${firstName}! 👋\n\n` +
        `🌍 *Viaje con Inteligencia - Riesgo Zero*\n\n` +
        `Tu asistente de viaje inteligente. ` +
        `Consulta riesgos, requisitos y consejos para viajar seguro.\n\n` +
        `Selecciona una opción:`,
        getMainKeyboard()
      );
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🌍 Buscar país') {
      setUserState(chatId, { step: 'selecting_country' });
      await sendMessage(chatId,
        `🔍 *Selecciona un país*\n\n` +
        `Elige un destino para ver información detallada:`,
        getCountryKeyboard()
      );
      return NextResponse.json({ ok: true });
    }
    
    if (text === '⚠️ Alertas de riesgo') {
      await sendMessage(chatId, getAlertasRiesgo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🏦 Tipo cambio') {
      await sendMessage(chatId, getTipoCambioInfo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '📋 Checklist viaje') {
      await sendMessage(chatId, getChecklistPreview(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '⭐ Premium') {
      await sendMessage(chatId, getPremiumInfo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '🤖 Chat IA' || text === '/chat' || text === '/ia') {
      setUserState(chatId, { step: 'ai_chat', chatHistory: [] });
      await sendMessage(chatId, 
        `🤖 *Chat con IA*\n\n` +
        `Pregúntame lo que quieras sobre viajes, países, seguridad, recomendaciones...\n\n` +
        `Ejemplos:\n` +
        `• "¿Es seguro viajar a Japón?"\n` +
        `• "Planifica un viaje a Thailandia"\n` +
        `• "¿Qué vacunas necesito para Bali?"\n\n` +
        `Escribe /salir para volver al menú.`,
        getMainKeyboard()
      );
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/salir') {
      resetUserState(chatId);
      await sendMessage(chatId, 'Volviendo al menú principal.', getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (state.step === 'ai_chat') {
      const typingMessage = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🤖 Pensando...',
        }),
      });
      
      const history = state.chatHistory || [];
      history.push({ role: 'user', content: text });
      
      const response = await chatWithAI(text, history);
      
      history.push({ role: 'assistant', content: response });
      setUserState(chatId, { step: 'ai_chat', chatHistory: history.slice(-20) });
      
      await sendMessage(chatId, response, {
        reply_markup: {
          keyboard: [
            [{ text: '🤖 Continuar chat' }],
            [{ text: '« Volver' }],
          ],
          resize_keyboard: true,
        },
      });
      return NextResponse.json({ ok: true });
    }
    
    if (state.step === 'selecting_country' && text) {
      const countryMatch = text.match(/^[^\w\s]+ (.+)$/);
      if (countryMatch) {
        const countryName = countryMatch[1].toLowerCase();
        const paisesModule = await import('@/data/paises');
        const country = Object.values(paisesModule.paisesData).find(
          (p) => p.nombre.toLowerCase() === countryName
        );
        if (country) {
          resetUserState(chatId);
          await sendMessage(chatId, formatCountryInfo(country.codigo), getMainKeyboard());
          return NextResponse.json({ ok: true });
        }
      }
    }
    
    if (text.startsWith('/pais_')) {
      const codigo = text.replace('/pais_', '');
      await sendMessage(chatId, formatCountryInfo(codigo), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/help' || text === '/ayuda') {
      await sendMessage(chatId,
        `*📚 Comandos disponibles:*\n\n` +
        `/start - Iniciar bot\n` +
        `/pais [nombre] - Info de un país\n` +
        `/chat o /ia - Chat con IA\n` +
        `/alertas - Ver riesgos\n` +
        `/cambio - Tipos de cambio\n` +
        `/checklist - Preview checklist\n` +
        `/premium - Info premium\n` +
        `/help - Esta ayuda`,
        getMainKeyboard()
      );
      return NextResponse.json({ ok: true });
    }
    
    if (text.startsWith('/pais')) {
      const query = text.replace('/pais', '').trim();
      if (query) {
        const result = searchCountry(query);
        if (result) {
          await sendMessage(chatId, result, getMainKeyboard());
        } else {
          await sendMessage(chatId, 
            `❌ No encontré "${query}". Prueba con otro nombre.`,
            getMainKeyboard()
          );
        }
      } else {
        setUserState(chatId, { step: 'selecting_country' });
        await sendMessage(chatId, 'Escribe el nombre del país:', getCountryKeyboard());
      }
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/alertas') {
      await sendMessage(chatId, getAlertasRiesgo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/cambio') {
      await sendMessage(chatId, getTipoCambioInfo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/checklist') {
      await sendMessage(chatId, getChecklistPreview(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    if (text === '/premium') {
      await sendMessage(chatId, getPremiumInfo(), getMainKeyboard());
      return NextResponse.json({ ok: true });
    }
    
    await sendMessage(chatId,
      `🤖 No entendí. Usa los botones o prueba:\n` +
      `• Escribe un país (ej: "Japón")\n` +
      `• /help para ayuda`,
      getMainKeyboard()
    );
    
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
    commands: ['/start', '/pais', '/alertas', '/cambio', '/checklist', '/premium', '/help']
  });
}
