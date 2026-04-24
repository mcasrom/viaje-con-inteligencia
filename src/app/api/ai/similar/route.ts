import { NextRequest, NextResponse } from 'next/server';
import { findSimilarDestinations } from '@/data/clustering';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || 'es';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5');

  try {
    const similar = findSimilarDestinations(code, limit);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      code,
      similar,
    });
  } catch (error) {
    console.error('Similar error:', error);
    return NextResponse.json(
      { error: 'Error al buscar destinos similares' },
      { status: 500 }
    );
  }
}