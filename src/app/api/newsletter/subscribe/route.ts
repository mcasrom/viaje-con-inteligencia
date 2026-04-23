import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : new Resend('re_123456789');

const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
const UNSUCRIBE_URL = `${BASE_URL}/api/newsletter/subscribe`;

async function sendWelcomeEmail(email: string, name: string, verifyToken: string) {
  if (!resend) {
    console.log('RESEND_API_KEY not configured - email skipped');
    return;
  }

  const unsubscribeLink = `${UNSUCRIBE_URL}?action=unsubscribe&token=${verifyToken}`;

  await resend.emails.send({
    from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
    to: email,
    subject: 'Bienvenido a Viaje con Inteligencia 📮',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa; margin: 0 0 16px;">🛫 Viaje con Inteligencia</h1>
    
    <p style="color: #cbd5e1; font-size: 16px;">¡Hola${name ? ` ${name}` : ''}! 👋</p>
    
    <p style="color: #94a3b8; line-height: 1.6;">Gracias por suscribirte. Cada semana recibirás:</p>
    
    <ul style="color: #94a3b8; line-height: 1.8;">
      <li>📰 Últimas alertas de viaje del MAEC</li>
      <li>🛡️ Recomendaciones de seguridad</li>
      <li>💰 Consejos para viajar barato</li>
    </ul>

    <div style="background: #1e3a5f; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #3b82f6;">
      <p style="color: #60a5fa; margin: 0 0 8px; font-weight: 600;">📱 Síguenos en Telegram</p>
      <p style="color: #cbd5e1; margin: 0; font-size: 14px;">
       Únete a nuestro canal para alertas instantáneas: 
        <a href="https://t.me/ViajeConInteligencia" style="color: #60a5fa;">@ViajeConInteligencia</a>
      </p>
    </div>

    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
      ¿No quieres recibir estos emails? 
      <a href="${unsubscribeLink}" style="color: #94a3b8; text-decoration: underline;">Cancela la suscripción</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
    
    <p style="color: #475569; font-size: 11px;">
      <strong>Derecho a darte de baja:</strong> Según el RGPD y la LSSI, puedes cancelar tu suscripción en cualquier momento 
      haciendo clic en el enlace anterior. Tus datos serán eliminados en un plazo máximo de 30 días.
    </p>
  </div>
</body>
</html>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const verifyToken = crypto.randomUUID();
    
    if (supabase) {
      try {
        await supabase
          .from('newsletter_subscribers')
          .upsert(
            { email, name, verify_token: verifyToken, verified: true, source: source || 'web' },
            { onConflict: 'email' }
          );
      } catch (e) {
        console.log('Supabase error (ignorado):', e);
      }
    }

    await sendWelcomeEmail(email, name || '', verifyToken);

    return NextResponse.json({ 
      success: true, 
      message: 'Te has suscrito correctamente. Revisa tu email.' 
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (action === 'verify' && token && supabase) {
    await supabase
      .from('newsletter_subscribers')
      .update({ verified: true, verify_token: null })
      .eq('verify_token', token);
    return NextResponse.redirect(new URL('/?newsletter=verified', request.url));
  }

  if (action === 'unsubscribe' && token) {
    if (supabase) {
      await supabase
        .from('newsletter_subscribers')
        .update({ verified: false, unsubscribed_at: new Date().toISOString() })
        .eq('verify_token', token);
    }
    return NextResponse.redirect(new URL('/?newsletter=unsubscribed', request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}