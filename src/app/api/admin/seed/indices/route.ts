import { NextResponse } from 'next/server';
import { syncIPCToSupabase } from '@/lib/ipc-db';
import { syncAllIndicesToSupabase } from '@/lib/indices-db';

export async function GET() {
  try {
    const [ipcCounts, indexCounts] = await Promise.all([
      syncIPCToSupabase(),
      syncAllIndicesToSupabase(),
    ]);

    return NextResponse.json({
      ok: true,
      ipc: ipcCounts,
      indices: indexCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
