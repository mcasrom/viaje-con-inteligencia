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
  const greeting = name ? `Hola ${name}` : 'Hola';

  await resend.emails.send({
    from: 'Miguel Castillo <newsletter@viajeinteligencia.com>',
    to: email,
    subject: 'Confirma tu suscripcion — Viaje con Inteligencia',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root{color-scheme:light;supported-color-schemes:light;}</style>
</head>
<body style="margin:0;padding:0;background:#f8fafc !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a !important;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px;">
          <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
          <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">Confirma tu suscripcion</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0;">Un paso mas para recibir inteligencia de viaje cada semana</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;text-align:center;">
          <p style="font-size:16px;color:#334155;margin:0 0 8px;">${greeting},</p>
          <p style="font-size:14px;color:#64748b;margin:0 0 24px;">Haz clic para activar tu suscripcion y empezar a recibir el briefing semanal:</p>
          <a href="${verifyLink}" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Activar suscripcion
          </a>
          <p style="font-size:12px;color:#94a3b8;margin-top:24px;">Si no solicitaste esto, ignora el email.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f1f5f9;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:11px;margin:0;">Solo inteligencia aplicada al viaje.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });
}

async function sendWelcomeEmail(email: string, name: string) {
  if (!resend) return;

  const greeting = name ? `Hola ${name},` : 'Hola,';

  await resend.emails.send({
    from: 'Miguel Castillo <newsletter@viajeinteligencia.com>',
    to: email,
    subject: 'Bienvenido — solo inteligencia aplicada al viaje',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root{color-scheme:light;supported-color-schemes:light;}</style>
</head>
<body style="margin:0;padding:0;background:#f8fafc !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a !important;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px;">
          <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
          <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">Tu suscripcion esta confirmada</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0;">Cada lunes recibiras tu briefing semanal de inteligencia de viaje</p>
        </td></tr>

        <!-- Founder message -->
        <tr><td style="background:#ffffff;padding:24px;border-bottom:1px solid #e2e8f0;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;font-weight:bold;">M</div>
            <div>
              <div style="font-size:15px;font-weight:bold;color:#0f172a;">Miguel Castillo</div>
              <div style="font-size:12px;color:#64748b;">Fundador</div>
            </div>
          </div>
          <div style="border-left:3px solid #3b82f6;padding-left:16px;">
            <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">${greeting}</p>
            <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Creé esta plataforma porque me cansé de consultar diez webs distintas antes de cada viaje: alertas del MAEC por un lado, precios de vuelos cambiando cada día, noticias sobre conflictos internacionales en otra página y experiencias dispersas en distintos foros.</p>
            <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Mientras aumentan las tensiones entre Irán, Estados Unidos e Israel, los precios del petróleo y de los vuelos vuelven a dispararse, generando incertidumbre para millones de viajeros.</p>
            <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 8px;">Por eso construí un sistema que reúne información útil, contexto y datos reales en un solo lugar.</p>
            <p style="font-size:14px;color:#0f172a;line-height:1.7;margin:0;"><strong>El compromiso es sencillo: transparencia total, sin publicidad invasiva y sin venderte viajes. Solo inteligencia aplicada al viaje.</strong></p>
          </div>
        </td></tr>

        <!-- What you'll receive -->
        <tr><td style="background:#ffffff;padding:24px;border-bottom:1px solid #e2e8f0;">
          <h2 style="font-size:16px;font-weight:bold;color:#0f172a;margin:0 0 16px;">Que recibiras cada semana</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;width:40px;"><span style="display:inline-block;width:32px;height:32px;background:#fef2f2;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🔴</span></td>
              <td style="padding:8px 0 8px 12px;"><strong style="font-size:14px;color:#0f172a;">Alertas de riesgo</strong><br><span style="font-size:13px;color:#64748b;">Cambios MAEC, incidentes activos, que hacer</span></td>
            </tr>
            <tr>
              <td style="padding:8px 0;width:40px;"><span style="display:inline-block;width:32px;height:32px;background:#f0fdf4;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">💰</span></td>
              <td style="padding:8px 0 8px 12px;"><strong style="font-size:14px;color:#0f172a;">Evolucion de precios</strong><br><span style="font-size:13px;color:#64748b;">Petroleo, vuelos, coste real por destino</span></td>
            </tr>
            <tr>
              <td style="padding:8px 0;width:40px;"><span style="display:inline-block;width:32px;height:32px;background:#eff6ff;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🌍</span></td>
              <td style="padding:8px 0 8px 12px;"><strong style="font-size:14px;color:#0f172a;">Destino de la semana</strong><br><span style="font-size:13px;color:#64748b;">IRV, coste, clima, para quien es ideal</span></td>
            </tr>
            <tr>
              <td style="padding:8px 0;width:40px;"><span style="display:inline-block;width:32px;height:32px;background:#f5f3ff;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">❓</span></td>
              <td style="padding:8px 0 8px 12px;"><strong style="font-size:14px;color:#0f172a;">Pregunta respondida con datos</strong><br><span style="font-size:13px;color:#64748b;">"¿Es seguro viajar a X?" con IRV y analisis</span></td>
            </tr>
          </table>
        </td></tr>

        <!-- Quick links -->
        <tr><td style="background:#ffffff;padding:24px;">
          <h2 style="font-size:16px;font-weight:bold;color:#0f172a;margin:0 0 16px;">Empieza aqui</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;">
                <a href="https://www.viajeinteligencia.com/osint" style="color:#3b82f6;text-decoration:none;font-size:14px;">📊 Ver inteligencia en vivo (/osint)</a>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <a href="https://www.viajeinteligencia.com/decidir" style="color:#3b82f6;text-decoration:none;font-size:14px;">🎯 ¿A dónde voy? (/decidir)</a>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <a href="https://www.viajeinteligencia.com/coste" style="color:#3b82f6;text-decoration:none;font-size:14px;">💰 Calculadora de costes (/coste)</a>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <a href="https://www.viajeinteligencia.com/manifiesto" style="color:#3b82f6;text-decoration:none;font-size:14px;">📝 Mi historia completa (/manifiesto)</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f1f5f9;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Viaje con Inteligencia · datos OSINT · 107 países · actualizacion semanal</p>
          <p style="margin:0;">
            <a href="https://www.viajeinteligencia.com" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Web</a>
            <a href="https://t.me/ViajeConInteligencia" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Telegram</a>
            <a href="https://www.viajeinteligencia.com/api/newsletter/subscribe?action=unsubscribe&email=${encodeURIComponent(email)}" style="color:#64748b;text-decoration:underline;font-size:12px;margin:0 8px;">Cancelar</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
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

    if (supabase) {
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('verified')
        .eq('email', emailLower)
        .single();

      if (existing?.verified) {
        return NextResponse.json({ success: true, message: 'Ya estás suscrito al newsletter.' });
      }
    }

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
      .select('email, name, verified')
      .eq('verify_token', token)
      .single();

    if (data && !data.verified) {
      await supabase
        .from('newsletter_subscribers')
        .update({ verified: true, verify_token: null })
        .eq('email', data.email);

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
