import { NextResponse } from 'next/server';
import { syncIPCToSupabase } from '@/lib/ipc-db';

export async function GET() {
  try {
    const synced = await syncIPCToSupabase();
    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
