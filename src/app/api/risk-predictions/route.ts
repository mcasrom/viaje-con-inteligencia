import { NextRequest, NextResponse } from 'next/server';
import { predictAllCountries, predictCountry } from '@/lib/ml-risk-predictor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '107', 10);
    const sortBy = searchParams.get('sort') || 'riskScore';
    const order = searchParams.get('order') || 'desc';

    let predictions: any[] = [];

    if (country) {
      const result = await predictCountry(country);
      predictions = result ? [result] : [];
    } else {
      predictions = await predictAllCountries();
    }

    predictions = Array.isArray(predictions) ? predictions : [];

    predictions.sort((a, b) => {
      const aVal = sortBy === 'up7d' ? a.probabilityUp7d : sortBy === 'up14d' ? a.probabilityUp14d : sortBy === 'up30d' ? a.probabilityUp30d : a.riskScore;
      const bVal = sortBy === 'up7d' ? b.probabilityUp7d : sortBy === 'up14d' ? b.probabilityUp14d : sortBy === 'up30d' ? b.probabilityUp30d : b.riskScore;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return NextResponse.json({
      ok: true,
      total: predictions.length,
      predictions: predictions.slice(0, limit),
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Risk predictions error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 });
  }
}
