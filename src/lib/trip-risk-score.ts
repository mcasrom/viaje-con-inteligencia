import { paisesData, type NivelRiesgo } from '@/data/paises';
import { SEASONALITY_MAP } from '@/data/tci-engine';
import { travelAttributes } from '@/data/clustering';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT_PESOS: Record<string, { riesgo: number; season: number; coste: number; perfil: number }> = {
  mochilero: { riesgo: 0.20, season: 0.15, coste: 0.40, perfil: 0.25 },
  familiar: { riesgo: 0.40, season: 0.20, coste: 0.25, perfil: 0.15 },
  lujo: { riesgo: 0.20, season: 0.20, coste: 0.20, perfil: 0.40 },
  aventura: { riesgo: 0.25, season: 0.15, coste: 0.30, perfil: 0.30 },
  negocios: { riesgo: 0.30, season: 0.20, coste: 0.35, perfil: 0.15 },
  default: { riesgo: 0.30, season: 0.20, coste: 0.25, perfil: 0.25 },
};

let pesosCache: typeof DEFAULT_PESOS | null = null;
let pesosCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function loadPesosFromDB(): Promise<typeof DEFAULT_PESOS> {
  if (pesosCache && Date.now() - pesosCacheTime < CACHE_TTL) return pesosCache;
  try {
    const admin = supabaseAdmin;
    if (!admin) return DEFAULT_PESOS;
    const { data } = await admin.from('score_weights').select('*');
    if (!data || data.length === 0) return DEFAULT_PESOS;
    const pesos: typeof DEFAULT_PESOS = { ...DEFAULT_PESOS };
    for (const row of data) {
      const p = row.profile === 'default' ? 'default' : row.profile;
      if (p in pesos) {
        pesos[p] = { riesgo: row.riesgo, season: row.season, coste: row.coste, perfil: row.perfil };
      }
    }
    pesosCache = pesos;
    pesosCacheTime = Date.now();
    return pesos;
  } catch {
    return DEFAULT_PESOS;
  }
}

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

const INTEREST_MAP: Record<string, string[]> = {
  Historia: ['cultural'], Cultura: ['cultural'], Arte: ['cultural'],
  Naturaleza: ['naturaleza'], Playa: ['playa'], Aventura: ['naturaleza', 'cultural'],
  Buceo: ['naturaleza'], Senderismo: ['naturaleza'], Gastronomía: ['cultural'],
  Familia: ['familiar'], Negocios: ['cultural'], Fiesta: ['playa', 'cultural'],
  Museos: ['cultural'], Deportes: ['naturaleza'], Relax: ['playa'],
  Ciudad: ['cultural'], Nieve: ['naturaleza'], Montaña: ['naturaleza'], Lujo: ['playa', 'cultural'],
};

export async function calcularScore(
  countryCode: string,
  profile: string,
  budget: string,
  month: number,
  days?: number,
  interests?: string[]
): Promise<{ score: number; breakdown: Record<string, number>; labels: Record<string, string> }> {
  const pais = paisesData[countryCode];
  const attrs = travelAttributes[countryCode];

  const durationFactor = days ? 1 + Math.max(-0.15, Math.min(0.25, (days - 7) * 0.003)) : 1;
  const riesgoBase = Math.round(RIESGO_SCORE[pais?.nivelRiesgo] ?? 50 * durationFactor);

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
    let profileBase = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) : 50;

    let interestScore = 50;
    if (interests && interests.length > 0) {
      const interestAttrs = interests.flatMap(i => INTEREST_MAP[i] || []);
      const uniqueAttrs = [...new Set(interestAttrs)];
      const interestVals = uniqueAttrs.map(k => attrs[k as keyof typeof attrs]).filter((v): v is number => typeof v === 'number' && v > 0);
      if (interestVals.length > 0) {
        interestScore = Math.round(interestVals.reduce((a, b) => a + b, 0) / interestVals.length * 10);
      }
    }

    perfilScore = interests?.length ? Math.round(profileBase * 0.6 + interestScore * 0.4) : profileBase;
  }

  const pesos = (await loadPesosFromDB())[profile] || (await loadPesosFromDB()).default;

  const rawScore = riesgoBase * pesos.riesgo + seasonScore * pesos.season + costeScore * pesos.coste + perfilScore * pesos.perfil;
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
