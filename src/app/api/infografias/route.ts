import { NextResponse } from 'next/server';
import { generateInfografia, listInfografias, getLatestInfografia } from '@/lib/infografia/generate';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(parseInt(searchParams.get('perPage') || '12', 10), 50);
  const latestOnly = searchParams.get('latest') === 'true';

  if (latestOnly) {
    const latest = await getLatestInfografia();
    return NextResponse.json(latest);
  }

  const result = await listInfografias(page, perPage);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const edition = body.edition ? parseInt(body.edition, 10) : undefined;

  const result = await generateInfografia(edition);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
