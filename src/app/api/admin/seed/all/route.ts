import { NextResponse } from 'next/server';
import { syncAirportsToSupabase, syncEventsFallbackToSupabase, syncTravelAttributesToSupabase, syncCountryNameMapToSupabase, syncOpenSkyBoundsToSupabase, syncDisposableEmailsToSupabase } from '@/lib/data-sync';
import { syncIPCToSupabase } from '@/lib/ipc-db';
import { syncAllIndicesToSupabase } from '@/lib/indices-db';
import { syncPaisesToSupabase } from '@/lib/paises-db';

export async function GET() {
  try {
    const [airports, events, travelAttrs, countryNames, openSkyBounds, disposableEmails, ipc, indices, paises] = await Promise.all([
      syncAirportsToSupabase(),
      syncEventsFallbackToSupabase(),
      syncTravelAttributesToSupabase(),
      syncCountryNameMapToSupabase(),
      syncOpenSkyBoundsToSupabase(),
      syncDisposableEmailsToSupabase(),
      syncIPCToSupabase(),
      syncAllIndicesToSupabase(),
      syncPaisesToSupabase(),
    ]);

    return NextResponse.json({ ok: true, airports, events, travelAttrs, countryNames, openSkyBounds, disposableEmails, ipc, indices, paises });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
