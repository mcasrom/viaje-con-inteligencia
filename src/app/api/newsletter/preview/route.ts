import { NextResponse } from 'next/server';
import { collectNewsletterData, buildWeeklyEmailHtml } from '@/lib/newsletter-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  try {
    const issue = await Promise.race([
      collectNewsletterData(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: collectNewsletterData took >30s')), 30000)
      ),
    ]);
    const html = await buildWeeklyEmailHtml(issue);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
