import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, logApiUsage, rateLimitResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPaisData } from '@/lib/paises-db';
import { getSignalStats, getIncidentStats, getRecentRiskChanges, computeRiskScore, getUpProbability, computeProbability, getSeasonalRiskMultiplier, RISK_NUM } from '@/lib/ml-risk-predictor';
import { getTransitionMatrix } from '@/lib/ml-risk-predictor';
import type { RiskNum } from '@/lib/ml-risk-predictor';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> },
) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.key) {
    return rateLimitResponse(auth);
  }

  const { country } = await params;
  const code = country.toLowerCase();
  const pais = await getPaisData(code);
  if (!pais) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  await logApiUsage(auth.key.id, `/api/v1/risk/${code}`);

  const riskNum: RiskNum = (RISK_NUM[pais.nivelRiesgo] || 1) as RiskNum;

  const [signals, incidents, matrix] = await Promise.all([
    getSignalStats(code),
    getIncidentStats(code),
    getTransitionMatrix(),
  ]);

  const changes30d = await getRecentRiskChanges(code);
  const seasonalMult = getSeasonalRiskMultiplier(code);
  const riskScore = computeRiskScore(riskNum, signals, incidents, null);
  const transitionProb = getUpProbability(matrix, riskNum);
  const prob = computeProbability(riskNum, riskScore, signals, incidents, changes30d, seasonalMult, transitionProb, null);

  return NextResponse.json({
    country: {
      code,
      name: pais.nombre,
      flag: pais.bandera,
    },
    risk: {
      level: pais.nivelRiesgo,
      label: pais.nivelRiesgo.charAt(0).toUpperCase() + pais.nivelRiesgo.slice(1),
      score: riskNum,
      lastUpdated: pais.ultimoInforme || 'N/A',
    },
    activeIncidents: incidents,
    prediction: {
      riskScore,
      probabilityUp7d: Math.round(prob.up7d * 10000) / 10000,
      probabilityUp14d: Math.round(prob.up14d * 10000) / 10000,
      probabilityUp30d: Math.round(prob.up30d * 10000) / 10000,
    },
  });
}
