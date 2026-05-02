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
      console.log('GET favorites: No autenticado');
      return NextResponse.json({ error: 'No autenticado', favorites: [] }, { status: 401 });
    }
    console.log('GET favorites: user_id =', user.id);

    const supabase = getServiceClient();
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('GET favorites: found =', favorites?.length || 0, 'error =', error?.message || null);
    if (error) {
      console.error('Supabase GET Error:', error);
      return NextResponse.json({ error: 'Error de base de datos', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: favorites || [] });
  } catch (e) {
    console.error('Unexpected GET Error:', e);
    return NextResponse.json({ error: 'Error interno', details: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      console.log('POST favorites: No autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    console.log('POST favorites: user_id =', user.id);

    const { countryCode } = await request.json();

    if (!countryCode) {
      return NextResponse.json({ error: 'Código de país requerido' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, country_code: countryCode });

    console.log('POST favorites insert: error =', error?.message || 'success', 'code =', error?.code || null);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya está en favoritos' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode');

    if (!countryCode) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
