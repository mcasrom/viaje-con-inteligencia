import { NextRequest, NextResponse } from 'next/server';
import { findSimilarDestinations, updateTourismData } from '@/data/clustering';
import { getINEData } from '@/data/ine-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'es';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');

  try {
    // Load dynamic INE data if available
    const ineData = await getINEData();
    updateTourismData(ineData);

    const similar = findSimilarDestinations(code, limit);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      code,
      similar,
      dataSource: Object.values(ineData).some(d => d.source === 'INE-live') ? 'supabase' : 'hardcoded',
    });
  } catch (error) {
    console.error('Similar error:', error);
    return NextResponse.json(
      { error: 'Error al buscar destinos similares' },
      { status: 500 }
    );
  }
}
