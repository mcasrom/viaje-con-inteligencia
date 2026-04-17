import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const { data, error } = await supabase!.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      user: data.user 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}