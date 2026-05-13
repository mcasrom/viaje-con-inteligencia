import { NextResponse } from 'next/server';
import { getAirspaceStatuses, detectAnomalousAirspace } from '@/lib/opensky';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'status';

  try {
    if (mode === 'anomalies') {
      const anomalies = await detectAnomalousAirspace();
      return NextResponse.json({ anomalies, timestamp: new Date().toISOString() });
    }

    const codesParam = searchParams.get('codes');
    const codes = codesParam ? codesParam.split(',').map(c => c.trim().toLowerCase()) : undefined;
    const statuses = await getAirspaceStatuses(codes);

    return NextResponse.json({
      statuses,
      total: statuses.length,
      active: statuses.filter(s => s.isActive).length,
      inactive: statuses.filter(s => !s.isActive && s.flightCount >= 0).length,
      unknown: statuses.filter(s => s.flightCount < 0).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching airspace data', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
