import { NextRequest, NextResponse } from 'next/server';

const OIL_SOURCES = [
  {
    name: 'Investing.com',
    url: 'https://api.investing.com/api/financialdata/brentoilfutures/streaming',
    parse: (html: string) => {
      const match = html.match(/last_price["\s]*[:\s]*([\d.]+)/);
      return match ? parseFloat(match[1]) : null;
    }
  },
  {
    name: 'Yahoo Finance API',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1d',
    parse: (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
      } catch { return null; }
    }
  }
];

async function scrapeOilPrice(): Promise<number | null> {
  for (const source of OIL_SOURCES) {
    try {
      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      const price = source.parse(text);
      if (price && price > 30 && price < 200) return price;
    } catch (e) {
      console.warn(`Oil scrape failed (${source.name}):`, e);
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'scrape') {
    const price = await scrapeOilPrice();
    if (price) {
      return NextResponse.json({ source: 'scraped', price: Math.round(price * 100) / 100, timestamp: new Date().toISOString() });
    }
    return NextResponse.json({ error: 'All sources failed' }, { status: 502 });
  }

  return NextResponse.json({ error: 'Use ?action=scrape' }, { status: 400 });
}
