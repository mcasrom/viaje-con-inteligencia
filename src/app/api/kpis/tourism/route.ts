import { NextRequest, NextResponse } from 'next/server';
import { getTourismKPIs, getTopDestinations } from '@/data/clustering';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const metric = request.nextUrl.searchParams.get('metric') || 'arrivals';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

  try {
    if (metric === 'all') {
      const kpis = getTourismKPIs();
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        source: 'UNWTO / OMT 2024',
        ...kpis,
      });
    }

    const top = getTopDestinations(metric, limit);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metric,
      source: 'UNWTO / OMT 2024',
      top,
    });
  } catch (error) {
    console.error('KPIs error:', error);
    return NextResponse.json(
      { error: 'Error al obtener KPIs de turismo' },
      { status: 500 }
    );
  }
}