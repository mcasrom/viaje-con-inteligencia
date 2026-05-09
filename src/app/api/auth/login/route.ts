import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { logAuditEvent } from '@/lib/audit-log';
import { isDisposableEmail } from '@/lib/disposable-emails';
import { createLogger } from '@/lib/logger';

const log = createLogger('Auth');

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip if not configured
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${secret}&response=${token}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

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
        log.error('Reset password', error.message);
        return NextResponse.json({ error: 'Error al enviar el enlace. Intenta de nuevo.' }, { status: 400 });
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
        log.error('Login', error.message);
        return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
      }
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        return NextResponse.json({
          error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).',
          needsVerification: true,
          email: email.toLowerCase().trim(),
        }, { status: 403 });
      }
      await logAuditEvent({ action: 'login', entityType: 'user', entityId: data.user.id, email: data.user.email, ip });
      return NextResponse.json({ success: true, message: '✅ Sesión iniciada' });
    }

    // Password registration
    if (mode === 'register' && password) {
      const cleanEmail = email.toLowerCase().trim();

      // Turnstile check
      const turnToken = body.turnstileToken;
      if (!(await verifyTurnstile(turnToken))) {
        return NextResponse.json({ error: 'Verificación de seguridad fallada. Recarga e inténtalo de nuevo.' }, { status: 403 });
      }

      // Disposable email check
      if (isDisposableEmail(cleanEmail)) {
        return NextResponse.json({ error: 'No se permiten emails temporales o desechables. Usa un email real.' }, { status: 403 });
      }

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard` },
      });
      if (error) {
        log.error('Register', error.message);
        return NextResponse.json({ error: 'Error al registrar. Intenta de nuevo.' }, { status: 400 });
      }
      await logAuditEvent({ action: 'register', entityType: 'user', email: cleanEmail, ip });
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
      log.error('Magic link', error.message);
      return NextResponse.json({ error: 'Error al enviar el enlace. Intenta de nuevo.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '📧 Enlace mágico enviado a tu email',
      note: 'Revisa tu bandeja de entrada (y spam)'
    });
  } catch (err: any) {
    log.error('Request failed', err);
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 });
  }
}
