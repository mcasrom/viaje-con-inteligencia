import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, logApiUsage, rateLimitResponse } from '@/lib/api-auth';
import { getPaisesData } from '@/lib/paises-db';
import type { DatoPais } from '@/data/paises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.key) {
    return rateLimitResponse(auth);
  }

  await logApiUsage(auth.key.id, '/api/v1/countries');

  const searchParams = request.nextUrl.searchParams;
  const riskFilter = searchParams.get('risk');

  const paises = await getPaisesData();
  const countries = Object.entries(paises)
    .filter(([code, _p]) => !riskFilter || _p.nivelRiesgo === riskFilter)
    .map(([code, p]: [string, DatoPais]) => ({
      code,
      name: p.nombre,
      capital: p.capital || null,
      continent: p.continente || null,
      flag: p.bandera || null,
      risk: {
        level: p.nivelRiesgo,
        score: p.nivelRiesgo === 'sin-riesgo' ? 1
          : p.nivelRiesgo === 'bajo' ? 2
          : p.nivelRiesgo === 'medio' ? 3
          : p.nivelRiesgo === 'alto' ? 4
          : 5,
      },
      timezone: p.zonaHoraria || null,
      currency: p.moneda || null,
      language: p.idioma || null,
    }))
    .sort((a, b) => b.risk.score - a.risk.score);

  return NextResponse.json({ countries });
}
