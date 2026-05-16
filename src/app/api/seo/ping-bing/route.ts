import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/config';
import { getTodosLosPaises } from '@/data/paises';
import { getPostSlugs } from '@/lib/posts';

const INDEXNOW_URL = 'https://www.bing.com/indexnow';
const INDEXNOW_KEY = '912cddcf-839d-4bee-a628-4c8cfd81c843';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const paises = getTodosLosPaises();
    const blogSlugs = getPostSlugs();

    const urls = [
      `${SITE_URL}/`,
      `${SITE_URL}/blog`,
      `${SITE_URL}/blog/ecosistema-osint-viajero-moderno`,
      ...paises.slice(0, 10).map(p => `${SITE_URL}/pais/${p.codigo}`),
      ...blogSlugs.slice(0, 5).map(s => `${SITE_URL}/blog/${s}`),
    ];

    const body = {
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const res = await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });

    results.indexnow = {
      status: res.status,
      ok: res.ok,
      urls_submitted: urls.length,
      body: res.ok ? null : await res.text().catch(() => null),
    };
  } catch (e: any) {
    results.indexnow = { error: e.message };
  }

  return NextResponse.json(results);
}
