import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('SetTelegramWebhook');

export async function POST(request: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN no configurado' }, { status: 500 });
    }

    const { url } = await request.json();
    const webhookUrl = url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/api/telegram`;

    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'inline_query', 'callback_query'],
        drop_pending_updates: true,
      }),
    });

    const data = await res.json();
    log.info(`Webhook set to ${webhookUrl}: ${data.description}`);

    return NextResponse.json({ ok: data.ok, description: data.description, url: webhookUrl });
  } catch (error) {
    log.error('Error setting webhook', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN no configurado' }, { status: 500 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();

    return NextResponse.json({
      ok: data.ok,
      url: data.result?.url || '(none)',
      pending_updates: data.result?.pending_update_count || 0,
      last_error: data.result?.last_error_message || null,
      is_set: !!data.result?.url,
    });
  } catch (error) {
    log.error('Error getting webhook info', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
