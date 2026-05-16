import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('SocialAnalytics');

const BS_HANDLE = process.env.BLUESKY_HANDLE || '';
const BS_PASSWORD = process.env.BLUESKY_APP_PASSWORD || '';
const MASTODON_TOKEN = process.env.MASTODON_ACCESS_TOKEN || '';
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHANNEL = process.env.TELEGRAM_CHANNEL_ID || '';

async function getBlueskyMetrics(uri: string): Promise<{ likes: number; shares: number; comments: number } | null> {
  try {
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: BS_HANDLE, password: BS_PASSWORD }),
    });
    if (!sessionRes.ok) return null;
    const { accessJwt } = await sessionRes.json();

    const threadRes = await fetch(
      `https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}`,
      { headers: { 'Authorization': `Bearer ${accessJwt}` } },
    );
    if (!threadRes.ok) return null;

    const data = await threadRes.json();
    const post = data.thread?.post;
    if (!post) return null;

    const replyCount = post.post?.replyCount ?? 0;

    return {
      likes: post.post?.likeCount ?? 0,
      shares: post.post?.repostCount ?? 0,
      comments: replyCount,
    };
  } catch (e) {
    log.error('Bluesky metrics error', e);
    return null;
  }
}

async function getMastodonMetrics(postId: string): Promise<{ likes: number; shares: number; comments: number } | null> {
  try {
    const res = await fetch(`https://mastodon.social/api/v1/statuses/${postId}`, {
      headers: { 'Authorization': `Bearer ${MASTODON_TOKEN}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      likes: data.favourites_count ?? 0,
      shares: data.reblogs_count ?? 0,
      comments: data.replies_count ?? 0,
    };
  } catch (e) {
    log.error('Mastodon metrics error', e);
    return null;
  }
}

async function getTelegramMetrics(messageId: number): Promise<{ reach: number } | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TG_TOKEN}/getChat?chat_id=${TG_CHANNEL}`,
    );
    if (!res.ok) {
      const body = await res.json();
      return body.ok ? { reach: body.result?.members_count ?? 0 } : null;
    }
    const body = await res.json();
    return { reach: body.result?.members_count ?? 0 };
  } catch (e) {
    log.error('Telegram metrics error', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const forcePlatform = body.platform || null;
    const isManual = body.manual || false;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    // Manual entry for X/Twitter
    if (isManual && forcePlatform === 'x_twitter' && body.entries) {
      let updated = 0;
      for (const entry of body.entries) {
        await supabaseAdmin.from('social_analytics').upsert({
          platform: 'x_twitter',
          post_slug: entry.post_slug,
          post_title: entry.post_title || null,
          post_url: entry.post_url || null,
          likes: entry.likes || 0,
          shares: entry.shares || 0,
          comments: entry.comments || 0,
          reach: entry.reach || 0,
          source: 'manual',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'platform,post_slug' });
        updated++;
      }
      return NextResponse.json({ success: true, results: { x_twitter: { updated } } });
    }

    const results: Record<string, any> = {};
    const { data: posts } = await supabaseAdmin
      .from('social_publish_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No hay posts publicados en el log', results: {} });
    }

    const platforms = forcePlatform ? [forcePlatform] : ['bluesky', 'mastodon', 'telegram'];

    for (const platform of platforms) {
      if (platform === 'bluesky') {
        const bskyPosts = posts.filter(p => p.platform === 'bluesky' && p.url);
        let updated = 0;
        for (const p of bskyPosts) {
          const uri = p.url;
          const metrics = await getBlueskyMetrics(uri);
          if (metrics) {
            await supabaseAdmin.from('social_analytics').upsert({
              platform: 'bluesky',
              post_slug: p.post_slug,
              post_url: uri,
              likes: metrics.likes,
              shares: metrics.shares,
              comments: metrics.comments,
              source: 'auto',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'platform,post_slug' });
            updated++;
          }
        }
        results.bluesky = { found: bskyPosts.length, updated };
      }

      if (platform === 'mastodon') {
        const mastodonPosts = posts.filter(p => p.platform === 'mastodon' && p.url);
        let updated = 0;
        for (const p of mastodonPosts) {
          const postId = p.url?.split('/').pop();
          if (!postId) continue;
          const metrics = await getMastodonMetrics(postId);
          if (metrics) {
            await supabaseAdmin.from('social_analytics').upsert({
              platform: 'mastodon',
              post_slug: p.post_slug,
              post_url: p.url,
              likes: metrics.likes,
              shares: metrics.shares,
              comments: metrics.comments,
              source: 'auto',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'platform,post_slug' });
            updated++;
          }
        }
        results.mastodon = { found: mastodonPosts.length, updated };
      }

      if (platform === 'telegram') {
        const tgPosts = posts.filter(p => p.platform === 'telegram');
        const tgMetrics = await getTelegramMetrics(0);
        let updated = 0;
        for (const p of tgPosts) {
          await supabaseAdmin.from('social_analytics').upsert({
            platform: 'telegram',
            post_slug: p.post_slug,
            post_url: p.url,
            reach: tgMetrics?.reach ?? 0,
            source: 'auto',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'platform,post_slug' });
          updated++;
        }
        results.telegram = { found: tgPosts.length, updated, subscribers: tgMetrics?.reach ?? 0 };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    log.error('Social analytics refresh error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const { data: analytics, error } = await supabaseAdmin
    .from('social_analytics')
    .select('*')
    .order('updated_at', { ascending: false });

  const { data: logEntries } = await supabaseAdmin
    .from('social_publish_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const summary = {
    totalPosts: logEntries?.length || 0,
    byPlatform: {} as Record<string, number>,
  };
  for (const entry of logEntries || []) {
    summary.byPlatform[entry.platform] = (summary.byPlatform[entry.platform] || 0) + 1;
  }

  return NextResponse.json({ analytics: analytics || [], publishLog: logEntries || [], summary });
}
