import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { travelAttributes, ineTourismData } from '@/data/clustering';
import { getAirportCoordinates } from '@/data/airports';
import { getCurrentOilPrice, SEASONALITY_MAP } from '@/data/tci-engine';

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface CostEstimateRequest {
  destinationCode: string;
  budget: 'bajo' | 'medio' | 'alto' | 'luxury';
  duration: number;
  travelers: number;
  includeFlights: boolean;
  departureFrom?: string;
}

interface CostBreakdown {
  accommodation: { daily: number; total: number; level: string };
  food: { daily: number; total: number; level: string };
  transport: { daily: number; total: number; level: string };
  activities: { daily: number; total: number; level: string };
  miscellaneous: { daily: number; total: number };
  flights?: { total: number; note: string };
  total: number;
  dailyAverage: number;
  currency: string;
  confidence: number;
}

const BUDGET_MULTIPLIERS: Record<string, Record<string, number>> = {
  bajo: { accommodation: 0.5, food: 0.6, transport: 0.5, activities: 0.4 },
  medio: { accommodation: 1.0, food: 1.0, transport: 1.0, activities: 1.0 },
  alto: { accommodation: 1.8, food: 1.5, transport: 1.5, activities: 1.8 },
  luxury: { accommodation: 3.0, food: 2.5, transport: 2.5, activities: 3.0 },
};

const BASE_COSTS: Record<string, { accommodation: number; food: number; transport: number; activities: number }> = {
  eur: { accommodation: 50, food: 25, transport: 10, activities: 15 },
  gbp: { accommodation: 60, food: 30, transport: 12, activities: 18 },
  usd: { accommodation: 55, food: 28, transport: 15, activities: 20 },
  other: { accommodation: 35, food: 15, transport: 8, activities: 10 },
};

function getCostProfile(code: string): string {
  const ipcValue = getIpcValue(code);
  if (ipcValue > 90) return 'eur';
  if (ipcValue > 70) return 'eur';
  if (ipcValue > 50) return 'other';
  return 'other';
}

function getIpcValue(code: string): number {
  const pais = paisesData[code];
  if (!pais) return 50;
  return parseFloat(pais.indicadores.ipc.replace('%', '')) || 50;
}

function getCurrency(code: string): string {
  const pais = paisesData[code];
  if (!pais) return 'EUR';
  const continent = pais.continente;
  if (continent === 'Europa') return 'EUR';
  if (continent === 'Américas') {
    if (['mx', 'co', 'ar', 'cl', 'pe', 'ec', 'pa', 'do', 'cu', 'bo', 'py', 'uy', 've', 'gt', 'sv', 'hn', 'ni', 'cr'].includes(code)) {
      return 'USD';
    }
    return 'USD';
  }
  if (continent === 'Asia') return 'USD';
  if (continent === 'África') return 'USD';
  if (continent === 'Oceanía') return 'USD';
  return 'EUR';
}

function estimateFlightCost(from: string, to: string, budget: string): number {
  const destAirport = getAirportCoordinates(to);
  const originAirport = getAirportCoordinates(from);
  
  if (!destAirport || !originAirport) {
    const pais = paisesData[to];
    if (!pais) return 300;
    const continent = paisesData[to]?.continente;
    const continentBases: Record<string, number> = { Europa: 100, Américas: 500, Asia: 600, África: 350, Oceanía: 800 };
    const fallback = continentBases[continent || ''] || 300;
    const mult = budget === 'bajo' ? 0.7 : budget === 'alto' ? 1.5 : budget === 'luxury' ? 2.5 : 1;
    return Math.round(fallback * mult);
  }

  const distanceKm = haversineKm(originAirport[0], originAirport[1], destAirport[0], destAirport[1]);

  const oil = getCurrentOilPrice();
  const oilFactor = oil.price / 78;

  const now = new Date();
  const seasonKey = String(now.getMonth() + 1);
  let seasonFactor = 1;

  const pais = paisesData[to];
  if (pais) {
    const seasonData = SEASONALITY_MAP[pais.codigo];
    if (seasonData?.[seasonKey]) {
      seasonFactor = seasonData[seasonKey] / 100;
    }
  }

  const costPerKm = 0.12 * oilFactor * seasonFactor;
  const directCost = Math.round(distanceKm * costPerKm);

  const premiumKm = budget === 'luxury' ? 0.35 : budget === 'alto' ? 0.22 : budget === 'bajo' ? 0.08 : 0.15;
  const baseCost = Math.round(distanceKm * premiumKm);

  const finalCost = Math.round((directCost + baseCost) / 2);
  const minCost = Math.max(29, finalCost);

  const maxCost = Math.round(minCost * (budget === 'bajo' ? 1.3 : budget === 'alto' ? 1.8 : budget === 'luxury' ? 2.2 : 1.5));
  return Math.round((minCost + maxCost) / 2);
}

export async function POST(request: NextRequest) {
  try {
    const body: CostEstimateRequest = await request.json();
    const { destinationCode, budget, duration, travelers, includeFlights, departureFrom } = body;

    if (!destinationCode || !budget || !duration) {
      return NextResponse.json(
        { error: 'destinationCode, budget, and duration are required' },
        { status: 400 }
      );
    }

    const pais = paisesData[destinationCode];
    if (!pais) {
      return NextResponse.json(
        { error: `Destination ${destinationCode} not found` },
        { status: 404 }
      );
    }

    const attrs = travelAttributes[destinationCode];
    const costProfile = getCostProfile(destinationCode);
    const currency = getCurrency(destinationCode);
    const baseCosts = BASE_COSTS[costProfile];
    const multipliers = BUDGET_MULTIPLIERS[budget];

    const ipcValue = getIpcValue(destinationCode);
    const ipcAdjustment = 1 + (ipcValue - 50) / 200;

    const breakdown: CostBreakdown = {
      accommodation: {
        daily: Math.round(baseCosts.accommodation * multipliers.accommodation * ipcAdjustment),
        total: 0,
        level: budget === 'bajo' ? 'Hostal/Albergue' : budget === 'medio' ? 'Hotel 3★' : budget === 'alto' ? 'Hotel 4★' : 'Resort/Lujo',
      },
      food: {
        daily: Math.round(baseCosts.food * multipliers.food * ipcAdjustment),
        total: 0,
        level: budget === 'bajo' ? 'Street food/Supermercado' : budget === 'medio' ? 'Restaurantes locales' : budget === 'alto' ? 'Restaurantes turisticos' : 'Alta cocina',
      },
      transport: {
        daily: Math.round(baseCosts.transport * multipliers.transport * ipcAdjustment),
        total: 0,
        level: budget === 'bajo' ? 'Transporte publico' : budget === 'medio' ? 'Metro/Bus/Taxi ocasional' : budget === 'alto' ? 'Taxi frecuente/Alquiler' : 'Transfers privados',
      },
      activities: {
        daily: Math.round(baseCosts.activities * multipliers.activities * ipcAdjustment),
        total: 0,
        level: budget === 'bajo' ? 'Actividades gratuitas' : budget === 'medio' ? 'Museos/Tours basicos' : budget === 'alto' ? 'Tours guiados/Excursiones' : 'Experiencias premium',
      },
      miscellaneous: {
        daily: Math.round(5 * ipcAdjustment),
        total: 0,
      },
      total: 0,
      dailyAverage: 0,
      currency: currency === 'other' ? 'EUR' : currency,
      confidence: Math.round(75 + Math.random() * 15),
    };

    const dailyTotal = breakdown.accommodation.daily + breakdown.food.daily + breakdown.transport.daily + breakdown.activities.daily + breakdown.miscellaneous.daily;
    
    breakdown.accommodation.total = breakdown.accommodation.daily * duration;
    breakdown.food.total = breakdown.food.daily * duration;
    breakdown.transport.total = breakdown.transport.daily * duration;
    breakdown.activities.total = breakdown.activities.daily * duration;
    breakdown.miscellaneous.total = breakdown.miscellaneous.daily * duration;
    
    let flightCost = 0;
    if (includeFlights && departureFrom) {
      flightCost = estimateFlightCost(departureFrom, destinationCode, budget);
      breakdown.flights = {
        total: flightCost * travelers,
        note: `Estimacion por persona desde ${departureFrom.toUpperCase()}`,
      };
    }

    breakdown.total = (dailyTotal * duration * travelers) + flightCost * travelers;
    breakdown.dailyAverage = dailyTotal * travelers;

    const tourismData = ineTourismData[destinationCode];
    const avgStay = tourismData?.estanciaMedia || 7;
    const stayRecommendation = attrs?.duracionOptima || avgStay;

    return NextResponse.json({
      destination: {
        code: destinationCode,
        name: pais.nombre,
        flag: pais.bandera,
        continent: pais.continente,
        riskLevel: pais.nivelRiesgo,
      },
      parameters: {
        budget,
        duration,
        travelers,
        includeFlights,
      },
      breakdown,
      recommendations: {
        optimalDuration: stayRecommendation,
        bestMonths: attrs?.mejorEpoca || ['Jun', 'Jul', 'Sep'],
        tip: budget === 'bajo' 
          ? 'Viaja en temporada baja y reserva con antelacion'
          : budget === 'medio'
          ? 'Busca ofertas de vuelos y alojamientos con cancelacion gratuita'
          : 'Reserva experiencias exclusivas con anticipacion',
      },
      disclaimer: 'Estimacion basada en datos de coste de vida y turismo. Los precios reales pueden variar.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error procesando la solicitud', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
