import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const urls = [
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/tour_arr_m?format=JSON&geo=ES&freq=M&unit=NR&startPeriod=2024-01',
    'https://ec.europa.eu/eurostat/api/dissementation/statistics/1.0/data/tour_occ_nim?format=JSON&geo=ES&freq=M',
    'https://restcountries.com/v3.1/name/spain',
    'https://api.worldbank.org/v2/country/ES/indicator/ST.INT.ARVL?format=json&per_page=5',
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

      results.push({
        url: url.substring(0, 80) + '...',
        status: res.status,
        content_type: contentType,
        elapsed_ms: elapsed,
        content_length: text.length,
        isJson: contentType.includes('json') || text.trimStart().startsWith('{') || text.trimStart().startsWith('['),
        preview: text.substring(0, 300),
      });
    } catch (e: any) {
      results.push({ url: url.substring(0, 80), error: e.message });
    }
  }

  return NextResponse.json({ results });
}
