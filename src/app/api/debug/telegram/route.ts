import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  results.env = {
    hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
    hasChannelId: !!process.env.TELEGRAM_CHANNEL_ID,
    tokenPrefix: process.env.TELEGRAM_BOT_TOKEN?.substring(0, 8),
    channelId: process.env.TELEGRAM_CHANNEL_ID,
  };

  try {
    const me = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
      signal: AbortSignal.timeout(10000),
    });
    results.botInfo = await me.json();
  } catch (e: any) {
    results.botInfo = { error: e.message };
  }

  try {
    const chat = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=${process.env.TELEGRAM_CHANNEL_ID}`, {
      signal: AbortSignal.timeout(10000),
    });
    results.channelInfo = await chat.json();
  } catch (e: any) {
    results.channelInfo = { error: e.message };
  }

  try {
    const send = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        text: '━━━━━━━━━━━━━\n\n🧪 Test de diagnóstico — si ves esto, Telegram funciona correctamente.',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    });
    results.testMessage = await send.json();
  } catch (e: any) {
    results.testMessage = { error: e.message };
  }

  return NextResponse.json(results);
}
