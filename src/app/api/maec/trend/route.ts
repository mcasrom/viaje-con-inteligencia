import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const RISK_SCORE: Record<string, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code param required' }, { status: 400 });

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from('maec_risk_history')
      .select('nivel_riesgo, date')
      .eq('country_code', code.toUpperCase())
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true });

    if (error || !data || data.length < 3) {
      return NextResponse.json({ trend: 'estable', label: 'Sin datos suficientes' });
    }

    const recent = data.slice(-3);
    const scores = recent.map(r => RISK_SCORE[r.nivel_riesgo] || 3);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    const oldest = data.slice(0, 3);
    const oldScores = oldest.map(r => RISK_SCORE[r.nivel_riesgo] || 3);
    const oldAvg = oldScores.reduce((a, b) => a + b, 0) / oldScores.length;

    const diff = avg - oldAvg;

    if (diff > 0.5) return NextResponse.json({ trend: 'subiendo', label: 'El riesgo está aumentando' });
    if (diff < -0.5) return NextResponse.json({ trend: 'bajando', label: 'El riesgo está disminuyendo' });
    return NextResponse.json({ trend: 'estable', label: 'Riesgo estable' });
  } catch {
    return NextResponse.json({ trend: 'estable', label: 'Riesgo estable' });
  }
}
