import { NextResponse } from 'next/server';
import { syncAirportsToSupabase, syncEventsFallbackToSupabase } from '@/lib/data-sync';
import { syncIPCToSupabase } from '@/lib/ipc-db';
import { syncAllIndicesToSupabase } from '@/lib/indices-db';

export async function GET() {
  try {
    const [airports, events, ipc, indices] = await Promise.all([
      syncAirportsToSupabase(),
      syncEventsFallbackToSupabase(),
      syncIPCToSupabase(),
      syncAllIndicesToSupabase(),
    ]);

    return NextResponse.json({ ok: true, airports, events, ipc, indices });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
