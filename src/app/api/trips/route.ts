import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trips: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json();
  const { name, destination, country_code, start_date, end_date, days, budget, interests, itinerary_raw, status, notes } = body;

  if (!name || !destination) {
    return NextResponse.json({ error: 'Nombre y destino son requeridos' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('trips')
    .insert([{ user_id: user.id, name, destination, country_code, start_date, end_date, days: days || 7, budget: budget || 'moderate', interests: interests || [], itinerary_raw, status: status || 'draft', notes }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trip: data }, { status: 201 });
}
