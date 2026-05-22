import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api-auth';
import { getPaisData } from '@/lib/paises-db';
import { calculateTCI } from '@/data/tci-engine';
import { getLiveSeasonality, getLiveAirspaceClosures } from '@/lib/tci-db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> },
) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.key) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { country } = await params;
  const code = country.toLowerCase();
  const pais = await getPaisData(code);
  if (!pais) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  const [seasonality, airspace] = await Promise.all([
    getLiveSeasonality(),
    getLiveAirspaceClosures(),
  ]);

  const result = calculateTCI(code, seasonality ?? undefined, {
    airspaceClosures: airspace ?? [],
  });

  await logApiUsage(auth.key.id, `/api/v1/tci/${code}`);

  return NextResponse.json({
    country: { code, name: pais.nombre, flag: pais.bandera },
    tci: {
      total: result.tci,
      trend: result.trend,
      recommendation: result.recommendation,
      factors: result.factors,
      demandIdx: result.demandIdx,
      oilIdx: result.oilIdx,
      seasonalityIdx: result.seasonalityIdx,
      ipcIdx: result.ipcIdx,
      riskIdx: result.riskIdx,
      oilPrice: result.oilPrice,
    },
  });
}
