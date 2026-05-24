import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('SEOCheck');

const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';

const DISALLOWED_PATHS = [
  '/api/', '/dashboard/', '/admin/', '/test-leaflet', '/api-endpoints',
  '/kpi', '/radius', '/relojes', '/lead-magnet', '/precio-api', '/reclamaciones',
];

const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BINGBOT_UA = 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)';

async function fetchAsBot(url: string, ua: string) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': ua },
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    return {
      url,
      status: res.status,
      ms: Date.now() - start,
      contentLength: text.length,
      hasNoindexHeader: res.headers.get('X-Robots-Tag')?.includes('noindex') || false,
      hasNoindexMeta: /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(text) ||
                      /<meta\s+name="googlebot"\s+content="[^"]*noindex/i.test(text),
      hasCanonical: /<link\s+rel="canonical"\s+href=/i.test(text),
      title: text.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || '',
      h1: text.match(/<h1[^>]*>([^<]*)<\/h1>/i)?.[1]?.trim() || '',
      snippet: text.replace(/<[^>]*>/g, '').trim().slice(0, 200),
      error: null,
    };
  } catch (e: any) {
    return { url, status: 0, ms: Date.now() - start, contentLength: 0, error: e.message, hasNoindexHeader: false, hasNoindexMeta: false, hasCanonical: false, title: '', h1: '', snippet: '' };
  }
}

async function checkGoogleCache(url: string): Promise<{ cached: boolean; date: string }> {
  try {
    const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}&strip=1&vwsrc=0`;
    const res = await fetch(cacheUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    if (res.status !== 200 || text.includes('no está disponible') || text.includes('not found') || text.includes('No se ha encontrado')) {
      return { cached: false, date: '' };
    }
    const dateMatch = text.match(/Se ha almacenado en caché[^<]*de\s+([^<]*)/i) ||
                      text.match(/cached[^<]*on\s+([^<]*)/i);
    return { cached: true, date: dateMatch?.[1]?.trim() || '' };
  } catch {
    return { cached: false, date: '' };
  }
}

export async function GET() {
  try {
    const results: any[] = [];
    const sitemapUrls: string[] = [];

    // Fetch sitemap
    try {
      const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(10000) });
      const sitemapText = await sitemapRes.text();
      const urlMatches = sitemapText.match(/<loc>([^<]+)<\/loc>/g) || [];
      for (const m of urlMatches) {
        const url = m.replace(/<\/?loc>/g, '');
        const path = new URL(url).pathname;
        if (!DISALLOWED_PATHS.some(p => path.startsWith(p))) {
          sitemapUrls.push(url);
        }
      }
    } catch (e: any) {
      log.warn('sitemap fetch failed', e);
    }

    const urlsToCheck = sitemapUrls.length > 0 ? sitemapUrls.slice(0, 30) : [`${BASE_URL}/`];

    for (const url of urlsToCheck) {
      const googlebot = await fetchAsBot(url, GOOGLEBOT_UA);
      const cache = await checkGoogleCache(url);
      const bing = await fetchAsBot(url, BINGBOT_UA);
      results.push({
        path: new URL(url).pathname,
        url,
        googlebot,
        bingbot: { status: bing.status, ms: bing.ms },
        cache,
        indexable: googlebot.status === 200 && !googlebot.hasNoindexHeader && !googlebot.hasNoindexMeta,
      });
    }

    // Cloudflare crawler stats (reuse existing analytics)
    let crawlerWeekly = 0;
    try {
      const cfRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
        headers: { 'User-Agent': 'seo-check' },
        signal: AbortSignal.timeout(5000),
      });
      const cfData = await cfRes.json();
      const weeks = cfData.weeks || cfData || [];
      if (Array.isArray(weeks) && weeks.length > 0) {
        crawlerWeekly = weeks[0]?.crawler_requests || 0;
      }
    } catch {}

    // PM2 access log count (only works on Hetzner)
    let pm2BotHits = 0;
    try {
      const { execSync } = require('child_process');
      const logs = execSync('pm2 logs viajeinteligencia --nostream --lines 3000 --raw 2>/dev/null', { timeout: 5000, encoding: 'utf-8' });
      const googleHits = (logs.match(/googlebot/i) || []).length;
      const bingHits = (logs.match(/bingbot/i) || []).length;
      pm2BotHits = googleHits + bingHits;
    } catch {}

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      totalChecked: results.length,
      indexable: results.filter(r => r.indexable).length,
      notIndexable: results.filter(r => !r.indexable).length,
      cached: results.filter(r => r.cache.cached).length,
      notCached: results.filter(r => !r.cache.cached).length,
      crawlerWeekly,
      pm2BotHits,
      results,
    });
  } catch (e: any) {
    log.error('Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
