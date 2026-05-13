import { NextResponse } from 'next/server';
import { collectNewsletterData, buildWeeklyEmailHtml } from '@/lib/newsletter-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const issue = await collectNewsletterData();
    const html = await buildWeeklyEmailHtml(issue);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
