import { NextResponse } from 'next/server';
import { detectHeatmap } from '@/lib/trend-detector';

export const dynamic = 'force-dynamic';

export async function GET() {
  const heatmap = await detectHeatmap();
  return NextResponse.json({
    heatmap,
    total: heatmap.length,
    critical: heatmap.filter(h => h.level === 3).length,
    warning: heatmap.filter(h => h.level === 2).length,
    timestamp: new Date().toISOString(),
  });
}
