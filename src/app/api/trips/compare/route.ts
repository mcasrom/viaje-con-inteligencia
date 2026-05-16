import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { calcularScore, getScoreLabel } from '@/lib/trip-risk-score';
import { paisesData } from '@/data/paises';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length < 2) {
    return NextResponse.json({ error: 'Se necesitan al menos 2 IDs de viaje' }, { status: 400 });
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .in('id', ids);

  if (error || !trips?.length) {
    return NextResponse.json({ error: 'Viajes no encontrados' }, { status: 404 });
  }

  const results = trips.map(trip => {
    const countryCode = trip.country_code?.toLowerCase();
    if (!countryCode || !paisesData[countryCode]) return null;

    const month = trip.start_date
      ? new Date(trip.start_date).getMonth() + 1
      : new Date().getMonth() + 1;

    const profile = 'mochilero';
    const budget = trip.budget || 'medio';
    const result = calcularScore(countryCode, profile, budget, month);
    const pais = paisesData[countryCode];

    return {
      trip_id: trip.id,
      trip_name: trip.name,
      destination: trip.destination,
      country_code: countryCode.toUpperCase(),
      country_name: pais?.nombre,
      flag: pais?.bandera,
      days: trip.days,
      month,
      score: result.score,
      label: getScoreLabel(result.score),
      breakdown: result.breakdown,
      labels: result.labels,
    };
  }).filter(Boolean);

  return NextResponse.json({ results });
}
