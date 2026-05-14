import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function createClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';
  const reset = searchParams.get('reset');

  if (code) {
    const supabase = createClientFromRequest(request);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  if (token_hash && type) {
    const supabase = createClientFromRequest(request);
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      const redirectUrl = reset ? `${next}?reset=true` : next;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?error=auth`);
}
