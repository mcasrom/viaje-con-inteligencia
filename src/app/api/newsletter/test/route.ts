import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { collectWeeklyData, generateWeeklyContent, buildWeeklyEmailHtml } from '@/lib/newsletter-generator';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!resend) return NextResponse.json({ error: 'No resend API key' }, { status: 500 });

    // Allow overriding email via query param, default to admin
    const url = new URL(request.url);
    const toEmail = url.searchParams.get('to') || 'info@viajeinteligencia.com';
    const name = url.searchParams.get('name') || 'Usuario';

    const { subscribers, digestData } = await collectWeeklyData();
    const content = await generateWeeklyContent(digestData);
    const weekDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const html = (await buildWeeklyEmailHtml(name, content, weekDate)).replace('{{EMAIL}}', encodeURIComponent(toEmail));

    const result = await resend.emails.send({
      from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
      to: toEmail,
      subject: `[TEST] Resumen Semanal — ${weekDate}`,
      html,
    });

    return NextResponse.json({
      success: true,
      sent_to: toEmail,
      resend_id: result.data?.id,
      subs_found: subscribers.length,
      digest: {
        riskChanges: digestData.riskChanges.length,
        signals: digestData.topSignals.length,
        destination: digestData.destination.name,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
