import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Site reachable
  checks.site = 'ok';

  // 2. Supabase connection + incidents table
  try {
    const { data: inc, error: incErr } = await supabaseAdmin
      .from('incidents')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    checks.incidents = incErr ? `error: ${incErr.message}` : `ok (${inc?.length ?? 0} rows)`;
  } catch (e: any) {
    checks.incidents = `error: ${e.message}`;
  }

  // 3. Countries table
  try {
    const { data: cnt, error: cntErr } = await supabaseAdmin
      .from('countries')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    checks.countries = cntErr ? `error: ${cntErr.message}` : `ok (${cnt?.length ?? 0} rows)`;
  } catch (e: any) {
    checks.countries = `error: ${e.message}`;
  }

  // 4. API key register
  try {
    const { data: keys, error: keysErr } = await supabaseAdmin
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    checks.api_keys = keysErr ? `error: ${keysErr.message}` : `ok (${keys?.length ?? 0} rows)`;
  } catch (e: any) {
    checks.api_keys = `error: ${e.message}`;
  }

  // 5. Newsletter subscribers
  try {
    const { data: subs, error: subsErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    checks.newsletter = subsErr ? `error: ${subsErr.message}` : `ok (${subs?.length ?? 0} rows)`;
  } catch (e: any) {
    checks.newsletter = `error: ${e.message}`;
  }

  const allOk = Object.values(checks).every((v) => v.startsWith('ok'));
  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
}
