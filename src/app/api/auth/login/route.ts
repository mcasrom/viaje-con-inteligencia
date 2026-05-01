import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, mode, action } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com';

    // Password reset
    if (action === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/dashboard&reset=true`,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: '📧 Enlace de recuperación enviado a tu email',
      });
    }

    // Password login
    if (mode === 'password' && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: '✅ Sesión iniciada' });
    }

    // Password registration
    if (mode === 'register' && password) {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard` },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: '📧 Cuenta creada. Revisa tu email para verificar.',
      });
    }

    // Magic link (default)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '📧 Enlace mágico enviado a tu email',
      note: 'Revisa tu bandeja de entrada (y spam)'
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 });
  }
}
