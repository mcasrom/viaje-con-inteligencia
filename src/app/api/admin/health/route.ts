import { NextResponse } from 'next/server';
import { runHealthChecks, getHealthSummary } from '@/lib/health-check';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await runHealthChecks();
  const summary = getHealthSummary(results);
  return NextResponse.json({ results, summary, timestamp: new Date().toISOString() });
}
