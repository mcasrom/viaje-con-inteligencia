import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

const ALLOWED_COUNTRIES = 20;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ watchlist: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('user_watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { paisesData } = await import('@/data/paises');

    const watchlist = (data || []).map((w: any) => {
      const pais = paisesData[w.country_code.toLowerCase() as keyof typeof paisesData];
      return {
        id: w.id,
        country_code: w.country_code,
        country_name: pais?.nombre || w.country_code.toUpperCase(),
        bandera: pais?.bandera || '',
        region: pais?.continente || '',
        nivel_riesgo: pais?.nivelRiesgo || 'desconocido',
        trip_start_date: w.trip_start_date,
        trip_end_date: w.trip_end_date,
        notes: w.notes,
        created_at: w.created_at,
      };
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json({ error: 'Error al cargar watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    const body = await request.json();
    const country_code = body?.country_code;
    if (!country_code || typeof country_code !== 'string') {
      return NextResponse.json({ error: 'country_code requerido' }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from('user_watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= ALLOWED_COUNTRIES) {
      return NextResponse.json({ error: `Máximo ${ALLOWED_COUNTRIES} países en tu radar` }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('user_watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('country_code', country_code.toLowerCase())
      .maybeSingle();

    const payload = {
      user_id: user.id,
      country_code: country_code.toLowerCase(),
      trip_start_date: body.trip_start_date || null,
      trip_end_date: body.trip_end_date || null,
      notes: body.notes || null,
    };

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('user_watchlist')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('user_watchlist')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, entry: result.data });
  } catch (error: any) {
    console.error('Watchlist POST error:', error?.message || error);
    return NextResponse.json({ error: `Error al guardar: ${error?.message || 'desconocido'}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const country_code = searchParams.get('country');
    const entryId = searchParams.get('id');

    let query = supabaseAdmin.from('user_watchlist').delete().eq('user_id', user.id);
    if (entryId) {
      query = query.eq('id', parseInt(entryId));
    } else if (country_code) {
      query = query.eq('country_code', country_code.toLowerCase());
    } else {
      return NextResponse.json({ error: 'Se requiere country o id' }, { status: 400 });
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Watchlist DELETE error:', error?.message || error);
    return NextResponse.json({ error: `Error al eliminar: ${error?.message || 'desconocido'}` }, { status: 500 });
  }
}
