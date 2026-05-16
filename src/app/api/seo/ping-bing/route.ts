import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/config';

const BING_PING = 'https://www.bing.com/ping';
const INDEXNOW_URL = 'https://www.bing.com/indexnow';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const pingRes = await fetch(`${BING_PING}?sitemap=${encodeURIComponent(sitemapUrl)}`, {
      signal: AbortSignal.timeout(15000),
    });
    results.ping = { status: pingRes.status, ok: pingRes.ok };
  } catch (e: any) {
    results.ping = { error: e.message };
  }

  return NextResponse.json(results);
}
