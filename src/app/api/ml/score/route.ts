import { NextRequest, NextResponse } from 'next/server';
import { paisesData, type NivelRiesgo } from '@/data/paises';
import { SEASONALITY_MAP } from '@/data/tci-engine';
import { travelAttributes } from '@/data/clustering';

const RIESGO_SCORE: Record<NivelRiesgo, number> = {
  'sin-riesgo': 100,
  'bajo': 75,
  'medio': 50,
  'alto': 25,
  'muy-alto': 0,
};

const CONTINENT_COST: Record<string, number> = {
  'Europa': 90,
  'Américas': 70,
  'Asia': 85,
  'África': 60,
  'Oceanía': 50,
};

function getMesNombre(m: number): string {
  return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][m - 1] || String(m);
}

function calcularScore(
  countryCode: string,
  profile: string,
  budget: string,
  month: number
): { score: number; breakdown: Record<string, number>; labels: Record<string, string> } {
  const pais = paisesData[countryCode];
  const attrs = travelAttributes[countryCode];

  const riesgoBase = RIESGO_SCORE[pais?.nivelRiesgo] ?? 50;

  const seasonData = SEASONALITY_MAP[countryCode];
  const seasonIndex = seasonData?.[String(month)] ?? 100;
  const seasonScore = seasonIndex < 60 ? 100 : seasonIndex < 90 ? 75 : seasonIndex < 120 ? 50 : 25;

  const costeBase = CONTINENT_COST[pais?.continente ?? ''] ?? 50;
  const budgetMultiplier = budget === 'bajo' ? 1.3 : budget === 'medio' ? 1 : budget === 'alto' ? 0.7 : 0.5;
  const costeScore = Math.round(Math.min(100, costeBase * budgetMultiplier));

  let perfilScore = 50;
  if (attrs) {
    const profileWeights: Record<string, string[]> = {
      mochilero: ['naturaleza', 'cultural'],
      lujo: ['playa', 'cultural'],
      familiar: ['playa', 'familiar'],
      aventura: ['naturaleza', 'cultural'],
      negocios: ['cultural'],
    };
    const relevantKeys = profileWeights[profile] || ['playa', 'cultural', 'naturaleza', 'familiar'];
    const vals = relevantKeys.map(k => attrs[k as keyof typeof attrs]).filter((v): v is number => typeof v === 'number' && v > 0);
    perfilScore = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) : 50;
  }

  const profilePeso = profile === 'mochilero' || profile === 'aventura' ? 0.3 : profile === 'negocios' ? 0.15 : 0.25;
  const pesos = { riesgo: 0.3, season: 0.2, coste: 0.25, perfil: profilePeso };
  const totalPeso = Object.values(pesos).reduce((a, b) => a + b, 0);

  const rawScore = (riesgoBase * pesos.riesgo + seasonScore * pesos.season + costeScore * pesos.coste + perfilScore * pesos.perfil) / totalPeso;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  return {
    score,
    breakdown: { riesgo: riesgoBase, season: seasonScore, coste: costeScore, perfil: perfilScore },
    labels: {
      riesgo: pais?.nivelRiesgo ?? 'desconocido',
      season: `${seasonIndex} (${getMesNombre(month)})`,
      coste: `${budget}`,
      perfil: `${profile}`,
    },
  };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'bueno';
  if (score >= 40) return 'moderado';
  if (score >= 20) return 'desfavorable';
  return 'no recomendado';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.toLowerCase();
  const profile = searchParams.get('profile') || 'mochilero';
  const budget = searchParams.get('budget') || 'medio';
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

  const validProfiles = ['mochilero', 'lujo', 'familiar', 'aventura', 'negocios'];
  const validBudgets = ['bajo', 'medio', 'alto', 'lujo'];

  if (!country || !paisesData[country]) {
    return NextResponse.json({ error: 'Invalid or missing country code' }, { status: 400 });
  }
  if (!validProfiles.includes(profile)) {
    return NextResponse.json({ error: `Invalid profile. Valid: ${validProfiles.join(', ')}` }, { status: 400 });
  }
  if (!validBudgets.includes(budget)) {
    return NextResponse.json({ error: `Invalid budget. Valid: ${validBudgets.join(', ')}` }, { status: 400 });
  }
  if (month < 1 || month > 12) {
    return NextResponse.json({ error: 'Month must be 1-12' }, { status: 400 });
  }

  const result = calcularScore(country, profile, budget, month);
  const pais = paisesData[country];

  return NextResponse.json({
    country: country.toUpperCase(),
    name: pais?.nombre,
    flag: pais?.bandera,
    profile,
    budget,
    month: getMesNombre(month),
    score: result.score,
    label: getScoreLabel(result.score),
    breakdown: result.breakdown,
    labels: result.labels,
  });
}
