import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { fetchAllPosts, classifySignal, detectFirstPerson, type SignalCategory } from '@/lib/osint-sensor';
import { createLogger } from '@/lib/logger';

const log = createLogger('OSINT');

const LAST_RUN_KEY = 'last_osint_run';
const PROCESSED_URLS_KEY = 'osint_processed_urls';

export const maxDuration = 60;

const OIL_SOURCES = [
  {
    name: 'Yahoo Finance',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1d',
    parse: (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
      } catch {
        return null;
      }
    },
  },
  {
    name: 'Investing.com',
    url: 'https://api.investing.com/api/financialdata/brentoilfutures/streaming',
    parse: (html: string) => {
      const match = html.match(/last_price["\s]*[:\s]*([\d.]+)/);
      return match ? parseFloat(match[1]) : null;
    },
  },
];

async function fetchAndSaveOilPrice(): Promise<{ success: boolean; price?: number; source?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false };
  }

  for (const src of OIL_SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const text = await res.text();
      const price = src.parse(text);

      if (price && price > 30 && price < 200) {
        const rounded = Math.round(price * 100) / 100;
        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabaseAdmin
          .from('oil_prices_history')
          .upsert(
            { date: today, price_usd: rounded, source: src.name },
            { onConflict: 'date' }
          );

        if (error) {
          log.error('Save error', error);
          return { success: false };
        }

        log.info(`Saved $${rounded} from ${src.name}`);
        return { success: true, price: rounded, source: src.name };
      }
    } catch (e) {
      log.warn(`Fetch failed (${src.name})`, e);
    }
  }

  return { success: false };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    log.info('Starting sensor scan...');
    const startTime = Date.now();

    // 1. Fetch posts from all sources (Reddit + GDACS + USGS + GDELT)
    const posts = await fetchAllPosts();
    log.info(`Fetched ${posts.length} posts from 4 sources`);
    
    if (!isSupabaseAdminConfigured()) {
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
    log.info(`${newPosts.length} new posts to process`);

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
        log.error('Insert error', error);
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

    // 6. Fetch and save daily oil price (integrated in same cron)
    const oilResult = await fetchAndSaveOilPrice();

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}ms`,
      postsFetched: posts.length,
      newPosts: newPosts.length,
      signalsInserted: inserted,
      urgentCount: urgentSignals?.length || 0,
      oilPrice: oilResult.success ? oilResult.price : null,
      oilSource: oilResult.source || null,
      sources: {
        reddit: posts.filter(p => p.source === 'reddit').length,
        gdacs: posts.filter(p => p.source === 'gdacs').length,
        usgs: posts.filter(p => p.source === 'usgs').length,
        gdelt: posts.filter(p => p.source === 'gdelt').length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
