import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { apiError } from '@/lib/api-schemas';
import { createLogger } from '@/lib/logger';

const log = createLogger('TripInvite');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const schema = z.object({
  tripId: z.string(),
  email: z.string().email('Email invalido'),
  shareLink: z.string().url(),
  tripName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return apiError('No auth', undefined, 401);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('No autenticado', undefined, 401);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError('Datos invalidos', parsed.error.message);

    const { tripId, email, shareLink, tripName } = parsed.data;

    if (!resend) {
      log.warn('Resend no configurado, invitacion no enviada', { email, tripId });
      return NextResponse.json({ success: false, error: 'Servicio de email no disponible' }, { status: 500 });
    }

    const senderName = user.email || 'Un viajero';

    const { data: shareData } = await supabase
      .from('shared_trips')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (shareData) {
      await supabase
        .from('trip_invitees')
        .insert({ share_id: shareData.id, email });
    }

    await resend.emails.send({
      from: 'Viaje con Inteligencia <notificaciones@viajeinteligencia.com>',
      to: email,
      subject: 'Invitacion a viaje: ' + tripName,
      html: [
        '<!DOCTYPE html>',
        '<html><head><meta charset="utf-8"></head>',
        '<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">',
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;"><tr><td align="center">',
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">',
        '<tr><td style="background:#0f172a;padding:24px;">',
        '<h1 style="color:#fff;font-size:20px;margin:0;">Invitacion a viaje</h1>',
        '<p style="color:#94a3b8;font-size:14px;margin:8px 0 0;">' + senderName + ' te invita a:</p>',
        '</td></tr>',
        '<tr><td style="background:#fff;padding:32px;text-align:center;">',
        '<p style="font-size:18px;font-weight:bold;color:#0f172a;margin:0 0 24px;">' + tripName + '</p>',
        '<a href="' + shareLink + '" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Ver viaje</a>',
        '<p style="font-size:12px;color:#94a3b8;margin-top:24px;">Has recibido esta invitacion a traves de Viaje con Inteligencia.</p>',
        '</td></tr>',
        '<tr><td style="background:#f1f5f9;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">',
        '<p style="color:#64748b;font-size:11px;margin:0;">Viaje con Inteligencia &mdash; www.viajeinteligencia.com</p>',
        '</td></tr></table></td></tr></table>',
        '</body></html>',
      ].join(''),
    });

    log.info('Invitacion enviada', { email, tripId });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error al enviar invitacion', error);
    return apiError('Error al enviar invitacion', undefined, 500);
  }
}
