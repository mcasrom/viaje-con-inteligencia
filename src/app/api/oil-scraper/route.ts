import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

const OIL_SOURCES = [
  {
    name: 'Yahoo Finance',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1d',
    parse: (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
      } catch { return null; }
    }
  },
  {
    name: 'OilPriceAPI',
    url: 'https://api.oilpriceapi.com/v1/prices/latest',
    headers: {
      'Authorization': `Bearer ${process.env.OIL_PRICE_API_KEY || ''}`,
      'Accept': 'application/json',
    },
    parse: (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        return data?.data?.price || null;
      } catch { return null; }
    }
  },
  {
    name: 'Investing.com (fallback)',
    url: 'https://api.investing.com/api/financialdata/brentoilfutures/streaming',
    parse: (html: string) => {
      const match = html.match(/last_price["\s]*[:\s]*([\d.]+)/);
      return match ? parseFloat(match[1]) : null;
    }
  },
];

async function fetchOilPrice(): Promise<{ price: number | null; source: string }> {
  for (const src of OIL_SOURCES) {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...(src.headers || {}),
      };

      const res = await fetch(src.url, {
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;

      const text = await res.text();
      const price = src.parse(text);

      if (price && price > 30 && price < 200) {
        return { price: Math.round(price * 100) / 100, source: src.name };
      }
    } catch (e) {
      console.warn(`Oil fetch failed (${src.name}):`, e);
    }
  }
  return { price: null, source: 'none' };
}

async function saveOilPrice(price: number, source: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured()) return false;

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabaseAdmin
    .from('oil_prices_history')
    .upsert(
      { date: today, price_usd: price, source },
      { onConflict: 'date' }
    );

  if (error) {
    console.error('Error saving oil price:', error);
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'scrape') {
    const { price, source } = await fetchOilPrice();

    if (price) {
      const saved = await saveOilPrice(price, source);
      return NextResponse.json({
        success: true,
        price,
        source,
        saved_to_db: saved,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      error: 'All sources failed',
      timestamp: new Date().toISOString(),
    }, { status: 502 });
  }

  if (action === 'latest') {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('oil_prices_history')
      .select('date, price_usd, source')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      date: data.date,
      price: data.price_usd,
      source: data.source,
    });
  }

  if (action === 'history') {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const limit = parseInt(searchParams.get('limit') || '30');

    const { data, error } = await supabaseAdmin
      .from('oil_prices_history')
      .select('date, price_usd, source')
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: data?.length || 0,
      prices: data?.map(d => ({
        month: d.date.substring(0, 7),
        price: d.price_usd,
        source: d.source,
      })) || [],
    });
  }

  return NextResponse.json({
    endpoints: [
      '?action=scrape - Fetch and save current oil price',
      '?action=latest - Get latest stored price',
      '?action=history&limit=30 - Get price history',
    ],
  });
}
