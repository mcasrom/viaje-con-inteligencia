import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  let token: string | null = null;
  
  if (authHeader) {
    token = authHeader.replace('Bearer ', '');
  } else {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/sb-[a-z]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(decodeURIComponent(match[1]));
        token = decoded.access_token;
      } catch {
        // Invalid cookie
      }
    }
  }
  
  if (!token) return null;
  
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trips: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, destination, country_code, start_date, end_date, days, budget, interests, itinerary_raw, status, notes } = body;

    if (!name || !destination) {
      return NextResponse.json({ error: 'Nombre y destino son requeridos' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('trips')
      .insert([{
        user_id: user.id,
        name,
        destination,
        country_code,
        start_date,
        end_date,
        days: days || 7,
        budget: budget || 'moderate',
        interests: interests || [],
        itinerary_raw,
        status: status || 'draft',
        notes,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trip: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
