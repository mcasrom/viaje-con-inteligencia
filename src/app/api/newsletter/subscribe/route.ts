import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : new Resend('re_123456789');

const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
const VERIFY_URL = `${BASE_URL}/api/newsletter/subscribe`;

const SUBSCRIBE_COOLDOWN = 3600 * 1000; // 1 hora

async function sendConfirmationEmail(email: string, name: string, verifyToken: string) {
  if (!resend) {
    console.log('RESEND_API_KEY not configured - confirmation email skipped');
    return;
  }

  const verifyLink = `${VERIFY_URL}?action=verify&token=${verifyToken}`;

  await resend.emails.send({
    from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
    to: email,
    subject: 'Confirma tu suscripción al Newsletter 📮',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa; margin: 0 0 16px;">🛫 Confirma tu suscripción</h1>
    
    <p style="color: #cbd5e1; font-size: 16px;">¡Hola${name ? ` ${name}` : ''}! 👋</p>
    
    <p style="color: #94a3b8; line-height: 1.6;">Alguien (esperamos que tú) ha solicitado suscribirse a nuestro newsletter semanal.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${verifyLink}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        ✅ Sí, quiero suscribirme
      </a>
    </div>

    <p style="color: #94a3b8; line-height: 1.6; font-size: 14px;">Una vez confirmado recibirás cada semana:</p>
    
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
      Si no solicitaste esta suscripción, simplemente ignora este email. No se te enviará nada más.
    </p>
    
    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
    
    <p style="color: #475569; font-size: 11px;">
      <strong>RGPD / LSSI:</strong> Tus datos solo se usarán para enviarte el newsletter. Puedes cancelar en cualquier momento.
    </p>
  </div>
</body>
</html>
    `,
  });
}

async function sendWelcomeEmail(email: string, name: string) {
  if (!resend) return;

  const unsubscribeLink = `${VERIFY_URL}?action=unsubscribe&token=${crypto.randomUUID()}`;

  await resend.emails.send({
    from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
    to: email,
    subject: '¡Bienvenido a Viaje con Inteligencia! 🎉',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa; margin: 0 0 16px;">🛫 ¡Suscripción confirmada!</h1>
    <p style="color: #cbd5e1; font-size: 16px;">¡Hola${name ? ` ${name}` : ''}! 👋</p>
    <p style="color: #94a3b8; line-height: 1.6;">Tu suscripción está activa. Cada semana recibirás alertas MAEC, consejos de seguridad y viajes baratos.</p>
    <div style="background: #1e3a5f; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #3b82f6;">
      <p style="color: #60a5fa; margin: 0 0 8px; font-weight: 600;">📱 Síguenos en Telegram</p>
      <p style="color: #cbd5e1; margin: 0; font-size: 14px;">Alertas instantáneas: <a href="https://t.me/ViajeConInteligencia" style="color: #60a5fa;">@ViajeConInteligencia</a></p>
    </div>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
      ¿No quieres recibir estos emails? <a href="/?newsletter=unsubscribed" style="color: #94a3b8; text-decoration: underline;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>
    `,
  });
}

function getCooldownKey(email: string): string {
  const now = new Date();
  return `newsletter_subscribe_${email.toLowerCase()}_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
}

function isRateLimited(email: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = getCooldownKey(email);
    const stored = localStorage.getItem(key);
    if (stored) {
      const elapsed = Date.now() - parseInt(stored, 10);
      if (elapsed < SUBSCRIBE_COOLDOWN) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function setRateLimit(email: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getCooldownKey(email), String(Date.now()));
  } catch {}
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
            { email, name, verify_token: verifyToken, verified: false, source: source || 'web' },
            { onConflict: 'email' }
          );
      } catch (e) {
        console.log('Supabase error (ignorado):', e);
      }
    }

    await sendConfirmationEmail(email, name || '', verifyToken);

    return NextResponse.json({ 
      success: true, 
      message: 'Revisa tu email para confirmar la suscripción.' 
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

  if (action === 'unsubscribe' && token) {
    if (supabase) {
      // Try token-based unsubscribe first
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('verify_token', token)
        .single();

      if (data) {
        await supabase
          .from('newsletter_subscribers')
          .update({ verified: false, unsubscribed_at: new Date().toISOString() })
          .eq('verify_token', token);
      } else {
        // Fallback: email-based unsubscribe (base64 encoded)
        try {
          const email = Buffer.from(decodeURIComponent(token), 'base64').toString('utf-8');
          await supabase
            .from('newsletter_subscribers')
            .update({ verified: false, unsubscribed_at: new Date().toISOString() })
            .eq('email', email);
        } catch {
          // Invalid token
        }
      }
    }
    return NextResponse.redirect(new URL('/?newsletter=unsubscribed', request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}