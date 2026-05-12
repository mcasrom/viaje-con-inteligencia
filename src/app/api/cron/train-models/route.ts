import { NextResponse } from 'next/server';
import { trainModel } from '@/lib/model-trainer';
import { createLogger } from '@/lib/logger';

const log = createLogger('TrainModels');

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('Starting standalone model training...');
  const start = Date.now();

  const result = await trainModel();

  const elapsed = Date.now() - start;
  log.info(`Completed in ${elapsed}ms: success=${result.success}`);

  return NextResponse.json({
    success: result.success,
    elapsed_ms: elapsed,
    metrics: result.metrics,
    error: result.error,
  });
}
