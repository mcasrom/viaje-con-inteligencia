import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('EarlyBirdCron');

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { buildEarlyBirdDigest, sendEarlyBirdDigest } = await import('@/lib/early-bird');

    log.info('Building early bird digest...');
    const digest = await buildEarlyBirdDigest();

    if (!digest) {
      return NextResponse.json({ status: 'skipped', reason: 'No content generated' });
    }

    log.info('Sending early bird digest...');
    const ok = await sendEarlyBirdDigest(digest);

    return NextResponse.json({
      status: ok ? 'ok' : 'error',
      message: ok ? 'Early bird digest sent' : 'Failed to send',
      preview: digest.slice(0, 200) + '...',
    });
  } catch (e: any) {
    log.error('Early bird cron failed', e);
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 });
  }
}
