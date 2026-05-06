import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { fetchRedditPosts, classifySignal, detectFirstPerson, type SignalCategory } from '@/lib/osint-sensor';

const LAST_RUN_KEY = 'last_osint_run';
const PROCESSED_URLS_KEY = 'osint_processed_urls';

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[OSINT] Starting sensor scan...');
    const startTime = Date.now();

    // 1. Fetch posts from Reddit
    const posts = await fetchRedditPosts(50);
    console.log(`[OSINT] Fetched ${posts.length} posts from Reddit`);
    
    // Debug: Check if we can reach Reddit at all
    let redditStatus = 'unknown';
    try {
      const testRes = await fetch('https://www.reddit.com/.json', { headers: { 'User-Agent': 'ViajeConInteligencia/1.0' }, cache: 'no-store' });
      redditStatus = `${testRes.status} ${testRes.statusText}`;
    } catch (e: any) {
      redditStatus = e.message || 'failed';
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured', postsFound: posts.length, redditStatus });
    }

    // 2. Get already processed URLs
    const { data: processedData } = await supabaseAdmin
      .from('osint_signals')
      .select('source_url')
      .not('source_url', 'is', null);

    const processedUrls = new Set(processedData?.map(d => d.source_url) || []);

    // 3. Filter new posts and classify
    const newPosts = posts.filter(p => !processedUrls.has(p.sourceUrl));
    console.log(`[OSINT] ${newPosts.length} new posts to classify`);

    const signals = [];
    for (const post of newPosts) {
      const classification = await classifySignal(post);
      const isFirstPerson = classification.isFirstResponder || detectFirstPerson(`${post.title} ${post.content}`);

      signals.push({
        source: post.source,
        source_url: post.sourceUrl,
        title: post.title.substring(0, 500),
        content: post.content.substring(0, 2000),
        author: post.author,
        subreddit: post.subreddit,
        category: classification.category as string,
        confidence: classification.confidence,
        is_first_person: isFirstPerson,
        urgency: classification.urgency,
        summary: classification.summary,
        location_name: post.locationName,
        post_timestamp: post.timestamp.toISOString(),
      });

      // Rate limit to avoid Groq exhaustion
      await new Promise(r => setTimeout(r, 200));
    }

    // 4. Insert signals into Supabase
    let inserted = 0;
    if (signals.length > 0) {
      const { error } = await supabaseAdmin
        .from('osint_signals')
        .insert(signals);

      if (error) {
        console.error('[OSINT] Insert error:', error);
      } else {
        inserted = signals.length;
      }
    }

    // 5. Get high-urgency signals for dashboard
    const { data: urgentSignals } = await supabaseAdmin
      .from('osint_signals')
      .select('*')
      .in('urgency', ['high', 'critical'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}ms`,
      postsFetched: posts.length,
      newPosts: newPosts.length,
      signalsInserted: inserted,
      urgentCount: urgentSignals?.length || 0,
      redditStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[OSINT] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
