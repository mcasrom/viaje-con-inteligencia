import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }

  // Fallback: try to extract token from cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/sb-[a-z]+-auth-token=([^;]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(decodeURIComponent(match[1]));
      const token = decoded.access_token;
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
    } catch { /* invalid cookie */ }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const client = await getAuthenticatedClient(request);
  if (!client) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data, error } = await client
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trips: data || [] });
}

export async function POST(request: NextRequest) {
  const client = await getAuthenticatedClient(request);
  if (!client) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json();
  const { name, destination, country_code, start_date, end_date, days, budget, interests, itinerary_raw, status, notes } = body;

  if (!name || !destination) {
    return NextResponse.json({ error: 'Nombre y destino son requeridos' }, { status: 400 });
  }

  const { data, error } = await client
    .from('trips')
    .insert([{ user_id: user.id, name, destination, country_code, start_date, end_date, days: days || 7, budget: budget || 'moderate', interests: interests || [], itinerary_raw, status: status || 'draft', notes }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trip: data }, { status: 201 });
}
