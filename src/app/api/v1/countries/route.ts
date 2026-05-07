import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-v1-auth';
import { getTodosLosPaises, getLabelRiesgo, type NivelRiesgo } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';

export async function GET(request: NextRequest) {
  return apiHandler(request, async () => {
    const { searchParams } = new URL(request.url);
    const risk = searchParams.get('risk');
    const continent = searchParams.get('continent');

    let paises = getTodosLosPaises().filter(p => p.codigo !== 'cu');

    if (risk && risk !== 'all') {
      paises = paises.filter(p => p.nivelRiesgo === risk);
    }
    if (continent && continent !== 'all') {
      paises = paises.filter(p => p.continente.toLowerCase() === continent.toLowerCase());
    }

    const riskNum: Record<string, number> = { 'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5 };

    const countries = paises.map(p => {
      const tci = calculateTCI(p.codigo);
      return {
        code: p.codigo,
        name: p.nombre,
        flag: p.bandera,
        capital: p.capital,
        continent: p.continente,
        risk: {
          level: p.nivelRiesgo,
          label: getLabelRiesgo(p.nivelRiesgo),
          score: riskNum[p.nivelRiesgo] || 0,
        },
        cost: {
          tci: Math.round(tci.tci * 100) / 100,
          trend: tci.trend,
        },
        coordinates: p.mapaCoordenadas,
      };
    });

    return NextResponse.json({
      total: countries.length,
      countries,
      documentation: 'https://www.viajeinteligencia.com/api-endpoints',
    });
  }, '/v1/countries');
}
