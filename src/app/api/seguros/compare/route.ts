import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/lib/api-schemas';
import { createLogger } from '@/lib/logger';
import { scoreSeguros, resolvePais, type SeguroInput } from '@/lib/seguros/scoring';

const log = createLogger('Seguros');

export const dynamic = 'force-dynamic';

const CompareRequestSchema = z.object({
  destino: z.string().length(2, 'El código de país debe tener 2 caracteres'),
  edades: z.array(z.number().int().min(0).max(120)).min(1, 'Al menos un viajero'),
  fechaIda: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD').optional(),
  fechaVuelta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD').optional(),
  actividades: z.array(z.string()).optional(),
  costeViaje: z.number().optional(),
  tipoViaje: z.string().optional(),
  residencia: z.enum(['ES', 'EU']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = CompareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Datos invalidos', parsed.error.message, 400);
    }

    const resolved = resolvePais(parsed.data.destino);
    if (!resolved) {
      return NextResponse.json({ error: 'País no encontrado. Introduce un código ISO (ES, TH, ID...) o nombre del país.' }, { status: 400 });
    }

    const input: SeguroInput = {
      destino: resolved.codigo,
      fechaIda: parsed.data.fechaIda || undefined,
      fechaVuelta: parsed.data.fechaVuelta || undefined,
      edades: parsed.data.edades,
      actividades: parsed.data.actividades || [],
      costeViaje: (parsed.data.costeViaje ?? 1000),
      tipoViaje: (parsed.data.tipoViaje ?? 'individual') as 'individual' | 'familiar' | 'grupo',
      residencia: (parsed.data.residencia ?? 'ES') as 'ES' | 'EU',
    };

    const result = scoreSeguros(input);
    return NextResponse.json(result);
  } catch (error: any) {
    log.error('Error en POST /api/seguros/compare', error);
    return NextResponse.json(
      { error: error.message || 'Error al calcular' },
      { status: 500 },
    );
  }
}
