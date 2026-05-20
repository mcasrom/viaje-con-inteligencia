import { Resend } from 'resend';
import { supabaseAdmin } from './supabase-admin';
import { createLogger } from './logger';

const log = createLogger('Onboarding');
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';

function emailBase(htmlContent: string, extraStyles?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>:root{color-scheme:light;supported-color-schemes:light;}${extraStyles || ''}</style>
</head>
<body style="margin:0;padding:0;background:#f8fafc !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a !important;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        ${htmlContent}
        <tr><td style="background:#f1f5f9;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Viaje con Inteligencia · datos OSINT · inteligencia aplicada al viaje</p>
          <p style="margin:0;">
            <a href="${BASE_URL}" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Web</a>
            <a href="https://t.me/ViajeConInteligencia" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Telegram</a>
            <a href="${BASE_URL}/dashboard" style="color:#3b82f6;text-decoration:none;font-size:12px;margin:0 8px;">Dashboard</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function email1Html(name: string): string {
  return emailBase(`
    <tr><td style="background:#0f172a;padding:24px;">
      <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
      <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">Tu radar de viaje te espera</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Bienvenido, ${name || 'viajero'}</p>
    </td></tr>
    <tr><td style="background:#ffffff;padding:24px;">
      <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
        Acabas de registrarte en Viaje con Inteligencia. Tienes acceso a un radar de seguridad global con
        <strong>137 países monitorizados</strong> en tiempo real.
      </p>
      <h2 style="font-size:16px;font-weight:bold;color:#0f172a;margin:0 0 12px;">Primer paso: configura tu radar</h2>
      <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
        Añade los países que tienes en mente para tu próximo viaje. El radar te mostrará el nivel de riesgo
        actual, proyección a 12 meses y alertas personalizadas.
      </p>
      <a href="${BASE_URL}/dashboard/radar" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Configurar radar
      </a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px;">2 clics y tienes tu primer país monitorizado.</p>
    </td></tr>
  `);
}

function email2Html(name: string): string {
  return emailBase(`
    <tr><td style="background:#0f172a;padding:24px;">
      <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
      <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">Alertas activas esta semana</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Movimiento global de riesgo</p>
    </td></tr>
    <tr><td style="background:#ffffff;padding:24px;">
      <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
        Hola ${name || 'viajero'}, estas son algunas alertas activas que el sistema ha detectado esta semana:
      </p>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:bold;color:#991b1b;">🔴 Riesgo muy-alto</div>
        <div style="font-size:12px;color:#7f1d1d;">Países con nivel de riesgo elevado esta semana</div>
      </div>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:bold;color:#92400e;">🟡 Cambios de nivel</div>
        <div style="font-size:12px;color:#78350f;">Países que han cambiado su nivel de riesgo recientemente</div>
      </div>
      <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:bold;color:#1e40af;">🔵 Incidentes activos</div>
        <div style="font-size:12px;color:#1e3a5f;">Eventos disruptivos monitorizados en tiempo real</div>
      </div>
      <a href="${BASE_URL}/alertas" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Activar alertas personalizadas
      </a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px;">Recibe notificaciones solo de los países que te interesan.</p>
    </td></tr>
  `);
}

function email3Html(name: string): string {
  return emailBase(`
    <tr><td style="background:#0f172a;padding:24px;">
      <div style="font-size:12px;color:#60a5fa;font-weight:600;margin-bottom:4px;">Viaje con Inteligencia</div>
      <h1 style="color:#ffffff;font-size:22px;margin:8px 0 4px;">¿Qué predice la IA para tus destinos?</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Predicciones basadas en machine learning</p>
    </td></tr>
    <tr><td style="background:#ffffff;padding:24px;">
      <p style="font-size:14px;color:#334155;line-height:1.7;margin:0 0 16px;">
        Hola ${name || 'viajero'}, el modelo de IA del sistema analiza 25 variables por país para predecir
        la evolución del riesgo. Estas son las predicciones actuales:
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:12px 16px;border-radius:8px;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:bold;color:#166534;">📈 Pronóstico a 7 días</div>
        <div style="font-size:12px;color:#14532d;">Probabilidad de aumento de riesgo por país, calculada con random forest entrenado con datos históricos</div>
      </div>
      <div style="background:#f5f3ff;border-left:4px solid #8b5cf6;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:bold;color:#4c1d95;">🔮 Score IRV personalizado</div>
        <div style="font-size:12px;color:#3b0764;">Índice de Riesgo de Viaje ajustado por tu perfil de viajero, estacionalidad y coste</div>
      </div>
      <a href="${BASE_URL}/dashboard/radar" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Ver predicciones
      </a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px;">Las predicciones se actualizan diariamente con nuevos datos OSINT.</p>
    </td></tr>
  `);
}

export async function createOnboardingEntry(userId: string, email: string, name?: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('onboarding_queue').insert({
      user_id: userId,
      email: email.toLowerCase(),
      name: name || null,
    });
    if (error) {
      log.error('Error creating onboarding entry', error);
      return false;
    }
    log.info(`Onboarding entry created for ${email}`);
    return true;
  } catch (err) {
    log.error('Error creating onboarding entry', err);
    return false;
  }
}

async function sendAndMark(email: string, name: string | undefined, subject: string, htmlFn: (n: string) => string, field: 'email_1_sent' | 'email_2_sent' | 'email_3_sent', fieldAt: 'email_1_sent_at' | 'email_2_sent_at' | 'email_3_sent_at'): Promise<boolean> {
  if (!resend) {
    log.warn('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  const greeting = name ? name.split(' ')[0] : 'Viajero';

  try {
    await resend.emails.send({
      from: 'Miguel Castillo <newsletter@viajeinteligencia.com>',
      to: email,
      subject,
      html: htmlFn(greeting),
    });

    await supabaseAdmin
      .from('onboarding_queue')
      .update({ [field]: true, [fieldAt]: new Date().toISOString() })
      .eq('email', email);

    log.info(`${field} sent to ${email}`);
    return true;
  } catch (err) {
    log.error(`Error sending ${field} to ${email}`, err);
    return false;
  }
}

export async function sendEmail1(email: string, name?: string): Promise<boolean> {
  return sendAndMark(email, name, 'Tu radar de viaje te espera — Viaje con Inteligencia', email1Html, 'email_1_sent', 'email_1_sent_at');
}

export async function sendEmail2(email: string, name?: string): Promise<boolean> {
  return sendAndMark(email, name, 'Alertas activas esta semana — Viaje con Inteligencia', email2Html, 'email_2_sent', 'email_2_sent_at');
}

export async function sendEmail3(email: string, name?: string): Promise<boolean> {
  return sendAndMark(email, name, '¿Qué predice la IA para tus destinos? — Viaje con Inteligencia', email3Html, 'email_3_sent', 'email_3_sent_at');
}

export async function processOnboardingQueue(): Promise<{ email1: number; email2: number; email3: number }> {
  const result = { email1: 0, email2: 0, email3: 0 };
  if (!supabaseAdmin) return result;

  const now = new Date();
  const day3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const { data: pending1 } = await supabaseAdmin
      .from('onboarding_queue')
      .select('email, name')
      .eq('email_1_sent', false);

    for (const row of pending1 || []) {
      await sendEmail1(row.email, row.name || undefined);
      result.email1++;
    }

    const { data: pending2 } = await supabaseAdmin
      .from('onboarding_queue')
      .select('email, name, created_at')
      .eq('email_1_sent', true)
      .eq('email_2_sent', false)
      .lt('created_at', day3.toISOString());

    for (const row of pending2 || []) {
      await sendEmail2(row.email, row.name || undefined);
      result.email2++;
    }

    const { data: pending3 } = await supabaseAdmin
      .from('onboarding_queue')
      .select('email, name, created_at')
      .eq('email_2_sent', true)
      .eq('email_3_sent', false)
      .lt('created_at', day7.toISOString());

    for (const row of pending3 || []) {
      await sendEmail3(row.email, row.name || undefined);
      result.email3++;
    }
  } catch (err) {
    log.error('Error processing onboarding queue', err);
  }

  return result;
}
