import { NextRequest, NextResponse } from 'next/server';
import { clusterDestinations, getDestinationsWithFeatures, updateTourismData } from '@/data/clustering';
import { getINEData } from '@/data/ine-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const nClusters = parseInt(request.nextUrl.searchParams.get('clusters') || '4');
  const showFeatures = request.nextUrl.searchParams.get('features') === 'true';

  try {
    // Load dynamic INE data if available
    const ineData = await getINEData();
    updateTourismData(ineData);

    const destinations = getDestinationsWithFeatures();
    const clusters = clusterDestinations(nClusters);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      method: 'K-Means (simple)',
      nClusters,
      clusters,
      numDestinations: destinations.length,
      dataSource: Object.values(ineData).some(d => d.source === 'INE-live') ? 'supabase' : 'hardcoded',
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
