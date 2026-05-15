import { paisesData, type NivelRiesgo } from '@/data/paises';
import { SEASONALITY_MAP } from '@/data/tci-engine';
import { travelAttributes } from '@/data/clustering';

export const RIESGO_SCORE: Record<NivelRiesgo, number> = {
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

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'bueno';
  if (score >= 40) return 'moderado';
  if (score >= 20) return 'desfavorable';
  return 'no recomendado';
}

export function calcularScore(
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
