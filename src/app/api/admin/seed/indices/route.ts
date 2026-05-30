import { NextResponse } from 'next/server';
import { syncAllIndicesToSupabase } from '@/lib/indices-db';

export async function GET() {
  try {
    const indexCounts = await syncAllIndicesToSupabase();

    return NextResponse.json({
      ok: true,
      indices: indexCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
