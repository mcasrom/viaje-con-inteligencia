import { NextResponse } from 'next/server';
import { checkPremium } from '@/lib/premium-check';
import { runMonitorForUser } from '@/lib/seguros/monitor';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const alerts = await runMonitorForUser(userId);
  return NextResponse.json({ alerts });
}
