import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('PublicSignals');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20', 10), 50);

  if (!supabase) {
    return NextResponse.json({ signals: [], total: 0 });
  }

  const { data, error, count } = await supabase
    .from('osint_signals')
    .select('*', { count: 'exact' })
    .not('tone_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    log.error('Error fetching public signals', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    signals: data || [],
    total: count || 0,
    timestamp: new Date().toISOString(),
  });
}
