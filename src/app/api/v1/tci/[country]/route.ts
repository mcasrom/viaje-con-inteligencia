import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-v1-auth';
import { calculateTCI, getConflictImpact } from '@/data/tci-engine';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  return apiHandler(request, async () => {
    const codigo = country.toLowerCase();

    const pais = paisesData[codigo];
    if (!pais) {
      return NextResponse.json({
        error: 'Country not found',
        code: 'COUNTRY_NOT_FOUND',
      }, { status: 404 });
    }

    const tci = calculateTCI(codigo);
    const conflict = getConflictImpact(codigo);
    const { data: cached } = await supabaseAdmin
      .from('flight_tci_cache')
      .select('*')
      .eq('country_code', codigo)
      .single();

    return NextResponse.json({
      country: {
        code: codigo,
        name: pais.nombre,
        flag: pais.bandera,
      },
      tci: {
        current: Math.round(tci.tci * 100) / 100,
        trend: tci.trend,
        recommendation: tci.recommendation,
        lastCalculated: cached?.last_calculated || new Date().toISOString(),
      },
      components: {
        demand: Math.round(tci.demandIdx * 100) / 100,
        oil: Math.round(tci.oilIdx * 100) / 100,
        seasonality: Math.round(tci.seasonalityIdx * 100) / 100,
        ipc: Math.round(tci.ipcIdx * 100) / 100,
        risk: Math.round(tci.riskIdx * 100) / 100,
      },
      conflictImpact: {
        isAffected: conflict.isAffected,
        surchargePct: conflict.surchargePct,
        reason: conflict.reason,
        alternativeRoute: conflict.alternativeRoute,
      },
      oilPrice: tci.oilPrice,
      documentation: 'https://www.viajeinteligencia.com/api-endpoints',
    });
  }, `/v1/tci/${country}`);
}
