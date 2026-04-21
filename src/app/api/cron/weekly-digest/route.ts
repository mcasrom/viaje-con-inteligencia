import { NextResponse } from 'next/server';
import { generateWeeklyDigest } from '@/lib/alerts-system';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const LAST_RUN_KEY = 'last_weekly_digest';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.viajeinteligencia.com';

async function sendToChannel(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log('[Cron] Telegram no configurado');
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
    return result.ok;
  } catch (error) {
    console.error('[Cron] Error Telegram:', error);
    return false;
  }
}

async function sendWeeklyDigestEmails(digest: string) {
  if (!resend || !supabase) {
    console.log('[Cron] Email no configurado');
    return;
  }

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email, name, verify_token')
    .eq('verified', true)
    .is('unsubscribed_at', null);

  if (!subscribers || subscribers.length === 0) {
    console.log('[Cron] No hay suscriptores verificados');
    return;
  }

  const unsubscribeUrl = (token: string) => 
    `${BASE_URL}/api/newsletter/subscribe?action=unsubscribe&token=${token}`;

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
        to: sub.email,
        subject: '📬 Resumen Semanal - Viaje con Inteligencia',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa; margin: 0 0 16px;">📰 Resumen Semanal</h1>
    <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0; white-space: pre-wrap; font-size: 14px; color: #cbd5e1; line-height: 1.6;">${digest}</div>
    <div style="background: #1e3a5f; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="color: #60a5fa; margin: 0 0 8px; font-weight: 600;">📱 Síguenos en Telegram</p>
      <a href="https://t.me/ViajeConInteligencia" style="color: #60a5fa;">@ViajeConInteligencia</a>
    </div>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
      ¿No quieres recibir estos emails? 
      <a href="${unsubscribeUrl(sub.verify_token)}" style="color: #94a3b8; text-decoration: underline;">Cancela la suscripción</a>
    </p>
  </div>
</body>
</html>
        `,
      });
    } catch (err) {
      console.error('[Cron] Error email a', sub.email, err);
    }
  }
  console.log('[Cron] Emails enviados:', subscribers.length);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Ejecutando digest semanal...');
    const digest = await generateWeeklyDigest();
    
    const telegramSent = await sendToChannel(digest);
    await sendWeeklyDigestEmails(digest);
    
    return NextResponse.json({
      success: true,
      telegram: telegramSent ? 'enviado' : 'no configurado',
      email: resend ? 'enviando...' : 'no configurado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
