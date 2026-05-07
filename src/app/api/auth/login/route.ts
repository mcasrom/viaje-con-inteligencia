import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max attempts per window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 });
    }

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        return NextResponse.json({
          error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).',
          needsVerification: true,
          email: email.toLowerCase().trim(),
        }, { status: 403 });
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
