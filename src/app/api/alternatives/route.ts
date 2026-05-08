import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { findSimilarDestinations } from '@/data/clustering';
import { getPaisPorCodigo } from '@/data/paises';
import type { NivelRiesgo } from '@/data/paises';

const RISK_ORDER: Record<NivelRiesgo, number> = {
  'sin-riesgo': 0,
  'bajo': 1,
  'medio': 2,
  'alto': 3,
  'muy-alto': 4,
};

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country')?.toLowerCase();
  if (!country) {
    return NextResponse.json({ error: 'Falta parámetro country' }, { status: 400 });
  }

  const pais = getPaisPorCodigo(country);
  if (!pais) {
    return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
  }

  // 1. Detectar disrupción: eventos de alto impacto en este país
  let disruptionReasons: string[] = [];
  let hasDisruption = false;

  try {
    if (supabaseAdmin) {
      const { data: events } = await supabaseAdmin
        .from('events')
        .select('title, impact_traveler, category')
        .eq('country', country)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .lte('start_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .limit(10);

      if (events && events.length > 0) {
        const highImpact = events.filter(e => e.impact_traveler === 'high');
        if (highImpact.length > 0) {
          hasDisruption = true;
          disruptionReasons = highImpact.map(e => e.title);
        }
        const protests = events.filter(e => e.category === 'protest');
        if (protests.length > 0) {
          hasDisruption = true;
          disruptionReasons.push(...protests.map(e => e.title));
        }
      }
    }
  } catch {}

  // 2. Encontrar destinos similares pero más seguros o igual riesgo
  const similares = findSimilarDestinations(country, 10);
  const currentRiskLevel = RISK_ORDER[pais.nivelRiesgo] ?? 2;

  const alternatives = similares
    .filter(s => {
      const p = getPaisPorCodigo(s.code);
      if (!p) return false;
      const riskLevel = RISK_ORDER[p.nivelRiesgo] ?? 2;
      return riskLevel <= currentRiskLevel;
    })
    .slice(0, 5)
    .map(s => {
      const p = getPaisPorCodigo(s.code);
      return {
        code: s.code,
        name: s.nombre,
        flag: s.bandera,
        risk: p?.nivelRiesgo || 'bajo',
        score: Math.round(s.score * 100),
        reason: s.reason,
      };
    });

  return NextResponse.json({
    hasDisruption,
    disruptionReasons: [...new Set(disruptionReasons)],
    currentCountry: { code: country, name: pais.nombre, risk: pais.nivelRiesgo },
    alternatives,
    count: alternatives.length,
  });
}
