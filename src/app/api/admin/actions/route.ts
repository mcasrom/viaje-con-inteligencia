import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPosts } from '@/lib/posts';
import { publishToMastodon } from '@/lib/mastodon';
import { sendTelegramMessage } from '@/lib/telegram-channel';

export const dynamic = 'force-dynamic';

function requireAuth(request: NextRequest) {
  const ADMIN_PASSWORD = 'Admin2026!Viaje';
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session')?.value;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || cookie || queryToken || '';
  return ADMIN_PASSWORD && provided === ADMIN_PASSWORD;
}

const BLOG_URL = 'https://www.viajeinteligencia.com/blog';

async function publishPostToSocial(post: any): Promise<{ telegram: boolean; mastodon: boolean; mastodonUrl: string | null }> {
  const telegramMsg = `📝 *${post.title}*\n\n${post.excerpt || ''}\n\n🔗 ${BLOG_URL}/${post.slug}\n\n#${(post.tags || []).map((t: string) => t.replace(/\s+/g, '')).join(' #')}`;
  
  const tgRes = await sendTelegramMessage(telegramMsg).catch(() => false);
  let mastodonUrl = null;
  const mastodonRes = await publishToMastodon(post.title, post.excerpt || '', post.slug, post.tags || []).catch(() => ({ success: false, url: null }));
  if (mastodonRes && (mastodonRes as any).url) {
    mastodonUrl = (mastodonRes as any).url;
  }
  
  return { telegram: !!tgRes, mastodon: !!mastodonUrl, mastodonUrl };
}

async function getPublishedPostsLog(): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data } = await supabase.from('social_publish_log').select('post_slug');
  return new Set((data || []).map((r: any) => r.post_slug));
}

async function logPublishedPost(slug: string, platform: string, url: string | null) {
  if (!supabase) return;
  await supabase.from('social_publish_log').insert({ post_slug: slug, platform, url });
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action;

  // Trigger cron jobs
  if (action === 'trigger-cron') {
    const cronPath = body.cronPath;
    const cronUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}${cronPath}`;
    try {
      const res = await fetch(cronUrl, {
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ success: true, cron: cronPath, result: data });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  }

  // Publish unpublished blog posts to social media
  if (action === 'publish-posts') {
    const allPosts = getAllPosts({ sort: 'recent' });
    const publishedSlugs = await getPublishedPostsLog();
    const toPublish = allPosts.filter(p => !publishedSlugs.has(p.slug));

    if (toPublish.length === 0) {
      return NextResponse.json({ success: true, message: 'Todos los posts ya publicados', count: 0 });
    }

    const results: any[] = [];
    for (const post of toPublish.slice(0, 10)) {
      try {
        const res = await publishPostToSocial(post);
        results.push({ slug: post.slug, title: post.title, ...res });
        if (res.telegram) await logPublishedPost(post.slug, 'telegram', null);
        if (res.mastodon && res.mastodonUrl) await logPublishedPost(post.slug, 'mastodon', res.mastodonUrl);
      } catch (e: any) {
        results.push({ slug: post.slug, title: post.title, error: e.message });
      }
    }

    return NextResponse.json({ success: true, published: results.length, results });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
