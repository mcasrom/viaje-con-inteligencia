import { NextRequest, NextResponse } from 'next/server';
import { scoreSeguros, type SeguroInput } from '@/lib/seguros/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: SeguroInput = {
      destino: body.destino,
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
