import { NextResponse } from 'next/server';
import { comparePredictions } from '@/lib/ml-compare';
import { createLogger } from '@/lib/logger';

const log = createLogger('CompareModels');

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('Starting RF vs heuristic comparison...');
  const start = Date.now();

  const result = await comparePredictions();

  const largeDeviations = result.comparisons.filter(c =>
    (c.rf.riskScore !== null && Math.abs(c.diff.riskScore ?? 0) > 5) ||
    (c.rf.probUp7d !== null && Math.abs(c.diff.probUp7d ?? 0) > 0.05)
  ).map(c => ({
    code: c.code, name: c.name, riskLevel: c.riskLevel,
    heuristic: c.heuristic, rf: c.rf, diff: c.diff,
  }));

  const elapsed = Date.now() - start;

  return NextResponse.json({
    success: true,
    elapsed_ms: elapsed,
    summary: {
      totalCountries: result.totalCountries,
      rfModelsLoaded: result.rfModelsLoaded,
      mae: result.mae,
      maxDeviation: result.maxDeviation,
      countriesWithLargeDeviation: result.countriesWithLargeDeviation,
    },
    comparisonsSample: result.comparisons.slice(0, 10),
    largeDeviations,
    totalComparisonResults: result.comparisons.length,
  });
}
