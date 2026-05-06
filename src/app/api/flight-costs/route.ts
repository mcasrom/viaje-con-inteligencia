import { NextRequest, NextResponse } from 'next/server';
import {
  calculateTCI,
  analyzeTCITrend,
  monthlyTCIPattern,
  getTCIForAllCountries,
  getConflictImpact,
  getOilHistory,
  getOilImpactAnalysis,
} from '@/data/tci-engine';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

async function getDynamicOilData(): Promise<{
  currentPrice: number | null;
  history: { month: string; price: number }[];
  source: string;
} | null> {
  if (!isSupabaseAdminConfigured()) return null;

  try {
    const { data: prices, error } = await supabaseAdmin
      .from('oil_prices_history')
      .select('date, price_usd, source')
      .order('date', { ascending: true });

    if (error || !prices || prices.length === 0) return null;

    const history = prices.map(p => ({
      month: p.date.substring(0, 7),
      price: p.price_usd,
    }));

    const latest = prices[prices.length - 1];

    return {
      currentPrice: latest.price_usd,
      history,
      source: latest.source,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'all') {
    const all = getTCIForAllCountries();
    const oilData = await getDynamicOilData();

    return NextResponse.json({
      countries: all,
      oilPrice: oilData?.currentPrice || null,
      oilSource: oilData?.source || 'hardcoded',
    });
  }

  if (action === 'detail') {
    const country = searchParams.get('country');
    if (!country) return NextResponse.json({ error: 'country required' }, { status: 400 });

    const tci = calculateTCI(country);
    const trend = analyzeTCITrend(country);
    const monthly = monthlyTCIPattern(country);
    const conflict = getConflictImpact(country);
    const oilData = await getDynamicOilData();

    return NextResponse.json({
      tci,
      trend,
      monthly,
      conflict,
      oilPrice: oilData?.currentPrice || tci.oilPrice,
      oilSource: oilData?.source || 'hardcoded',
    });
  }

  if (action === 'oil') {
    const oilData = await getDynamicOilData();

    if (oilData) {
      return NextResponse.json({
        oil: oilData.history,
        currentPrice: oilData.currentPrice,
        source: oilData.source,
        dynamic: true,
      });
    }

    const hardcoded = getOilHistory();
    return NextResponse.json({
      oil: hardcoded,
      source: 'hardcoded',
      dynamic: false,
    });
  }

  if (action === 'oil-impact') {
    const impact = getOilImpactAnalysis();
    const oilData = await getDynamicOilData();

    return NextResponse.json({
      ...impact,
      dynamicPrice: oilData?.currentPrice || null,
      source: oilData?.source || 'hardcoded',
    });
  }

  const all = getTCIForAllCountries();
  return NextResponse.json({ countries: all });
}
