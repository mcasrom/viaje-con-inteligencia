import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ favorites: [] });
  }

  try {
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const { data: favorites, error } = await supabase!
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ favorites: [] });
    }

    return NextResponse.json({ favorites: favorites || [] });
  } catch {
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { countryCode } = await request.json();

    if (!countryCode) {
      return NextResponse.json({ error: 'Código de país requerido' }, { status: 400 });
    }

    const { error } = await supabase!
      .from('favorites')
      .insert({ user_id: user.id, country_code: countryCode });

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

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode');

    if (!countryCode) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const { error } = await supabase!
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
