import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import ManualDocument from '@/components/pdf/ManualDocument';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getManualPaises, getManualEvents, getManualSeguros } from '@/lib/manual-data';
import { createLogger } from '@/lib/logger';

const log = createLogger('ManualPDF');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
    const auth = searchParams.get('auth') !== 'false';

    // Auth gate: verify user session
    if (auth) {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Debes iniciar sesión para descargar el manual.' }, { status: 401 });
      }
    }

    // Fetch live data in parallel
    const [paises, events, seguros] = await Promise.all([
      Promise.resolve(getManualPaises()),
      getManualEvents(lang),
      getManualSeguros(),
    ]);

    log.info('PDF generado', { lang, paises: paises.length, events: events.length, seguros: seguros.length });

    const stream = await renderToStream(<ManualDocument lang={lang} paises={paises} events={events} seguros={seguros} />);

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    const filename = lang === 'en' ? 'traveler-manual.pdf' : 'manual-viajero.pdf';

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    log.error('Error al generar PDF', { error: error.message });
    return NextResponse.json(
      { error: 'Error al generar el PDF: ' + (error.message || 'desconocido') },
      { status: 500 }
    );
  }
}
