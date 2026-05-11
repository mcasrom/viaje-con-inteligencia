import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  const codigo = country.toLowerCase();

  const { data } = await supabaseAdmin
    .from('external_risk')
    .select('risk_level, risk_label, summary, fetched_at')
    .eq('source', 'us_state_dept')
    .eq('country_code', codigo)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ risk: null });
  }

  return NextResponse.json({
    risk: {
      level: data.risk_level,
      label: data.risk_label,
      summary: data.summary,
      updatedAt: data.fetched_at,
    },
  });
}
