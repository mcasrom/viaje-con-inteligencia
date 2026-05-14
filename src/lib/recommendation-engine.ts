import { paisesData, getLabelRiesgo, NivelRiesgo } from '@/data/paises';
import { getGPI, getGTI, getHDI, getIPC } from '@/lib/indices';
import { calculateTCI } from '@/data/tci-engine';
import { createLogger } from '@/lib/logger';
import { groqClient } from '@/lib/groq-ai';
import { isCircuitOpen, recordSuccess, recordFailure } from '@/lib/circuit-breaker';
import { trackFailure, trackSuccess } from '@/lib/alert-webhook';

const log = createLogger('RecommendationEngine');
const CB_NAME = 'groq-api';

export interface RecomendarRequest {
  countries: string[];
  preferences: {
    safety: number;
    cost: number;
    development: number;
  };
  prompt?: string;
}

export interface CountryScore {
  safety: number;
  cost: number;
  development: number;
  overall: number;
}

export interface CountryRecommendation {
  code: string;
  name: string;
  flag: string;
  capital: string;
  continent: string;
  scores: CountryScore;
  ranking: number;
  summary: string;
  highlights: string[];
  data: {
    riesgo: string;
    gpi: number | null;
    gti: number | null;
    hdi: number | null;
    ipc: string | null;
    tci: number | null;
  };
}

export interface RecomendarResponse {
  recommendations: CountryRecommendation[];
  method: 'ai' | 'deterministic';
  warning?: string;
}

interface CacheEntry {
  data: RecomendarResponse;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000;

function makeCacheKey(countries: string[], prefs: Record<string, number>): string {
  const key = JSON.stringify({
    countries: [...countries].sort(),
    s: Math.round(prefs.safety * 100),
    c: Math.round(prefs.cost * 100),
    d: Math.round(prefs.development * 100),
  });
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function getCountryRiskScore(nivelRiesgo: NivelRiesgo): number {
  const map: Record<NivelRiesgo, number> = {
    'sin-riesgo': 1,
    bajo: 2,
    medio: 3,
    alto: 4,
    'muy-alto': 5,
  };
  return map[nivelRiesgo] || 3;
}

interface AssembledCountry {
  code: string;
  name: string;
  flag: string;
  capital: string;
  continent: string;
  riesgoLabel: string;
  gpiScore: number | null;
  gtiScore: number | null;
  hdiScore: number | null;
  ipcValue: number | null;
  ipcLevel: string | null;
  tci: number | null;
  riskLevel: number;
}

async function assembleCountryData(code: string): Promise<AssembledCountry | null> {
  const pais = paisesData[code];
  if (!pais) return null;

  const [gpiData, gtiData, hdiData, ipcData] = await Promise.all([
    getGPI(), getGTI(), getHDI(), getIPC(),
  ]);

  const gpi = gpiData.find(d => d.code.toUpperCase() === code.toUpperCase());
  const gti = gtiData.find(d => d.code.toUpperCase() === code.toUpperCase());
  const hdi = hdiData.find(d => d.code.toUpperCase() === code.toUpperCase());
  const ipc = ipcData.find(d => d.code.toUpperCase() === code.toUpperCase());

  const tci = calculateTCI(code);
  const tciScore = tci ? Math.round(tci.tci * 10) / 10 : null;

  return {
    code,
    name: pais.nombre,
    flag: pais.bandera,
    capital: pais.capital,
    continent: pais.continente,
    riesgoLabel: getLabelRiesgo(pais.nivelRiesgo),
    gpiScore: gpi?.score ?? null,
    gtiScore: gti?.score ?? null,
    hdiScore: hdi?.score ?? null,
    ipcValue: ipc ? parseFloat(ipc.ipc.replace('%', '')) : null,
    ipcLevel: ipc?.nivel ?? null,
    tci: tciScore,
    riskLevel: getCountryRiskScore(pais.nivelRiesgo),
  };
}

function normalizeSafety(c: AssembledCountry): number {
  const scores: number[] = [];
  if (c.gpiScore !== null) {
    scores.push(Math.max(0, Math.min(100, (3.5 - c.gpiScore) / 2.3 * 100)));
  }
  if (c.gtiScore !== null) {
    scores.push(Math.max(0, Math.min(100, (10 - c.gtiScore) / 10 * 100)));
  }
  scores.push(Math.max(0, 100 - (c.riskLevel - 1) * 25));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function normalizeCost(c: AssembledCountry): number {
  const scores: number[] = [];
  if (c.tci !== null) {
    scores.push(Math.max(0, Math.min(100, 100 - c.tci)));
  }
  if (c.ipcValue !== null) {
    scores.push(Math.max(0, Math.min(100, 100 - c.ipcValue)));
  }
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
}

function normalizeDevelopment(c: AssembledCountry): number {
  if (c.hdiScore !== null) {
    return Math.max(0, Math.min(100, (c.hdiScore - 0.3) / 0.65 * 100));
  }
  return 50;
}

function computeOverall(c: AssembledCountry, prefs: RecomendarRequest['preferences']): CountryScore {
  const safety = normalizeSafety(c);
  const cost = normalizeCost(c);
  const development = normalizeDevelopment(c);
  const totalWeight = prefs.safety + prefs.cost + prefs.development || 1;
  const overall = (safety * prefs.safety + cost * prefs.cost + development * prefs.development) / totalWeight;
  return { safety: Math.round(safety), cost: Math.round(cost), development: Math.round(development), overall: Math.round(overall) };
}

function deterministicRanking(
  assembled: AssembledCountry[],
  prefs: RecomendarRequest['preferences']
): CountryRecommendation[] {
  const scored = assembled.map(c => ({
    c,
    scores: computeOverall(c, prefs),
  }));

  scored.sort((a, b) => b.scores.overall - a.scores.overall);

  return scored.map((item, i) => ({
    code: item.c.code,
    name: item.c.name,
    flag: item.c.flag,
    capital: item.c.capital,
    continent: item.c.continent,
    scores: item.scores,
    ranking: i + 1,
    summary: '',
    highlights: getHighlights(item.c, item.scores),
    data: {
      riesgo: item.c.riesgoLabel,
      gpi: item.c.gpiScore,
      gti: item.c.gtiScore,
      hdi: item.c.hdiScore,
      ipc: item.c.ipcValue !== null ? `${item.c.ipcValue}%` : null,
      tci: item.c.tci,
    },
  }));
}

function getHighlights(c: AssembledCountry, scores: CountryScore): string[] {
  const h: string[] = [];
  if (scores.safety >= 70) h.push('Alta seguridad');
  else if (scores.safety < 40) h.push('Precaución recomendada');
  if (scores.cost >= 70) h.push('Económico');
  else if (scores.cost < 40) h.push('Coste elevado');
  if (scores.development >= 70) h.push('Alto desarrollo');
  if (c.continent === 'Europa' && c.tci !== null && c.tci < 50) h.push('Buen coste de viaje');
  return h.slice(0, 3);
}

function buildPrompt(
  assembled: AssembledCountry[],
  prefs: RecomendarRequest['preferences'],
  userPrompt?: string
): string {
  const weightDesc: string[] = [];
  if (prefs.safety > 0.6) weightDesc.push('seguridad es prioridad');
  else if (prefs.safety > 0.3) weightDesc.push('seguridad es importante');
  if (prefs.cost > 0.6) weightDesc.push('coste bajo es prioridad');
  else if (prefs.cost > 0.3) weightDesc.push('coste es importante');
  if (prefs.development > 0.6) weightDesc.push('desarrollo es prioridad');
  else if (prefs.development > 0.3) weightDesc.push('desarrollo es importante');

  const countriesSection = assembled.map(c => {
    const lines = [
      `${c.flag} ${c.name}`,
      `  Capital: ${c.capital}`,
      `  Continente: ${c.continent}`,
      `  Riesgo: ${c.riesgoLabel}`,
      c.gpiScore !== null ? `  GPI (Paz): ${c.gpiScore} (menor = más pacífico)` : '',
      c.gtiScore !== null ? `  GTI (Terrorismo): ${c.gtiScore} (menor = menos terrorismo)` : '',
      c.hdiScore !== null ? `  HDI (Desarrollo): ${c.hdiScore} (mayor = más desarrollado)` : '',
      c.ipcValue !== null ? `  IPC (Inflación): ${c.ipcValue}%` : '',
      c.tci !== null ? `  TCI (Coste viaje): ${c.tci}/100 (menor = más barato)` : '',
    ].filter(Boolean).join('\n');
    return lines;
  }).join('\n\n');

  return `Eres un asesor de viajes experto que analiza países usando datos objetivos. El usuario quiere comparar destinos.

CONTEXTO POR PAÍS:
${countriesSection}

PREFERENCIAS DEL USUARIO:
- Peso seguridad: ${Math.round(prefs.safety * 100)}%
- Peso coste: ${Math.round(prefs.cost * 100)}%
- Peso desarrollo: ${Math.round(prefs.development * 100)}%
- Prioridades: ${weightDesc.join(', ') || 'ninguna en particular'}
${userPrompt ? `\nNotas del usuario:\n${userPrompt}` : ''}

Analiza cada país según las preferencias del usuario. Devuelve SOLO un array JSON válido con esta estructura exacta:
[
  {
    "code": "es",
    "summary": "Resumen breve (1-2 frases) de por qué este país encaja con las preferencias del usuario",
    "highlights": ["punto fuerte 1", "punto fuerte 2", "punto fuerte 3"]
  }
]

Reglas:
- Usa los índices objetivos para justificar cada recomendación
- Ordena el array del mejor al peor ajuste
- NO añadas texto fuera del JSON
- NO uses markdown ni backticks
- Responde SOLO el JSON, nada más
- Responde siempre en español`;
}

function parseAIResponse(raw: string, validCodes: Set<string>): Array<{ code: string; summary: string; highlights: string[] }> | null {
  try {
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.slice(firstBracket, lastBracket + 1);
    }
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((item: any) => item && typeof item.code === 'string' && validCodes.has(item.code.toLowerCase()))
      .map((item: any) => ({
        code: item.code.toLowerCase(),
        summary: typeof item.summary === 'string' ? item.summary : '',
        highlights: Array.isArray(item.highlights) ? item.highlights.filter((h: any) => typeof h === 'string').slice(0, 4) : [],
      }));
  } catch {
    return null;
  }
}

function applyAIResults(
  deterministic: CountryRecommendation[],
  aiResults: Array<{ code: string; summary: string; highlights: string[] }>
): CountryRecommendation[] {
  const aiMap = new Map(aiResults.map(r => [r.code, r]));
  return deterministic.map(d => {
    const ai = aiMap.get(d.code);
    if (!ai) return d;
    return {
      ...d,
      summary: ai.summary,
      highlights: ai.highlights.length > 0 ? ai.highlights : d.highlights,
    };
  });
}

export async function getRecommendations(req: RecomendarRequest): Promise<RecomendarResponse> {
  const { countries, preferences, prompt } = req;

  const cleanedPrefs = {
    safety: clamp(preferences.safety),
    cost: clamp(preferences.cost),
    development: clamp(preferences.development),
  };

  const cacheKey = makeCacheKey(countries, cleanedPrefs);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    log.info('Cache hit for', cacheKey);
    return cached.data;
  }

  const assembled = (await Promise.all(
    countries.map(code => assembleCountryData(code))
  )).filter((c): c is AssembledCountry => c !== null);

  if (assembled.length < 2) {
    return {
      recommendations: [],
      method: 'deterministic',
      warning: 'Se necesitan al menos 2 países válidos',
    };
  }

  const deterministic = deterministicRanking(assembled, cleanedPrefs);

  if (isCircuitOpen(CB_NAME)) {
    log.warn('Circuit open, using deterministic fallback');
    const response: RecomendarResponse = {
      recommendations: deterministic,
      method: 'deterministic',
      warning: 'Recomendación basada en datos objetivos (IA no disponible temporalmente)',
    };
    return response;
  }

  try {
    const aiPrompt = buildPrompt(assembled, cleanedPrefs, prompt);
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor de viajes experto que analiza datos objetivos y devuelve JSON estructurado.',
        },
        { role: 'user', content: aiPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 2048,
    });

    recordSuccess(CB_NAME);
    trackSuccess(CB_NAME);

    const raw = chatCompletion.choices[0]?.message?.content || '';
    const validCodes = new Set(assembled.map(a => a.code));
    const aiResults = parseAIResponse(raw, validCodes);

    if (aiResults && aiResults.length > 0) {
      const recommendations = applyAIResults(deterministic, aiResults);
      const response: RecomendarResponse = { recommendations, method: 'ai' };
      cache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;
    }

    log.warn('AI response parse failed, using deterministic');
    const response: RecomendarResponse = {
      recommendations: deterministic,
      method: 'deterministic',
      warning: 'No se pudieron generar recomendaciones con IA. Mostrando datos objetivos.',
    };
    return response;
  } catch (error) {
    log.error('AI recommendation error:', error);
    recordFailure(CB_NAME);
    trackFailure(CB_NAME, 'getRecommendations failed');
    const response: RecomendarResponse = {
      recommendations: deterministic,
      method: 'deterministic',
      warning: 'Error al generar recomendaciones con IA. Mostrando datos objetivos.',
    };
    return response;
  }
}
