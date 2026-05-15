import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

interface CountryRisk {
  code: string;
  name: string;
  flag: string;
  region: string;
  riskLevel: string;
  riskScore: number;
  lat: number;
  lng: number;
  color: string;
}

const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': '#22c55e',
  'bajo': '#84cc16',
  'medio': '#f59e0b',
  'alto': '#ef4444',
  'muy-alto': '#991b1b',
};

function riskLevelToScore(level: string): number {
  const map: Record<string, number> = {
    'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
  };
  return map[level] || 3;
}

function buildRiskMapFromSnapshot(data: any): CountryRisk[] {
  const countries: CountryRisk[] = [];
  for (const [code, pais] of Object.entries(paisesData)) {
    const c = code.toUpperCase();
    if (c === 'CU') continue;
    const riskLevel = pais.nivelRiesgo;
    countries.push({
      code: c,
      name: pais.nombre,
      flag: pais.bandera,
      region: pais.continente,
      riskLevel,
      riskScore: riskLevelToScore(riskLevel),
      lat: pais.mapaCoordenadas[0],
      lng: pais.mapaCoordenadas[1],
      color: RISK_COLORS[riskLevel] || '#64748b',
    });
  }
  return countries;
}

async function buildRiskMapForDate(targetDate: string): Promise<CountryRisk[]> {
  const { data: history } = await supabaseAdmin
    .from('maec_risk_history')
    .select('country_code, nivel_riesgo')
    .eq('date', targetDate);

  const historyMap = new Map((history || []).map(r => [r.country_code, r.nivel_riesgo]));

  const countries: CountryRisk[] = [];
  for (const [code, pais] of Object.entries(paisesData)) {
    const c = code.toUpperCase();
    if (c === 'CU') continue;
    const riskLevel = historyMap.get(code) || pais.nivelRiesgo;
    countries.push({
      code: c,
      name: pais.nombre,
      flag: pais.bandera,
      region: pais.continente,
      riskLevel,
      riskScore: riskLevelToScore(riskLevel),
      lat: pais.mapaCoordenadas[0],
      lng: pais.mapaCoordenadas[1],
      color: RISK_COLORS[riskLevel] || '#64748b',
    });
  }
  return countries;
}

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const editionId = searchParams.get('edition');
  const compareId = searchParams.get('compare');

  if (!editionId) {
    // Return current risk map from paisesData
    return NextResponse.json({ countries: buildRiskMapFromSnapshot(null), mode: 'current' });
  }

  // Fetch the edition's data_snapshot for the week_start
  const { data: edition } = await supabaseAdmin
    .from('infografias')
    .select('week_start, data_snapshot')
    .eq('id', editionId)
    .single();

  if (!edition) {
    return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
  }

  const countries = await buildRiskMapForDate(edition.week_start);

  let compareCountries: CountryRisk[] | null = null;
  if (compareId) {
    const { data: compareEdition } = await supabaseAdmin
      .from('infografias')
      .select('week_start')
      .eq('id', compareId)
      .single();

    if (compareEdition) {
      compareCountries = await buildRiskMapForDate(compareEdition.week_start);
    }
  }

  return NextResponse.json({
    countries,
    compareCountries,
    weekStart: edition.week_start,
    mode: compareId ? 'comparison' : 'edition',
  });
}
