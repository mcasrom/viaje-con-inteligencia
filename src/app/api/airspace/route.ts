import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const [closures, routes] = await Promise.all([
    supabase.from('airspace_closures').select('*').order('country_code'),
    supabase.from('affected_routes').select('*').order('destination_country'),
  ]);

  return NextResponse.json({
    closures: closures.data || [],
    routes: routes.data || [],
    source: 'supabase',
  });
}
