import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { getAllMAECAlerts } from '@/lib/scraper/maec';

interface EventData {
  id: string;
  name: string;
  countryCode: string;
  impact: 'alto' | 'medio' | 'bajo';
  attendees: number;
}

const eventsData: EventData[] = [
  { id: '1', name: 'Gran Premio F1', countryCode: 'MC', impact: 'alto', attendees: 300000 },
  { id: '2', name: 'Copa Mundial', countryCode: 'ES', impact: 'alto', attendees: 5000000 },
  { id: '3', name: 'Festival Cannes', countryCode: 'FR', impact: 'medio', attendees: 50000 },
  { id: '4', name: 'Maratón Berlín', countryCode: 'DE', impact: 'medio', attendees: 45000 },
  { id: '5', name: 'Cumbre G20', countryCode: 'BR', impact: 'alto', attendees: 25000 },
  { id: '6', name: 'Carnaval Río', countryCode: 'BR', impact: 'alto', attendees: 1000000 },
  { id: '7', name: 'Tomorrowland', countryCode: 'BE', impact: 'medio', attendees: 400000 },
  { id: '8', name: 'Copa América', countryCode: 'US', impact: 'alto', attendees: 800000 },
];

const seasonalFactors: Record<string, number> = {
  '01': 1.3, '02': 1.2, '03': 1.0, '04': 1.0, '05': 1.1, '06': 1.4,
  '07': 1.5, '08': 1.5, '09': 1.1, '10': 1.0, '11': 0.9, '12': 1.2,
};

const riskWeightMap: Record<string, number> = {
  'sin-riesgo': 0.1,
  'bajo': 0.3,
  'medio': 0.5,
  'alto': 0.8,
  'muy-alto': 1.0,
};

function getSeasonality(month: string): number {
  return seasonalFactors[month] || 1.0;
}

function getEventsScore(countryCode: string, targetDate: string): { score: number; events: string[]; impact: string } {
  const countryEvents = eventsData.filter(e => e.countryCode === countryCode);
  const events: string[] = [];
  let totalImpact = 0;

  for (const event of countryEvents) {
    events.push(event.name);
    const impactValue = event.impact === 'alto' ? 1.0 : event.impact === 'medio' ? 0.6 : 0.3;
    totalImpact += impactValue;
  }

  const score = Math.min(100, totalImpact * 25);
  return { score, events, impact: score > 60 ? 'alto' : score > 30 ? 'medio' : 'bajo' };
}

function getPriceScore(ipc: string): number {
  const ipcMap: Record<string, number> = {
    'bajo': 20,
    'medio': 40,
    'alto': 60,
    'muy-alto': 80,
  };
  const ipcStr = ipc?.toLowerCase() || 'medio';
  return ipcMap[ipcStr] || 40;
}

function getRecommendation(istScore: number): { label: string; color: string; icon: string } {
  if (istScore <= 20) return { label: 'Ideal', color: 'green', icon: '✅' };
  if (istScore <= 40) return { label: 'Bueno', color: 'lime', icon: '👍' };
  if (istScore <= 60) return { label: 'Moderado', color: 'yellow', icon: '⚠️' };
  if (istScore <= 80) return { label: 'Alto', color: 'orange', icon: '🔥' };
  return { label: 'Crítico', color: 'red', icon: '❌' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country')?.toUpperCase() || 'ES';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const pais = paisesData[countryCode];
  if (!pais) {
    return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
  }

  const month = date.substring(5, 7);
  const seasonality = getSeasonality(month);
  const { score: eventsScore, events, impact: eventsImpact } = getEventsScore(countryCode, date);
  
  const riskWeight = riskWeightMap[pais.nivelRiesgo] || 0.5;
  const riskScore = riskWeight * 100;
  
  const priceScore = getPriceScore(pais.indicadores?.ipc?.toLowerCase() || 'medio');

  const istRaw =
    (eventsScore * 0.35) +
    (riskScore * 0.30) +
    ((seasonality - 1) * 100 * 0.20) +
    (priceScore * 0.15)
  ;

  const istScore = Math.max(0, Math.min(100, Math.round(istRaw)));
  const recommendation = getRecommendation(istScore);

  const breakdown = {
    eventos: { score: Math.round(eventsScore * 0.35), weight: '35%', impact: eventsImpact, details: events },
    riesgo: { score: Math.round(riskScore * 0.30), weight: '30%', level: pais.nivelRiesgo },
    estacionalidad: { score: Math.round(((seasonality - 1) * 100) * 0.20), weight: '20%', month, factor: seasonality },
    precios: { score: Math.round(priceScore * 0.15), weight: '15%', ipc: pais.indicadores?.ipc || 'N/A' },
  };

  return NextResponse.json({
    country: pais.nombre,
    countryCode,
    date,
    ist: istScore,
    recommendation: recommendation.label,
    recommendationIcon: recommendation.icon,
    recommendationColor: recommendation.color,
    breakdown,
    methodology: 'IST = 0.35×Eventos + 0.30×Riesgo + 0.20×Estacionalidad + 0.15×Precios',
    generatedAt: new Date().toISOString(),
  });
}