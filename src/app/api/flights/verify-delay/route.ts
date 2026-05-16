import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('VerifyDelay');
const FLIGHTLABS_API_KEY = process.env.FLIGHTLABS_API_KEY || '';
const AERODATABOX_URL = 'https://aerodatabox.p.rapidapi.com';

export const dynamic = 'force-dynamic';

interface VerifyResult {
  success: boolean;
  found: boolean;
  delayMinutes: number | null;
  status: string;
  departure: { scheduled: string | null; actual: string | null; delay: number | null; airport: string | null };
  arrival: { scheduled: string | null; actual: string | null; delay: number | null; airport: string | null };
  airline: string | null;
  flight: string | null;
  source: string;
}

function parseFlightNumber(raw: string): string {
  const m = raw.toUpperCase().trim().match(/^([A-Z]{2,3})\s*(\d+)$/);
  if (m) return `${m[1]} ${m[2]}`;
  return raw.toUpperCase().trim();
}

function parseDelayMinutes(scheduledUtc: string | undefined, revisedUtc: string | undefined): number | null {
  if (!scheduledUtc || !revisedUtc) return null;
  const scheduled = new Date(scheduledUtc).getTime();
  const revised = new Date(revisedUtc).getTime();
  if (isNaN(scheduled) || isNaN(revised)) return null;
  return Math.round((revised - scheduled) / 60000);
}

function formatUtc(utcStr: string | undefined): string | null {
  if (!utcStr) return null;
  try {
    return new Date(utcStr).toISOString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const flight = request.nextUrl.searchParams.get('flight');
  const date = request.nextUrl.searchParams.get('date');

  if (!flight || !date) {
    return NextResponse.json({ error: 'flight and date params required (e.g. ?flight=IB3456&date=2026-05-15)' }, { status: 400 });
  }

  const result: VerifyResult = {
    success: false,
    found: false,
    delayMinutes: null,
    status: 'unknown',
    departure: { scheduled: null, actual: null, delay: null, airport: null },
    arrival: { scheduled: null, actual: null, delay: null, airport: null },
    airline: null,
    flight: null,
    source: 'AeroDataBox',
  };

  if (!FLIGHTLABS_API_KEY) {
    log.warn('FLIGHTLABS_API_KEY not configured');
    return NextResponse.json({ ...result, error: 'API key not configured' }, { status: 503 });
  }

  try {
    const flightNumber = parseFlightNumber(flight);
    const url = `${AERODATABOX_URL}/flights/Number/${encodeURIComponent(flightNumber)}/${date}?dateLocalRole=Departure`;

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': FLIGHTLABS_API_KEY,
        'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      },
    });

    if (res.status === 204) {
      return NextResponse.json({ ...result, found: false, success: true });
    }

    if (!res.ok) {
      throw new Error(`AeroDataBox error: ${res.status}`);
    }

    const data: any[] = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ ...result, found: false, success: true });
    }

    const f = data[0];
    result.success = true;
    result.found = true;
    result.flight = f.number || flight;
    result.airline = f.airline?.name || null;
    result.status = f.status || 'unknown';

    const depScheduled = f.departure?.scheduledTime?.utc;
    const depRevised = f.departure?.revisedTime?.utc;
    const depActual = f.departure?.actualTime?.utc || depRevised;
    result.departure = {
      scheduled: formatUtc(depScheduled),
      actual: formatUtc(depActual),
      delay: parseDelayMinutes(depScheduled, depActual),
      airport: f.departure?.airport?.iata || f.departure?.airport?.icao || null,
    };

    const arrScheduled = f.arrival?.scheduledTime?.utc;
    const arrRevised = f.arrival?.revisedTime?.utc;
    const arrActual = f.arrival?.actualTime?.utc || arrRevised;
    result.arrival = {
      scheduled: formatUtc(arrScheduled),
      actual: formatUtc(arrActual),
      delay: parseDelayMinutes(arrScheduled, arrActual),
      airport: f.arrival?.airport?.iata || f.arrival?.airport?.icao || null,
    };

    result.delayMinutes = result.departure.delay ?? result.arrival.delay ?? null;

    return NextResponse.json(result);
  } catch (error: any) {
    log.error('Error verifying flight delay', error);
    return NextResponse.json({ ...result, error: error.message }, { status: 500 });
  }
}
