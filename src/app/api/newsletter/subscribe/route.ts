import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
const VERIFY_URL = `${BASE_URL}/api/newsletter/subscribe`;

async function sendConfirmationEmail(email: string, name: string, verifyToken: string) {
  if (!resend) {
    console.log('RESEND_API_KEY not configured');
    return;
  }

  const verifyLink = `${VERIFY_URL}?action=verify&token=${verifyToken}`;

  await resend.emails.send({
    from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
    to: email,
    subject: 'Confirma tu suscripción al Newsletter',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa;">Confirma tu suscripción</h1>
    <p>Hola${name ? ` ${name}` : ''}</p>
    <p>Haz clic en el botón para activar tu suscripción:</p>
    <a href="${verifyLink}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Activar suscripción
    </a>
    <p style="font-size: 12px; margin-top: 24px;">Si no solicitaste esto, ignora el email.</p>
  </div>
</body>
</html>
    `,
  });
}

async function sendWelcomeEmail(email: string, name: string) {
  if (!resend) return;

  await resend.emails.send({
    from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
    to: email,
    subject: '¡Bienvenido a Viaje con Inteligencia!',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa;">Bienvenido</h1>
    <p>Hola${name ? ` ${name}` : ''}, tu suscripción está confirmada y activa.</p>
    <p style="font-size: 12px; margin-top: 24px;">Para cancelar, responde a cualquier email.</p>
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

    const emailLower = email.toLowerCase();
    const verifyToken = crypto.randomUUID();

    if (supabase) {
      await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email: emailLower, name, verify_token: verifyToken, verified: false, source: source || 'web', subscribed_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
    }

    await sendConfirmationEmail(emailLower, name || '', verifyToken);

    return NextResponse.json({ success: true, message: 'Revisa tu email para confirmar la suscripción.' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const token = searchParams.get('token');

  if (action === 'verify' && token && supabase) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('verify_token', token)
      .single();

    if (data) {
      await supabase
        .from('newsletter_subscribers')
        .update({ verified: true, verify_token: null })
        .eq('verify_token', token);

      await sendWelcomeEmail(data.email, data.name || '');
    }

    return NextResponse.redirect(new URL('/?newsletter=verified', request.url));
  }

  if (action === 'unsubscribe' && supabase) {
    const email = searchParams.get('email');
    if (email) {
      await supabase
        .from('newsletter_subscribers')
        .update({ verified: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());
    }
    return NextResponse.redirect(new URL('/?newsletter=unsubscribed', request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}
