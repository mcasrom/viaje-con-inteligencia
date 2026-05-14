import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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
