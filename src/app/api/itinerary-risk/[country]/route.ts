import { NextRequest, NextResponse } from 'next/server';
import { getPaisData } from '@/lib/paises-db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const code = country.toLowerCase();
  const pais = await getPaisData(code);

  if (!pais) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  let usRisk = null;
  if (isSupabaseAdminConfigured()) {
    const { data } = await supabaseAdmin
      .from('us_state_dept')
      .select('level, label')
      .eq('country_code', code)
      .single();
    usRisk = data;
  }

  let incidents: any[] = [];
  if (isSupabaseAdminConfigured()) {
    const { data } = await supabaseAdmin
      .from('incidents')
      .select('title, severity, type, detected_at')
      .eq('country_code', code)
      .gte('detected_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('detected_at', { ascending: false })
      .limit(5);
    incidents = data || [];
  }

  return NextResponse.json({
    nombre: pais.nombre,
    nivelRiesgo: pais.nivelRiesgo,
    riesgoSanitario: (pais as any).riesgoSanitario || 'medio',
    queNoHacer: pais.queNoHacer?.slice(0, 4) || [],
    usRisk,
    incidents,
  });
}
