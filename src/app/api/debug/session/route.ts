import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie') || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  let token: string | null = null;
  let tokenSource = 'none';
  
  if (authHeader) {
    token = authHeader.replace('Bearer ', '');
    tokenSource = 'Authorization header';
  } else {
    const match = cookieHeader.match(/sb-[a-z]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(decodeURIComponent(match[1]));
        token = decoded.access_token;
        tokenSource = 'cookie';
      } catch {
        tokenSource = 'cookie parse error';
      }
    } else {
      tokenSource = 'no cookie match';
    }
  }
  
  let userId: string | null = null;
  let authStatus = 'not attempted';
  
  if (token) {
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      authStatus = `error: ${error.message}`;
    } else if (user) {
      authStatus = 'success';
      userId = user.id;
    } else {
      authStatus = 'no user';
    }
  }
  
  return NextResponse.json({
    token_found: !!token,
    token_source: tokenSource,
    auth_status: authStatus,
    user_id: userId,
    auth_header_present: !!authHeader,
    cookie_preview: cookieHeader.substring(0, 100) + (cookieHeader.length > 100 ? '...' : ''),
  });
}
