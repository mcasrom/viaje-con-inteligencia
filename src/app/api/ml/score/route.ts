import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { calcularScore, getScoreLabel } from '@/lib/trip-risk-score';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getMesNombre(m: number): string {
  return MESES[m - 1] || String(m);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.toLowerCase();
  const profile = searchParams.get('profile') || 'mochilero';
  const budget = searchParams.get('budget') || 'medio';
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

  const validProfiles = ['mochilero', 'lujo', 'familiar', 'aventura', 'negocios'];
  const validBudgets = ['bajo', 'medio', 'alto', 'lujo'];

  if (!country || !paisesData[country]) {
    return NextResponse.json({ error: 'Invalid or missing country code' }, { status: 400 });
  }
  if (!validProfiles.includes(profile)) {
    return NextResponse.json({ error: `Invalid profile. Valid: ${validProfiles.join(', ')}` }, { status: 400 });
  }
  if (!validBudgets.includes(budget)) {
    return NextResponse.json({ error: `Invalid budget. Valid: ${validBudgets.join(', ')}` }, { status: 400 });
  }
  if (month < 1 || month > 12) {
    return NextResponse.json({ error: 'Month must be 1-12' }, { status: 400 });
  }

  const result = calcularScore(country, profile, budget, month);
  const pais = paisesData[country];

  return NextResponse.json({
    country: country.toUpperCase(),
    name: pais?.nombre,
    flag: pais?.bandera,
    profile,
    budget,
    month: getMesNombre(month),
    score: result.score,
    label: getScoreLabel(result.score),
    breakdown: result.breakdown,
    labels: result.labels,
  });
}
