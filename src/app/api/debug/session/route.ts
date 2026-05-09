import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie') || '';
  let userId: string | null = null;
  let authStatus = 'not attempted';
  let tokenSource = 'none';

  if (authHeader) {
    tokenSource = 'Authorization header';
    const token = authHeader.replace('Bearer ', '');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) authStatus = `error: ${error.message}`;
    else if (user) { authStatus = 'success'; userId = user.id; }
    else authStatus = 'no user';
  } else {
    tokenSource = 'cookie (ssr)';
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { authStatus = 'success'; userId = user.id; }
      else authStatus = 'no user from ssr';
    } catch (e: any) {
      authStatus = `ssr error: ${e.message}`;
    }
  }

  return NextResponse.json({
    token_source: tokenSource,
    auth_status: authStatus,
    user_id: userId,
    auth_header_present: !!authHeader,
    cookie_preview: cookieHeader.substring(0, 100) + (cookieHeader.length > 100 ? '...' : ''),
  });
}
