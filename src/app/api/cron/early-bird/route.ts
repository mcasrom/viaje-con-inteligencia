import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('EarlyBirdCron');

export const dynamic = 'force-dynamic';
export const maxDuration = 180;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { buildEarlyBirdDigest, sendEarlyBirdDigest, saveEarlyBirdDigest } = await import('@/lib/early-bird');

    log.info('Building early bird digest...');
    const digest = await buildEarlyBirdDigest();

    if (!digest) {
      return NextResponse.json({ status: 'skipped', reason: 'No content generated' });
    }

    log.info('Sending early bird digest...');
    const ok = await sendEarlyBirdDigest(digest);

    // Extract stats from digest for DB record
    const lines = digest.split('\n');
    const incidentsMatch = lines.find(l => l.includes('• Incidentes:'));
    const maecMatch = lines.find(l => l.includes('• Cambios MAEC:'));
    const sentimentMatch = lines.find(l => l.includes('• Sentimiento negativo:'));
    const healthMatch = lines.find(l => l.includes('• Sistema:'));
    const trafficPvMatch = lines.find(l => l.includes('Page views:'));
    const trafficUniqMatch = lines.find(l => l.includes('Visitantes únicos:'));
    const subsMatch = lines.find(l => l.includes('suscriptores verificados'));

    const incidentsCount = incidentsMatch ? parseInt(incidentsMatch.match(/\d+/)?.[0] || '0') : 0;
    const maecChangesCount = maecMatch ? parseInt(maecMatch.match(/\d+/)?.[0] || '0') : 0;
    const sentimentAlertsCount = sentimentMatch ? parseInt(sentimentMatch.match(/\d+/)?.[0] || '0') : 0;
    const healthOk = healthMatch ? parseInt(healthMatch.match(/(\d+)\/\d+/)?.[1] || '0') : 0;
    const healthFail = healthMatch ? parseInt(healthMatch.match(/\/(\d+)/)?.[1] || '0') : 0;
    const trafficPageViews = trafficPvMatch ? parseInt(trafficPvMatch.match(/[\d.]+/)?.[0]?.replace('.', '') || '0') : null;
    const trafficUniques = trafficUniqMatch ? parseInt(trafficUniqMatch.match(/[\d.]+/)?.[0]?.replace('.', '') || '0') : null;
    const newsletterSubscribers = subsMatch ? parseInt(subsMatch.match(/\d+/)?.[0] || '0') : 0;

    await saveEarlyBirdDigest({
      created_at: new Date().toISOString(),
      digest_text: digest,
      incidents_count: incidentsCount,
      maec_changes_count: maecChangesCount,
      sentiment_alerts_count: sentimentAlertsCount,
      health_ok: healthOk,
      health_fail: healthFail,
      traffic_page_views: trafficPageViews,
      traffic_uniques: trafficUniques,
      newsletter_subscribers: newsletterSubscribers,
      sent_telegram: true,
      sent_email: true,
    });

    return NextResponse.json({
      status: ok ? 'ok' : 'error',
      message: ok ? 'Early bird digest sent & saved' : 'Failed to send, but saved to DB',
      preview: digest.slice(0, 200) + '...',
    });
  } catch (e: any) {
    log.error('Early bird cron failed', e);
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 });
  }
}
