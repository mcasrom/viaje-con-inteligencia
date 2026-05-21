import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('external_risk')
      .select('country_code, risk_level, risk_label')
      .eq('source', 'us_state_dept');

    if (error) {
      return NextResponse.json({ countries: [] });
    }

    return NextResponse.json({ countries: data || [] });
  } catch {
    return NextResponse.json({ countries: [] });
  }
}
