import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

const FALLBACK_HISTORY = [
  { date: '2026-01-15', price: 78.2 },
  { date: '2026-01-22', price: 79.5 },
  { date: '2026-01-29', price: 80.1 },
  { date: '2026-02-05', price: 81.3 },
  { date: '2026-02-12', price: 82.7 },
  { date: '2026-02-19', price: 83.4 },
  { date: '2026-02-26', price: 84.6 },
  { date: '2026-03-05', price: 87.2 },
  { date: '2026-03-12', price: 89.5 },
  { date: '2026-03-19', price: 92.1 },
  { date: '2026-03-26', price: 94.3 },
  { date: '2026-04-02', price: 95.8 },
  { date: '2026-04-09', price: 97.2 },
  { date: '2026-04-16', price: 98.5 },
  { date: '2026-04-23', price: 100.1 },
  { date: '2026-04-30', price: 101.8 },
  { date: '2026-05-07', price: 103.4 },
];

const CONFLICT_EVENTS = [
  { date: '2026-04-01', event: 'Escalada Israel-Irán: ataque a instalaciones nucleares', impact: 8 },
  { date: '2026-04-15', event: 'Cierre temporal Estrecho de Ormuz (amenaza Irán)', impact: 12 },
  { date: '2026-04-22', event: 'Sanciones adicionales a exportaciones Irán', impact: 5 },
  { date: '2026-05-01', event: 'OPEC+ anuncia recortes de producción', impact: 7 },
  { date: '2026-05-05', event: 'Tensiones Líbano-Israel: cierre espacio aéreo Beirut', impact: 4 },
];

async function getOilHistory(): Promise<{ date: string; price: number }[]> {
  if (!isSupabaseAdminConfigured()) return FALLBACK_HISTORY;

  try {
    const { data } = await supabaseAdmin
      .from('oil_prices_history')
      .select('date, price_usd')
      .order('date', { ascending: true })
      .limit(52);

    if (data && data.length > 0) {
      return data.map(d => ({ date: d.date, price: d.price_usd }));
    }
  } catch {
  }

  return FALLBACK_HISTORY;
}

function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = data[i] - yMean;
    ssXY += xDiff * yDiff;
    ssXX += xDiff * xDiff;
    ssYY += yDiff * yDiff;
  }
  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;
  const r2 = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
  return { slope, intercept, r2 };
}

function movingAverage(data: number[], window: number): number {
  const slice = data.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function exponentialSmoothing(data: number[], alpha: number): number {
  let smoothed = data[0];
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed;
  }
  return smoothed;
}

export async function GET() {
  const history = await getOilHistory();
  const prices = history.map(h => h.price);
  const currentPrice = prices[prices.length - 1];
  const prices7d = prices.slice(-3);
  const prices30d = prices.slice(-8);

  const ma7 = movingAverage(prices, 3);
  const ma30 = movingAverage(prices, 8);
  const ema = exponentialSmoothing(prices, 0.3);

  const reg = linearRegression(prices);
  const reg7 = linearRegression(prices7d);
  const reg30 = linearRegression(prices30d);

  const prediction7d = reg7.slope * 7 + reg7.intercept;
  const prediction14d = reg.slope * 14 + reg.intercept;
  const prediction30d = reg.slope * 30 + reg.intercept;

  const emaPrediction = ema + reg.slope * 7;
  const blended7d = (prediction7d * 0.5 + emaPrediction * 0.3 + (currentPrice + reg7.slope * 7) * 0.2);
  const blended14d = Math.min(blended7d + reg.slope * 7, 150);

  const conflictPremium = CONFLICT_EVENTS.reduce((sum, e) => sum + e.impact, 0);
  const basePrice = currentPrice - conflictPremium * 0.5;

  const trend = reg.slope > 0.5 ? 'alcista' : reg.slope > 0 ? 'ligeramente alcista' : reg.slope < -0.5 ? 'bajista' : 'estable';
  const momentum = (currentPrice - prices[prices.length - 8]) / prices[prices.length - 8] * 100;

  const pastAnalysis = {
    period: 'Últimos 4 meses',
    startPrice: prices[0],
    currentPrice,
    change: currentPrice - prices[0],
    changePct: Math.round((currentPrice - prices[0]) / prices[0] * 1000) / 10,
    trend,
    volatility: Math.round(Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - (prices.reduce((a, b) => a + b, 0) / prices.length), 2), 0) / prices.length) * 10) / 10,
    maxPrice: Math.max(...prices),
    minPrice: Math.min(...prices),
  };

  const presentAnalysis = {
    currentPrice,
    ma7: Math.round(ma7 * 100) / 100,
    ma30: Math.round(ma30 * 100) / 100,
    ema: Math.round(ema * 100) / 100,
    momentum7d: Math.round((currentPrice - ma7) / ma7 * 1000) / 10,
    momentum30d: Math.round(momentum * 10) / 10,
    rsi: Math.round(Math.min(95, Math.max(5, (1 - 2 / (1 + Math.exp(reg.slope * 3))) * 100)) * 10) / 10,
    aboveMA7: currentPrice > ma7,
    aboveMA30: currentPrice > ma30,
  };

  const futureAnalysis = {
    prediction7d: Math.round(blended7d * 100) / 100,
    prediction14d: Math.round(blended14d * 100) / 100,
    prediction30d: Math.round(prediction30d * 100) / 100,
    confidence: Math.round(Math.min(85, Math.max(30, reg.r2 * 70 + 20)) * 10) / 10,
    scenarios: {
      bullish: { price: Math.round((blended7d + reg.slope * 7 + conflictPremium * 0.3) * 100) / 100, probability: 35, reason: 'Escalada Oriente Medio + OPEC+' },
      base: { price: Math.round(blended7d * 100) / 100, probability: 45, reason: 'Tendencia actual + primas de riesgo' },
      bearish: { price: Math.round((blended7d - reg.slope * 3 - conflictPremium * 0.2) * 100) / 100, probability: 20, reason: 'Tregua diplomática + aumento oferta' },
    },
    riskFactors: CONFLICT_EVENTS.map(e => ({
      date: e.date,
      event: e.event,
      impactUSD: `+$${e.impact}/barril estimado`,
    })),
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    source: history.length === FALLBACK_HISTORY.length ? 'hardcoded' : 'supabase',
    dataPoints: history.length,
    past: pastAnalysis,
    present: presentAnalysis,
    future: futureAnalysis,
    conflictEvents: CONFLICT_EVENTS,
  });
}
