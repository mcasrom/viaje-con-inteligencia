import { NextResponse } from 'next/server';
import { getWeeklyRiskChanges } from '@/lib/weekly-risk-report';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getWeeklyRiskChanges();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
