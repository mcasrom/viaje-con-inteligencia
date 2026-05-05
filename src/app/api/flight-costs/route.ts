import { NextRequest, NextResponse } from 'next/server';
import { calculateTCI, analyzeTCITrend, monthlyTCIPattern, getTCIForAllCountries, getConflictImpact, getOilHistory } from '@/data/tci-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'all') {
    const all = getTCIForAllCountries();
    return NextResponse.json({ countries: all });
  }

  if (action === 'detail') {
    const country = searchParams.get('country');
    if (!country) return NextResponse.json({ error: 'country required' }, { status: 400 });
    const tci = calculateTCI(country);
    const trend = analyzeTCITrend(country);
    const monthly = monthlyTCIPattern(country);
    const conflict = getConflictImpact(country);
    return NextResponse.json({ tci, trend, monthly, conflict });
  }

  if (action === 'oil') {
    const oil = getOilHistory();
    return NextResponse.json({ oil });
  }

  // Default: return all countries ranking
  const all = getTCIForAllCountries();
  return NextResponse.json({ countries: all });
}
