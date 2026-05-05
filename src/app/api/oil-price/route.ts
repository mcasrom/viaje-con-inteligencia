import { NextRequest, NextResponse } from 'next/server';
import { getCurrentOilPrice, getOilImpactAnalysis, getGlobalConflictImpact, getDemandShiftAnalysis } from '@/data/tci-engine';

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

  const oil = getCurrentOilPrice();
  const avg = oil.price - oil.vsAvg;
  return NextResponse.json({ price: oil.price, avg, changePct: oil.vsAvg, trend: oil.trend });
}
