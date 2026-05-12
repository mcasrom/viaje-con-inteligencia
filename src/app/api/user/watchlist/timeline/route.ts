import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

const RIESGO_NUM: Record<string, number> = {
  'sin-riesgo': 1,
  bajo: 2,
  medio: 3,
  alto: 4,
  'muy-alto': 5,
};

const NUM_TO_RIESGO = ['', 'sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];

function clamp(v: number): string {
  return NUM_TO_RIESGO[Math.max(1, Math.min(5, Math.round(v)))];
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ timeline: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('user_watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { paisesData } = await import('@/data/paises');
    const { SEASONALITY_MAP } = await import('@/data/tci-engine');

    const now = new Date();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const timeline = (data || []).map((w: any) => {
      const pais = paisesData[w.country_code.toLowerCase() as keyof typeof paisesData];
      const baseLabel: string = pais?.nivelRiesgo || 'medio';
      const baseScore = RIESGO_NUM[baseLabel] || 3;
      const season = SEASONALITY_MAP[w.country_code.toLowerCase()] || {};

      const projection = months.map(m => {
        const monthNum = parseInt(m.split('-')[1], 10);
        const seasonVal = season[String(monthNum)] || 100;
        const factor = ((seasonVal - 100) / 100) * 0.5;
        const score = Math.max(1, Math.min(5, baseScore + factor));
        return {
          month: m,
          risk_score: Math.round(score * 100) / 100,
          risk_label: clamp(score),
          seasonality: seasonVal,
        };
      });

      return {
        country_code: w.country_code,
        country_name: pais?.nombre || w.country_code.toUpperCase(),
        bandera: pais?.bandera || '',
        baseline_risk: baseScore,
        baseline_label: baseLabel,
        trip_start: w.trip_start_date,
        trip_end: w.trip_end_date,
        projection,
      };
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: 'Error al cargar timeline' }, { status: 500 });
  }
}
