import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  console.log('=== LOGIN API ===');
  if (!isSupabaseConfigured()) {
    console.log('Supabase no configurado');
    return NextResponse.json({ 
      error: 'Supabase no configurado. Añade las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY' 
    }, { status: 500 });
  }

  try {
    const { email, mode } = await request.json();
    console.log('Email:', email, 'Mode:', mode);

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://viaje-con-inteligencia.vercel.app'}/dashboard`,
      },
    });

    console.log('Error de Supabase:', error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Enlace de acceso enviado a tu email' 
    });
  } catch (err: any) {
    console.error('Excepción:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
