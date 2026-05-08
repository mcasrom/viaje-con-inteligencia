import { NextRequest, NextResponse } from 'next/server';
import { checkPremium } from '@/lib/premium-check';
import { getUserAlerts, markAlertRead } from '@/lib/seguros/monitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';
  const alerts = await getUserAlerts(userId, unreadOnly);
  return NextResponse.json(alerts);
}

export async function PATCH(request: NextRequest) {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const id = parseInt(request.nextUrl.searchParams.get('id') || '');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  await markAlertRead(id);
  return NextResponse.json({ success: true });
}
