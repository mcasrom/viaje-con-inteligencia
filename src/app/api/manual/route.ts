import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import ManualDocument from '@/components/pdf/ManualDocument';
import { createSupabaseServerClient } from '@/lib/supabase';

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

    const stream = await renderToStream(<ManualDocument lang={lang} />);

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
    console.error('[Manual PDF] Error:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF: ' + (error.message || 'desconocido') },
      { status: 500 }
    );
  }
}
