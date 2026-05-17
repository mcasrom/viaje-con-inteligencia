import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
const log = createLogger('PulsoKeywords');

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('pulso_keywords')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('keyword_es');

  if (error) {
    log.error('Error fetching keywords', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keywords: data || [] });
}
