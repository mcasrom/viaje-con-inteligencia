import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const urls = [
    'https://servicios.ine.es/wstempus/es/DATOS/OBTENER_TABLA?id_operacion=30940&id_periodo=M&nult=2',
    'https://www.ine.es/jaxiT3/files/t/csv/30940.csv?cabecera=/tmp/n3&nult=2',
    'https://www.ine.es/dynt3/inebase/es/index.htm?cap=086710&cap_anterior=086629',
    'https://www.ine.es/prensa/tt_2_2026_d.pdf',
    'https://www.ine.es/jaxiT3/Datos.htm?t=30940',
  ];

  const results = [];

  for (const url of urls) {
    try {
      const start = Date.now();
      const res = await fetch(url, {
        headers: {
          'Accept': 'text/html,application/json,*/*',
          'User-Agent': 'Mozilla/5.0 (compatible; ViajeInteligencia/1.0)',
        },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });

      const elapsed = Date.now() - start;
      const text = await res.text();
      const contentType = res.headers.get('content-type') || '';

      results.push({
        url,
        status: res.status,
        content_type: contentType,
        elapsed_ms: elapsed,
        content_length: text.length,
        preview: text.substring(0, 300),
      });
    } catch (e: any) {
      results.push({ url, error: e.message });
    }
  }

  return NextResponse.json({ results });
}
