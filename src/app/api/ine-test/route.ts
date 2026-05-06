import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    const urls = [
      'https://servicios.ine.es/wstempus/es/DATOS/OBTENER_TABLA?id_operacion=30940&id_periodo=M&nult=2',
      'https://servicios.ine.es/wstempus/es/DATOS/OBTENER_TABLA?id_operacion=30940&id_periodo=M',
    ];

    const results = [];

    for (const url of urls) {
      try {
        console.log('[INE-TEST] Fetching:', url);
        const start = Date.now();
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });

        const elapsed = Date.now() - start;
        const text = await res.text();

        results.push({
          url,
          status: res.status,
          elapsed_ms: elapsed,
          content_length: text.length,
          preview: text.substring(0, 500),
        });

        console.log(`[INE-TEST] ${res.status} in ${elapsed}ms, ${text.length} bytes`);
      } catch (e: any) {
        results.push({
          url,
          error: e.message,
        });
        console.warn(`[INE-TEST] Failed:`, e.message);
      }
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
