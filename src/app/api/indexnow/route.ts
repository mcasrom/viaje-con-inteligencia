import { NextRequest, NextResponse } from 'next/server';
import { notifyIndexNowAll } from '@/lib/indexnow';

// Protegido con secret para que solo el GitHub Action pueda llamarlo
const DEPLOY_SECRET = process.env.DEPLOY_SECRET || '';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-deploy-secret');

  if (DEPLOY_SECRET && auth !== DEPLOY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await notifyIndexNowAll();
  return NextResponse.json({ ok: true, message: 'IndexNow notificado' });
}
