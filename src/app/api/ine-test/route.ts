import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const urls = [
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tour_arr_m?format=JSON&geo=ES&freq=M',
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tour_occ_nim?format=JSON&geo=ES&freq=M',
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tour_occ_ninat?format=JSON&geo=ES&freq=M&cit_res=NONEU',
  ];

  const results = [];

  for (const url of urls) {
    try {
      const start = Date.now();
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });

      const elapsed = Date.now() - start;
      const text = await res.text();
      const contentType = res.headers.get('content-type') || '';

      let preview = text.substring(0, 500);
      if (text.length > 500) preview += '...';

      results.push({
        url: url.split('?')[0].split('/').pop(),
        status: res.status,
        content_type: contentType,
        elapsed_ms: elapsed,
        content_length: text.length,
        isJson: contentType.includes('json') || text.trimStart().startsWith('{') || text.trimStart().startsWith('['),
        preview,
      });
    } catch (e: any) {
      results.push({ url: url.split('?')[0].split('/').pop(), error: e.message });
    }
  }

  return NextResponse.json({ results });
}
