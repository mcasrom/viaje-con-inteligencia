import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createLogger } from '@/lib/logger';

const log = createLogger('AuthCallback');

async function triggerOnboarding(userId: string, email: string, name?: string) {
  try {
    const baseUrl = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
    await fetch(`${baseUrl}/api/onboarding/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, name }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // fire-and-forget — non-critical
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';
  const reset = searchParams.get('reset');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        triggerOnboarding(user.id, user.email, user.user_metadata?.full_name || user.email);
      }
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?error=auth`);
}
