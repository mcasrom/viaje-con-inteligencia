import { NextResponse } from 'next/server';
import { validateModels } from '@/lib/ml-validate';
import { createLogger } from '@/lib/logger';

const log = createLogger('ValidateModels');

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  log.info('Starting model validation...');
  const start = Date.now();

  const result = await validateModels();

  const elapsed = Date.now() - start;
  log.info(`Validation complete in ${elapsed}ms`);

  return NextResponse.json({
    success: true,
    elapsed_ms: elapsed,
    result,
  });
}
