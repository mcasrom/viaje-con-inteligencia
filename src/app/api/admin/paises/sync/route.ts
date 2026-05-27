import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/admin-auth';
import { syncPaisesToSupabase } from '@/lib/paises-db';
import { createLogger } from '@/lib/logger';

const log = createLogger('AdminPaisesSync');

function requireAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cookie = request.headers.get('cookie') || '';
  const tokenFromCookie = cookie.split('admin_session=')[1]?.split(';')[0] || '';
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || tokenFromCookie || queryToken || '';
  return verifyAdminPassword(provided);
}

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncPaisesToSupabase();
    log.info(`Sync manual: ${result.inserted} insertados, ${result.errors} errores`);
    return NextResponse.json(result);
  } catch (e: any) {
    log.error('Sync error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
