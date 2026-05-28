import { NextRequest, NextResponse } from 'next/server';
import { predictTrend, logTrendPrediction } from '@/lib/trend-predictor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ country: string }> }) {
  try {
    const { country } = await params;
    if (!country) {
      return NextResponse.json({ error: 'Country code required' }, { status: 400 });
    }

    const prediction = await predictTrend(country);
    if (!prediction) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    // Log prediction asynchronously
    logTrendPrediction(prediction).catch(() => {});

    return NextResponse.json(prediction);
  } catch (err: any) {
    console.error('Trend prediction error:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
