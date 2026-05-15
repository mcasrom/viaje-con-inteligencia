import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('VerifyDelay');
const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_URL = 'http://api.aviationstack.com/v1/flights';

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
    source: 'AviationStack',
  };

  if (!AVIATIONSTACK_KEY) {
    log.warn('AVIATIONSTACK_API_KEY not configured');
    return NextResponse.json({ ...result, error: 'API key not configured' }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_KEY,
      flight_iata: flight.toUpperCase(),
      date,
      limit: '5',
    });

    const res = await fetch(`${AVIATIONSTACK_URL}?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`AviationStack error: ${res.status}`);
    }

    const data = await res.json();
    const flights = data?.data?.flights || [];

    if (flights.length === 0) {
      return NextResponse.json({ ...result, found: false, success: true });
    }

    const f = flights[0];
    result.success = true;
    result.found = true;
    result.flight = f.flight?.iataNumber || f.flight?.icaoNumber || flight;
    result.airline = f.airline?.name || null;
    result.status = f.flight_status || 'unknown';
    result.departure = {
      scheduled: f.departure?.scheduledTime || null,
      actual: f.departure?.actualTime || null,
      delay: f.departure?.delay != null ? f.departure.delay : null,
      airport: f.departure?.iataCode || f.departure?.icaoCode || null,
    };
    result.arrival = {
      scheduled: f.arrival?.scheduledTime || null,
      actual: f.arrival?.actualTime || null,
      delay: f.arrival?.delay != null ? f.arrival.delay : null,
      airport: f.arrival?.iataCode || f.arrival?.icaoCode || null,
    };
    result.delayMinutes = result.departure.delay ?? result.arrival.delay ?? null;

    return NextResponse.json(result);
  } catch (error: any) {
    log.error('Error verifying flight delay', error);
    return NextResponse.json({ ...result, error: error.message }, { status: 500 });
  }
}
