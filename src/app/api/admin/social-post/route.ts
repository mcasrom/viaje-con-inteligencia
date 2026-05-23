import { NextResponse } from 'next/server';
import { postToMastodon } from '@/lib/mastodon';
import { publishToBluesky } from '@/lib/bluesky';
import { sendTelegramMessage } from '@/lib/telegram-channel';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const results: Record<string, { success: boolean; url?: string; error?: string }> = {};

    const [mastodonRes, blueskyRes, telegramRes] = await Promise.allSettled([
      postToMastodon(text.trim()),
      publishToBluesky(text.trim()),
      sendTelegramMessage(text.trim()),
    ]);

    if (mastodonRes.status === 'fulfilled') {
      results.mastodon = mastodonRes.value;
    } else {
      results.mastodon = { success: false, error: mastodonRes.reason?.message || 'Unknown error' };
    }

    if (blueskyRes.status === 'fulfilled') {
      results.bluesky = blueskyRes.value;
    } else {
      results.bluesky = { success: false, error: blueskyRes.reason?.message || 'Unknown error' };
    }

    if (telegramRes.status === 'fulfilled') {
      results.telegram = telegramRes.value ? { success: true } : { success: false, error: 'Telegram send failed' };
    } else {
      results.telegram = { success: false, error: telegramRes.reason?.message || 'Unknown error' };
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
