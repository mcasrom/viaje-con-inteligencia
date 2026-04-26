import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com';

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
