import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentOilPrice, getOilImpactAnalysis, getGlobalConflictImpact, getDemandShiftAnalysis, getOilHistory } from '@/data/tci-engine';
import { getAirspaceClosuresLive, getAffectedRoutesLive, getDemandShiftsLive, getSeasonalityLive } from '@/lib/airspace';

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
      .from('oil_prices_history')
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
    const real = await getRealOilData();
    if (real) {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return NextResponse.json({
        currentPrice: real.price,
        avgPrice: real.avg,
        changePct: real.changePct,
        trend: real.trend,
        months: real.history.slice(-12).map(o => {
          const tciImpact = Math.round(((o.price / real.avg) * 100 - 100) * 10) / 10;
          const m = parseInt(o.month.slice(5));
          return { month: (meses[m - 1] || o.month.slice(5)) + '/' + o.month.slice(2, 4), price: o.price, tciImpact };
        }),
      });
    }
    return NextResponse.json(getOilImpactAnalysis());
  }

  if (action === 'conflicts') {
    const [closures, routes] = await Promise.all([getAirspaceClosuresLive(), getAffectedRoutesLive()]);
    return NextResponse.json(getGlobalConflictImpact(closures, routes));
  }

  if (action === 'shifts') {
    const [demandShifts, seasonality] = await Promise.all([getDemandShiftsLive(), getSeasonalityLive()]);
    return NextResponse.json(getDemandShiftAnalysis(demandShifts, seasonality));
  }

  const real = await getRealOilData();

  const [liveClosures, liveRoutes] = await Promise.all([getAirspaceClosuresLive(), getAffectedRoutesLive()]);

  if (real) {
    const eurUsd = await getEurUsd();
    return NextResponse.json({
      price: real.price,
      avg: real.avg,
      changePct: real.changePct,
      trend: real.trend,
      eurUsd,
      history: real.history.slice(-12),
      avgSurcharge: getGlobalConflictImpact(liveClosures, liveRoutes).avgSurcharge,
      tciImpact: 0,
    });
  }

  // Fallback a datos hardcode si Supabase no tiene data
  const oil = getCurrentOilPrice();
  const avg = oil.price - oil.vsAvg;
  const impact = getOilImpactAnalysis();
  const conflict = getGlobalConflictImpact(liveClosures, liveRoutes);
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
