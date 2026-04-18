import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      error: 'Supabase no configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.',
      setup_needed: true,
      instructions: '1. Ve a Supabase Dashboard > Settings > API\n2. Copia la URL y anon key\n3. Añádelas como variables de entorno en Vercel'
    }, { status: 500 });
  }

  try {
    const { email, mode } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || 'https://viaje-con-inteligencia.vercel.app';
    
    const { error } = await supabase!.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${siteUrl}/dashboard`,
      },
    });

    if (error) {
      // Better error messages
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'Demasiados intentos. Por favor, espera unos minutos y prueba de nuevo.' 
        }, { status: 429 });
      }
      if (error.message.includes('Invalid email')) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: '📧 Enlace mágico enviado a tu email',
      note: 'Revisa tu bandeja de entrada (y spam)'
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 });
  }
}
