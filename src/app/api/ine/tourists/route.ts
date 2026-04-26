import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const ineTourismData: Record<string, { arrivals: number; pernoctaciones: number; estanciaMedia: number; ano: number }> = {
  es: { arrivals: 85000000, pernoctaciones: 272000000, estanciaMedia: 7.2, ano: 2024 },
  fr: { arrivals: 100000000, pernoctaciones: 430000000, estanciaMedia: 9.5, ano: 2024 },
  us: { arrivals: 67000000, pernoctaciones: 450000000, estanciaMedia: 7.8, ano: 2024 },
  it: { arrivals: 57000000, pernoctaciones: 210000000, estanciaMedia: 6.8, ano: 2024 },
  tr: { arrivals: 55000000, pernoctaciones: 190000000, estanciaMedia: 7.2, ano: 2024 },
  mx: { arrivals: 42000000, pernoctaciones: 142000000, estanciaMedia: 6.5, ano: 2024 },
  gb: { arrivals: 38000000, pernoctaciones: 143000000, estanciaMedia: 7.1, ano: 2024 },
  de: { arrivals: 33000000, pernoctaciones: 98000000, estanciaMedia: 5.8, ano: 2024 },
  gr: { arrivals: 33000000, pernoctaciones: 95000000, estanciaMedia: 7.8, ano: 2024 },
  pt: { arrivals: 25000000, pernoctaciones: 82000000, estanciaMedia: 7.5, ano: 2024 },
  th: { arrivals: 28000000, pernoctaciones: 98000000, estanciaMedia: 10.2, ano: 2024 },
  jp: { arrivals: 25000000, pernoctaciones: 90000000, estanciaMedia: 8.5, ano: 2024 },
  cn: { arrivals: 29000000, pernoctaciones: 105000000, estanciaMedia: 7.2, ano: 2024 },
  in: { arrivals: 18000000, pernoctaciones: 52000000, estanciaMedia: 11.5, ano: 2024 },
  eg: { arrivals: 14000000, pernoctaciones: 42000000, estanciaMedia: 9.2, ano: 2024 },
  ma: { arrivals: 13000000, pernoctaciones: 38000000, estanciaMedia: 7.5, ano: 2024 },
  au: { arrivals: 9500000, pernoctaciones: 38000000, estanciaMedia: 10.2, ano: 2024 },
  ca: { arrivals: 23000000, pernoctaciones: 76000000, estanciaMedia: 7.8, ano: 2024 },
  br: { arrivals: 6600000, pernoctaciones: 21000000, estanciaMedia: 9.5, ano: 2024 },
  ar: { arrivals: 5700000, pernoctaciones: 15000000, estanciaMedia: 7.2, ano: 2024 },
  kr: { arrivals: 17500000, pernoctaciones: 52000000, estanciaMedia: 6.8, ano: 2024 },
  vn: { arrivals: 16000000, pernoctaciones: 48000000, estanciaMedia: 9.5, ano: 2024 },
  id: { arrivals: 15500000, pernoctaciones: 52000000, estanciaMedia: 10.5, ano: 2024 },
  my: { arrivals: 27000000, pernoctaciones: 95000000, estanciaMedia: 7.2, ano: 2024 },
  ph: { arrivals: 8300000, pernoctaciones: 28000000, estanciaMedia: 9.8, ano: 2024 },
  se: { arrivals: 7000000, pernoctaciones: 21000000, estanciaMedia: 6.5, ano: 2024 },
  no: { arrivals: 6400000, pernoctaciones: 18500000, estanciaMedia: 6.2, ano: 2024 },
  nl: { arrivals: 22000000, pernoctaciones: 72000000, estanciaMedia: 7.2, ano: 2024 },
  be: { arrivals: 9000000, pernoctaciones: 28000000, estanciaMedia: 6.5, ano: 2024 },
  ch: { arrivals: 6200000, pernoctaciones: 19000000, estanciaMedia: 7.2, ano: 2024 },
  at: { arrivals: 31000000, pernoctaciones: 105000000, estanciaMedia: 7.8, ano: 2024 },
  pl: { arrivals: 21000000, pernoctaciones: 65000000, estanciaMedia: 6.2, ano: 2024 },
  cz: { arrivals: 12000000, pernoctaciones: 38000000, estanciaMedia: 6.8, ano: 2024 },
  hu: { arrivals: 5400000, pernoctaciones: 14500000, estanciaMedia: 5.5, ano: 2024 },
  ie: { arrivals: 11000000, pernoctaciones: 35000000, estanciaMedia: 6.8, ano: 2024 },
  hr: { arrivals: 17000000, pernoctaciones: 52000000, estanciaMedia: 7.5, ano: 2024 },
  dk: { arrivals: 16000000, pernoctaciones: 42000000, estanciaMedia: 6.2, ano: 2024 },
  fi: { arrivals: 3300000, pernoctaciones: 8500000, estanciaMedia: 5.5, ano: 2024 },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source') || 'ine';
  
  try {
    const data = Object.entries(ineTourismData).map(([code, stats]) => ({
      code,
      arrivals: stats.arrivals,
      pernoctaciones: stats.pernoctaciones,
      estanciaMedia: stats.estanciaMedia,
      ano: stats.ano,
    }));

    return NextResponse.json({
      source,
      description: 'Datos turísticos basados en INE/UNWTO',
      timestamp: new Date().toISOString(),
      count: data.length,
      data: data.sort((a, b) => b.arrivals - a.arrivals),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching tourism data' },
      { status: 500 }
    );
  }
}