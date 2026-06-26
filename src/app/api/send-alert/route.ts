import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ALLOWED_SECRET = process.env.CRON_SECRET || '';

export async function POST(req: Request) {
  try {
    const { secret, to, subject, html } = await req.json();
    if (!secret || secret !== ALLOWED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const result = await resend.emails.send({
      from: 'ThreatRadar SOC <alerts@viajeinteligencia.com>',
      to, subject, html
    });
    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
