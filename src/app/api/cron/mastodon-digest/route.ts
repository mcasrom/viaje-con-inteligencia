import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

const MASTODON_URL = 'mastodon.social';
const ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;

export const dynamic = 'force-dynamic';

const publishedCacheFile = '.mastodon-published.json';

async function getPublishedIds(): Promise<string[]> {
  try {
    const res = await fetch('https://raw.githubusercontent.com/mcasrom/viaje-con-inteligencia/main/.mastodon-published.json', { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      return data.published || [];
    }
  } catch (e) {
    console.log('No cache file found');
  }
  return [];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Mastodon not configured' }, { status: 500 });
  }

  try {
    const allPosts = getAllPosts({ sort: 'recent' });
    const recentPosts = allPosts.slice(0, 5);
    
    const results = [];
    
    for (const post of recentPosts) {
      try {
        const hashtags = post.tags?.slice(0, 3).join(' #') || 'Viajes';
        const text = `📝 ${post.title}\n\n${post.excerpt?.slice(0, 150)}...\n\n🔗 https://viajeinteligencia.com/blog/${post.slug}\n\n#${hashtags} #España #Turismo`;
        
        const response = await fetch(`https://${MASTODON_URL}/api/v1/statuses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: text, visibility: 'public' }),
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ slug: post.slug, success: true, url: data.url });
        } else {
          results.push({ slug: post.slug, error: 'Failed to post' });
        }
      } catch (e) {
        results.push({ slug: post.slug, error: String(e) });
      }
    }

    return NextResponse.json({
      success: true,
      published: results,
      count: results.length,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}