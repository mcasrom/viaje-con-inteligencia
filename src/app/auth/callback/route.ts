import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';
  const reset = searchParams.get('reset');

  console.log('[callback] params:', { code: !!code, token_hash: !!token_hash, type, reset });

  // Flujo PKCE con code
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('[callback] exchangeCode error:', error?.message);
    if (!error) {
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // Flujo con token_hash (magic link directo)
  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    console.log('[callback] verifyOtp error:', error?.message);
    if (!error) {
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  console.log('[callback] all params:', Object.fromEntries(searchParams));
  return NextResponse.redirect(`${origin}/dashboard?error=auth&debug=${encodeURIComponent(JSON.stringify(Object.fromEntries(searchParams)))}`);
}
