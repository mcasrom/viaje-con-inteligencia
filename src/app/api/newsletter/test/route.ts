import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { collectNewsletterData, buildWeeklyEmailHtml } from '@/lib/newsletter-generator';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!resend) return NextResponse.json({ error: 'No resend API key' }, { status: 500 });

    const url = new URL(request.url);
    const toEmail = url.searchParams.get('to') || 'info@viajeinteligencia.com';

    const issue = await collectNewsletterData();
    const html = (await buildWeeklyEmailHtml(issue)).replace('{{EMAIL}}', encodeURIComponent(toEmail));

    const result = await resend.emails.send({
      from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
      to: toEmail,
      subject: `[TEST] Briefing Semanal #${issue.edition} — ${issue.weekDate}`,
      html,
    });

    return NextResponse.json({
      success: true,
      sent_to: toEmail,
      resend_id: result.data?.id,
      edition: issue.edition,
      stats: {
        newAlerts: issue.newAlerts,
        irvChanges: issue.irvChanges,
        stableCountries: issue.stableCountries,
        countryAlerts: issue.countryAlerts.length,
        hasDestination: !!issue.destinationSpotlight,
        hasQA: !!issue.weeklyQuestion,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
