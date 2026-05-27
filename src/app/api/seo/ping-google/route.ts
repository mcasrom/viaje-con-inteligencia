import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('SEOPing');

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { engine: string; status: number; ok: boolean }[] = [];
  const sitemapUrl = 'https://www.viajeinteligencia.com/sitemap.xml';

  // Ping Google
  try {
    const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const res = await fetch(googleUrl, { signal: AbortSignal.timeout(10000) });
    results.push({ engine: 'google', status: res.status, ok: res.ok });
    log.info(`Google ping: ${res.status}`);
  } catch (e: any) {
    results.push({ engine: 'google', status: 0, ok: false });
    log.error(`Google ping error: ${e.message}`);
  }

  // Ping Bing (IndexNow)
  try {
    const bingBody = { url: sitemapUrl, key: '79B687F3E7391A245058BD02622B5D5D' };
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bingBody),
      signal: AbortSignal.timeout(10000),
    });
    results.push({ engine: 'bing', status: res.status, ok: res.ok });
    log.info(`Bing ping: ${res.status}`);
  } catch (e: any) {
    results.push({ engine: 'bing', status: 0, ok: false });
    log.error(`Bing ping error: ${e.message}`);
  }

  return NextResponse.json({ ok: results.every(r => r.ok), results });
}
