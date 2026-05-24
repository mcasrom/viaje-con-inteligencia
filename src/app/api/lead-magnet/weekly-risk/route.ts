import { NextResponse } from 'next/server';
import { getWeeklyRiskChanges } from '@/lib/weekly-risk-report';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getWeeklyRiskChanges();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
