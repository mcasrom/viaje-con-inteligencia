const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '79B687F3E7391A245058BD02622B5D5D';
const BASE_URL = 'https://www.viajeinteligencia.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  try {
    const body = {
      host: 'www.viajeinteligencia.com',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    console.log(`[IndexNow] ${urls.length} URLs enviadas → HTTP ${res.status}`);
  } catch (err) {
    console.error('[IndexNow] Error:', err);
  }
}

// Notifica todas las URLs del sitemap de una vez
export async function notifyIndexNowAll(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    await notifyIndexNow(urls);
  } catch (err) {
    console.error('[IndexNow] Error obteniendo sitemap:', err);
  }
}
