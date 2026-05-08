import { NextRequest, NextResponse } from 'next/server';
import { checkPremium } from '@/lib/premium-check';
import { getUserPolicies, savePolicy, deletePolicy } from '@/lib/seguros/monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const policies = await getUserPolicies(userId);
  return NextResponse.json(policies);
}

export async function POST(request: NextRequest) {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const data = await request.json();
    const policy = await savePolicy(userId, data);
    return NextResponse.json(policy, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { isPremium, userId } = await checkPremium();
  if (!isPremium || !userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const id = parseInt(request.nextUrl.searchParams.get('id') || '');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  await deletePolicy(id);
  return NextResponse.json({ success: true });
}
