import { NextResponse } from 'next/server';
import { generateWeeklyDigest } from '@/lib/alerts-system';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function sendToChannel(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log('[Cron] Credenciales no configuradas');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    const result = await response.json();
    console.log('[Cron] Digest enviado:', result.ok);
    return result.ok;
  } catch (error) {
    console.error('[Cron] Error:', error);
    return false;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Ejecutando digest semanal...');
    const digest = generateWeeklyDigest();
    const sent = await sendToChannel(digest);
    
    return NextResponse.json({
      success: sent,
      message: 'Digest semanal enviado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
