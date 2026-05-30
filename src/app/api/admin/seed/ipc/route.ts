import { NextResponse } from 'next/server';
import { syncAllIndicesToSupabase } from '@/lib/indices-db';

export async function GET() {
  try {
    const synced = await syncAllIndicesToSupabase();
    return NextResponse.json({ ok: true, synced, note: 'IPC is now part of indices table (tipo: ipc)' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
