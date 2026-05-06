import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { fetchAllPosts, classifySignal, detectFirstPerson, type SignalCategory } from '@/lib/osint-sensor';

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

    // 1. Fetch posts from all sources (Reddit + GDACS + USGS + GDELT)
    const posts = await fetchAllPosts();
    console.log(`[OSINT] Fetched ${posts.length} posts from 4 sources`);
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured', postsFound: posts.length });
    }

    // 2. Get already processed URLs
    const { data: processedData } = await supabaseAdmin
      .from('osint_signals')
      .select('source_url')
      .not('source_url', 'is', null);

    const processedUrls = new Set(processedData?.map(d => d.source_url) || []);

    // 3. Filter new posts
    const newPosts = posts.filter(p => !processedUrls.has(p.sourceUrl));
    console.log(`[OSINT] ${newPosts.length} new posts to process`);

    const signals = [];
    for (const post of newPosts) {
      // GDACS/USGS are authoritative - skip AI classification
      const isAuthoritative = post.source === 'gdacs' || post.source === 'usgs';
      
      let classification;
      let isFirstPerson = false;

      if (isAuthoritative) {
        // Map official sources directly to categories/urgency
        const severity = post.severity;
        const urgency = severity === 'red' ? 'critical' : severity === 'orange' ? 'high' : severity === 'green' ? 'medium' : 'low';
        
        let category: string = 'clima';
        if (post.eventType === 'earthquake') category = 'clima';
        else if (post.source === 'gdacs') category = 'clima';
        
        classification = {
          category,
          confidence: 0.9,
          isFirstResponder: true,
          urgency,
          summary: post.title,
        };
      } else {
        // GDELT and Reddit need AI classification
        classification = await classifySignal(post);
        isFirstPerson = classification.isFirstResponder || detectFirstPerson(`${post.title} ${post.content}`);
      }

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
        lat: post.lat,
        lng: post.lng,
        severity: post.severity,
        mag: post.mag,
        event_type: post.eventType,
        post_timestamp: post.timestamp.toISOString(),
      });

      // Rate limit to avoid Groq exhaustion (skip for authoritative sources)
      if (!isAuthoritative) {
        await new Promise(r => setTimeout(r, 200));
      }
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
      sources: {
        reddit: posts.filter(p => p.source === 'reddit').length,
        gdacs: posts.filter(p => p.source === 'gdacs').length,
        usgs: posts.filter(p => p.source === 'usgs').length,
        gdelt: posts.filter(p => p.source === 'gdelt').length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[OSINT] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
