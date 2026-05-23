import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, logApiUsage } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyApiKey(request);
  if (!auth.valid || !auth.key) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country')?.toLowerCase();
  const severity = searchParams.get('severity');
  const days = parseInt(searchParams.get('days') || '7', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  await logApiUsage(auth.key.id, '/api/v1/incidents');

  let query = supabaseAdmin
    .from('incidents')
    .select(`
      id, title, description, type, severity, country_code,
      source, detected_at, tone_score
    `)
    .gte('detected_at', new Date(Date.now() - days * 86400000).toISOString())
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (country) query = query.eq('country_code', country);
  if (severity) query = query.eq('severity', severity);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ incidents: data || [] });
}
