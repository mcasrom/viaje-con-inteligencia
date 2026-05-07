import { NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '79B687F3E7391A245058BD02622B5D5D';
const SITE_URL = 'https://www.viajeinteligencia.com';

const URLS_TO_SUBMIT = [
  '/',
  '/decidir',
  '/blog',
  '/paises',
  '/alertas',
  '/premium',
  '/rutas',
  '/osint',
  '/coste',
  '/analisis',
  '/chat',
  '/radius',
  '/petroleo',
  '/manifiesto',
  '/transparencia',
];

export async function GET() {
  try {
    const urls = URLS_TO_SUBMIT.map(url => `${SITE_URL}${url}`);

    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'www.viajeinteligencia.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: urls,
      }),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      urlsSubmitted: urls.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
