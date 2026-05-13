import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const auth = request.nextUrl.searchParams.get('secret');
  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get('path') || '/';
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
