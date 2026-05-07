import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!resend) {
      return NextResponse.json({ status: 'skipped', reason: 'No Resend API key' });
    }

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, trial_end, is_premium, username')
      .eq('is_premium', false)
      .not('trial_end', 'is', null)
      .not('trial_end', 'eq', '')
      .filter('trial_end', 'gte', now.toISOString())
      .filter('trial_end', 'lte', twoDaysFromNow.toISOString());

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ status: 'ok', sent: 0, message: 'No trials expiring soon' });
    }

    let sentCount = 0;
    const results = [];

    for (const profile of profiles) {
      const trialEnd = new Date(profile.trial_end);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiringToday = trialEnd <= today;

      try {
        await resend.emails.send({
          from: 'Viaje con Inteligencia <notificaciones@viajeinteligencia.com>',
          to: profile.email,
          subject: isExpiringToday
            ? '⏰ Tu prueba gratuita termina HOY'
            : `⏰ Tu prueba gratuita termina en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 32px; text-align: center;">
                <h1 style="color: #f59e0b; font-size: 24px; margin: 0 0 16px;">
                  ${isExpiringToday ? '⏰ ¡Tu prueba termina HOY!' : '⏰ Tu prueba gratuita termina pronto'}
                </h1>
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Hola${profile.username ? ` ${profile.username}` : ''}, tu prueba gratuita de Viaje con Inteligencia 
                  termina ${isExpiringToday ? 'hoy' : `en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`}.
                </p>
                <div style="background: #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
                  <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">Lo que perderás:</p>
                  <ul style="color: #e2e8f0; font-size: 14px; margin: 0; padding-left: 20px;">
                    <li>Chat IA ilimitado con modelo 70b</li>
                    <li>Planificador de itinerarios IA</li>
                    <li>Alertas de riesgo en tiempo real</li>
                    <li>Mapa de sismos USGS en vivo</li>
                    <li>Dashboard de KPIs de seguridad</li>
                    <li>ML Clustering de destinos</li>
                  </ul>
                </div>
                <a href="${BASE_URL}/premium" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); 
                          color: #0f172a; padding: 14px 32px; border-radius: 12px; text-decoration: none; 
                          font-weight: bold; font-size: 16px;">
                  Activar Premium — 7 días gratis
                </a>
                <p style="color: #64748b; font-size: 12px; margin: 16px 0 0;">
                  Sin tarjeta · Cancela cuando quieras · Acceso inmediato
                </p>
              </div>
            </div>
          `,
        });

        sentCount++;
        results.push({ email: profile.email, status: 'sent', daysLeft });
      } catch (emailError: any) {
        results.push({ email: profile.email, status: 'failed', error: emailError.message });
      }
    }

    return NextResponse.json({
      status: 'ok',
      sent: sentCount,
      total: profiles.length,
      results,
    });
  } catch (err: any) {
    console.error('Trial notifications error:', err);
    return NextResponse.json({ status: 'error', message: err.message });
  }
}
