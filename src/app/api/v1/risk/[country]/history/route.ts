import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyApiKey } from '@/lib/api-auth';
import { paisesData } from '@/data/paises';
import { createLogger } from '@/lib/logger';

const log = createLogger('RiskHistory');

const RISK_SCORE: Record<string, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

const RISK_LABEL: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo', 'bajo': 'Bajo', 'medio': 'Medio', 'alto': 'Alto', 'muy-alto': 'Muy alto',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const code = country.toUpperCase();

  const authResult = await verifyApiKey(request);
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error || 'API Key inválida' }, { status: authResult.status });
  }

  const pais = paisesData[code.toLowerCase()];
  if (!pais) {
    return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
  }

  const days = Math.min(parseInt(request.nextUrl.searchParams.get('days') || '30'), 90);

  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from('maec_risk_history')
      .select('nivel_riesgo, date')
      .eq('country_code', code)
      .gte('date', cutoff)
      .order('date', { ascending: true });

    if (error) {
      log.error('Error fetching risk history', error.message);
      return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
    }

    const history = (data || []).map(r => ({
      date: r.date,
      level: r.nivel_riesgo,
      label: RISK_LABEL[r.nivel_riesgo] || r.nivel_riesgo,
      score: RISK_SCORE[r.nivel_riesgo] || 3,
    }));

    const currentLevel = history.length > 0 ? history[history.length - 1].level : pais.nivelRiesgo;
    const scores = history.map(h => h.score);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : RISK_SCORE[currentLevel] || 3;

    let trend: string;
    if (scores.length >= 3) {
      const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const older = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const diff = recent - older;
      trend = diff > 0.5 ? 'empeorando' : diff < -0.5 ? 'mejorando' : 'estable';
    } else {
      trend = 'estable';
    }

    return NextResponse.json({
      country: { code, name: pais.nombre },
      currentRisk: { level: currentLevel, label: RISK_LABEL[currentLevel] || currentLevel },
      trend,
      averageScore: Math.round(avg * 10) / 10,
      history,
      period: `${days} días`,
      totalRecords: history.length,
    });
  } catch (e: any) {
    log.error('Risk history error', e.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
