import { NextRequest, NextResponse } from 'next/server';
import { scoreSeguros, resolvePais, type SeguroInput } from '@/lib/seguros/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resolved = resolvePais(body.destino);
    if (!resolved) {
      return NextResponse.json({ error: 'País no encontrado. Introduce un código ISO (ES, TH, ID...) o nombre del país.' }, { status: 400 });
    }

    const input: SeguroInput = {
      destino: resolved.codigo,
      edades: body.edades || [30],
      actividades: body.actividades || [],
      costeViaje: body.costeViaje || 1000,
      tipoViaje: body.tipoViaje || 'individual',
      residencia: body.residencia || 'ES',
    };

    const result = scoreSeguros(input);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al calcular' },
      { status: 500 }
    );
  }
}
