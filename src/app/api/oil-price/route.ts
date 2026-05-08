import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentOilPrice, getOilImpactAnalysis, getGlobalConflictImpact, getDemandShiftAnalysis, getOilHistory } from '@/data/tci-engine';

async function getEurUsd(): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return 0.92;
    const data = await res.json();
    return data.rates?.EUR ?? 0.92;
  } catch {
    return 0.92;
  }
}

async function getRealOilData() {
  try {
    const { data, error } = await supabaseAdmin
      .from('oil_price_history')
      .select('date, price_usd')
      .order('date', { ascending: true });

    if (error || !data || data.length < 2) return null;

    const mapped = data.map(d => ({
      month: d.date.slice(0, 7),
      price: d.price_usd,
    }));

    const latest = mapped[mapped.length - 1];
    const prev = mapped[mapped.length - 2];
    const avg = mapped.reduce((s, o) => s + o.price, 0) / mapped.length;
    const changePct = Math.round((latest.price - prev.price) / prev.price * 1000) / 10;
    const trend: 'up' | 'down' | 'stable' = changePct > 0.5 ? 'up' : changePct < -0.5 ? 'down' : 'stable';

    return { price: latest.price, avg, changePct, trend, history: mapped };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'impact') {
    return NextResponse.json(getOilImpactAnalysis());
  }

  if (action === 'conflicts') {
    return NextResponse.json(getGlobalConflictImpact());
  }

  if (action === 'shifts') {
    return NextResponse.json(getDemandShiftAnalysis());
  }

  const real = await getRealOilData();

  if (real) {
    const eurUsd = await getEurUsd();
    return NextResponse.json({
      price: real.price,
      avg: real.avg,
      changePct: real.changePct,
      trend: real.trend,
      eurUsd,
      history: real.history.slice(-12),
      avgSurcharge: getGlobalConflictImpact().avgSurcharge,
      tciImpact: 0,
    });
  }

  // Fallback a datos hardcode si Supabase no tiene data
  const oil = getCurrentOilPrice();
  const avg = oil.price - oil.vsAvg;
  const impact = getOilImpactAnalysis();
  const conflict = getGlobalConflictImpact();
  const history = getOilHistory();
  const eurUsd = await getEurUsd();

  return NextResponse.json({
    price: oil.price,
    avg,
    changePct: oil.vsAvg,
    trend: oil.trend,
    eurUsd,
    history: history.slice(-12),
    avgSurcharge: conflict.avgSurcharge,
    tciImpact: impact.months[impact.months.length - 1]?.tciImpact ?? 0,
  });
}
