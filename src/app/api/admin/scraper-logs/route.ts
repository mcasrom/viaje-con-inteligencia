import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminPassword } from '@/lib/admin-auth';

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

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ logs: [], error: 'Supabase no configurado' });
  }

  try {
    const { data, error } = await supabase!
      .from('scraper_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ logs: [], error: error.message });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    return NextResponse.json({ logs: [], error: String(error) });
  }
}