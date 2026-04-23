import { NextRequest, NextResponse } from 'next/server';
import { clusterDestinations, getDestinationsWithFeatures } from '@/data/clustering';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const nClusters = parseInt(request.nextUrl.searchParams.get('clusters') || '4');
  const showFeatures = request.nextUrl.searchParams.get('features') === 'true';

  try {
    const clusters = clusterDestinations(nClusters);
    const destinations = getDestinationsWithFeatures();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      method: 'K-Means (simple)',
      nClusters,
      clusters,
      numDestinations: destinations.length,
      ...(showFeatures && { destinations: destinations.slice(0, 30) }),
    });
  } catch (error) {
    console.error('Clustering error:', error);
    return NextResponse.json(
      { error: 'Error al calcular clustering' },
      { status: 500 }
    );
  }
}