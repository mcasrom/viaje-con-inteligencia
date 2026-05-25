import { createLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SITE_URL } from '@/lib/config';

const log = createLogger('HealthCheck');

export interface HealthResult {
  service: string;
  status: 'ok' | 'warn' | 'fail';
  latencyMs: number | null;
  error?: string;
  lastOk?: string;
}

const BASES = ['https://www.viajeinteligencia.com', 'https://viajeinteligencia.com'];

export async function runHealthChecks(): Promise<HealthResult[]> {
  const results: HealthResult[] = [];

  async function check(label: string, fn: () => Promise<boolean>, timeoutMs = 10000) {
    const start = Date.now();
    try {
      const ok = await Promise.race([
        fn(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), timeoutMs)),
      ]);
      results.push({
        service: label,
        status: ok ? 'ok' : 'fail',
        latencyMs: Date.now() - start,
        ...(ok ? {} : { error: 'Timeout or failure' }),
      });
    } catch (e: any) {
      results.push({
        service: label,
        status: 'fail',
        latencyMs: Date.now() - start,
        error: e.message?.slice(0, 120),
      });
    }
  }

  // === KEY PAGES ===
  for (const base of BASES) {
    await check(`${base}/`, () =>
      fetch(`${base}/`, { signal: AbortSignal.timeout(8000) }).then(r => r.ok || r.status === 404)
    );
    await check(`${base}/sitemap.xml`, () =>
      fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(8000) }).then(r => r.ok)
    );
  }

  await check('/api routes smoke', async () => {
    const routes = ['/api/v1/countries/search?q=es', '/api/indices', '/api/flights/delays'];
    for (const r of routes) {
      const res = await fetch(`${SITE_URL}${r}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return false;
    }
    return true;
  });

  // === EXTERNAL APIS ===
  await check('Telegram Bot', () =>
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
      signal: AbortSignal.timeout(8000),
    }).then(r => r.json().then(j => j.ok === true))
  );

  await check('Mastodon API', () =>
    fetch('https://mastodon.social/api/v1/instance', { signal: AbortSignal.timeout(8000) }).then(r => r.ok)
  );

  await check('Bluesky API', () =>
    fetch('https://bsky.social/xrpc/com.atproto.server.describeServer', { signal: AbortSignal.timeout(8000) }).then(r => r.ok)
  );

  await check('Supabase', async () => {
    const { error } = await supabaseAdmin.from('paises').select('codigo').limit(1);
    return !error;
  });

  await check('Groq API', () => {
    if (!process.env.GROQ_API_KEY) return Promise.resolve(false);
    return fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(8000),
    }).then(r => r.ok);
  });

  await check('Resend API', () => {
    if (!process.env.RESEND_API_KEY) return Promise.resolve(false);
    return fetch('https://api.resend.com/emails', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(8000),
    }).then(r => r.status < 500);
  });

  await check('OpenSky Network', () =>
    fetch('https://opensky-network.org/api/states/all?lamin=40&lamax=45&lomin=-10&lomax=5', {
      signal: AbortSignal.timeout(10000),
    }).then(r => r.ok)
  );

  await check('US State Dept scrape', () =>
    fetch('https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/', {
      signal: AbortSignal.timeout(15000),
    }).then(r => r.ok)
  );

  await check('Bing IndexNow key file', () =>
    fetch(`${SITE_URL}/912cddcf-839d-4bee-a628-4c8cfd81c843.txt`, {
      signal: AbortSignal.timeout(8000),
    }).then(r => r.ok)
  );

  log.info(`Health checks: ${results.filter(r => r.status === 'ok').length}/${results.length} ok`);
  return results;
}

export function getHealthSummary(results: HealthResult[]): {
  ok: number; warn: number; fail: number; total: number;
  failed: HealthResult[];
} {
  const ok = results.filter(r => r.status === 'ok').length;
  const warn = results.filter(r => r.status === 'warn').length;
  const fail = results.filter(r => r.status === 'fail').length;
  return { ok, warn, fail, total: results.length, failed: results.filter(r => r.status === 'fail') };
}
