import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { calcularScore, getScoreLabel } from '@/lib/trip-risk-score';
import { paisesData } from '@/data/paises';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .eq('id', id)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const countryCode = trip.country_code?.toLowerCase();
  if (!countryCode || !paisesData[countryCode]) {
    return NextResponse.json({ error: 'Trip has no valid country code' }, { status: 400 });
  }

  const month = trip.start_date
    ? new Date(trip.start_date).getMonth() + 1
    : new Date().getMonth() + 1;

  const profile = 'mochilero';
  const budget = trip.budget || 'medio';

  const result = await calcularScore(countryCode, profile, budget, month, trip.days, trip.interests);
  const pais = paisesData[countryCode];

  return NextResponse.json({
    trip_id: id,
    trip_name: trip.name,
    country: countryCode.toUpperCase(),
    country_name: pais?.nombre,
    flag: pais?.bandera,
    days: trip.days,
    month,
    budget,
    profile,
    score: result.score,
    label: getScoreLabel(result.score),
    breakdown: result.breakdown,
    labels: result.labels,
  });
}
