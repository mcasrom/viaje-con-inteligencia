import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session')?.value;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || cookie || queryToken || '';
  return verifyAdminPassword(provided);
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username, is_premium, subscription_status, trial_end, telegram_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users, total: users?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
