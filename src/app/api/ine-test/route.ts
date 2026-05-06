import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const datasets = [
    'tour_arr_m',
    'tour_occ_nim',
    'tour_occ_ninat',
    'tour_arr_ninat',
  ];

  const results = [];

  for (const ds of datasets) {
    try {
      const url = `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/${ds}?language=en&geo=ES&freq=M&unit=NR`;
      const start = Date.now();
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });

      const elapsed = Date.now() - start;
      const data = await res.json();

      results.push({
        dataset: ds,
        status: res.status,
        elapsed_ms: elapsed,
        hasData: !!data?.value,
        valueCount: data?.value ? Object.keys(data.value).length : 0,
        label: data?.label || '',
        sampleKeys: data?.dimension ? Object.keys(data.dimension).slice(0, 5) : [],
      });
    } catch (e: any) {
      results.push({ dataset: ds, error: e.message });
    }
  }

  return NextResponse.json({ results });
}
