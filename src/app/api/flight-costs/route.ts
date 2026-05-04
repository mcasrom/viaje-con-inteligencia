import { NextRequest, NextResponse } from 'next/server';
import { calculateTCI, getTCIForAllCountries, getCheapestDestinations, getMostExpensiveDestinations, getOilHistory } from '@/data/tci-engine';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const sort = searchParams.get('sort');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (country) {
      const upperCode = country.toUpperCase();
      const pais = paisesData[upperCode];
      if (!pais) {
        return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
      }

      const tci = calculateTCI(upperCode);
      return NextResponse.json({
        country: {
          code: pais.codigo,
          name: pais.nombre,
          bandera: pais.bandera,
          region: pais.continente,
          nivelRiesgo: pais.nivelRiesgo,
        },
        tci: tci.tci,
        trend: tci.trend,
        recommendation: tci.recommendation,
        factors: tci.factors,
        indices: {
          demand: tci.demandIdx,
          oil: tci.oilIdx,
          seasonality: tci.seasonalityIdx,
          ipc: tci.ipcIdx,
          risk: tci.riskIdx,
        },
      });
    }

    if (sort === 'cheapest') {
      return NextResponse.json({
        destinations: getCheapestDestinations(limit),
      });
    }

    if (sort === 'expensive') {
      return NextResponse.json({
        destinations: getMostExpensiveDestinations(limit),
      });
    }

    if (sort === 'oil') {
      return NextResponse.json({
        oilHistory: getOilHistory(),
      });
    }

    const allCountries = getTCIForAllCountries();
    return NextResponse.json({
      destinations: allCountries.slice(0, limit),
      total: allCountries.length,
    });
  } catch (error) {
    console.error('Flight costs API error:', error);
    return NextResponse.json(
      { error: 'Error al calcular el índice de coste' },
      { status: 500 }
    );
  }
}
