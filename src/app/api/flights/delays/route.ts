import { NextRequest, NextResponse } from 'next/server';

const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_URL = 'http://api.aviationstack.com/v1/flights';

export const dynamic = 'force-dynamic';

interface FlightAlert {
  flight: string;
  airline: string;
  departure: string;
  arrival: string;
  status: string;
  delay: number;
  time: string;
}

async function fetchFlightDelays(): Promise<FlightAlert[]> {
  if (!AVIATIONSTACK_KEY) {
    console.warn('AVIASTACK_API_KEY not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_KEY,
      limit: '20',
      flight_status: 'active',
    });

    const res = await fetch(`${AVIATIONSTACK_URL}?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`AviationStack error: ${res.status}`);
    }

    const data = await res.json();
    const flights = data?.data?.flights || [];

    return flights
      .filter((f: any) => f.departure?.delay > 15 || f.arrival?.delay > 15)
      .slice(0, 10)
      .map((f: any) => ({
        flight: f.flight?.iataNumber || f.flight?.icaoNumber || 'N/A',
        airline: f.airline?.name || f.airline?.iataCode || 'Unknown',
        departure: f.departure?.iataCode || f.departure?.icaoCode || 'N/A',
        arrival: f.arrival?.iataCode || f.arrival?.icaoCode || 'N/A',
        status: f.flight_status || f.status || 'unknown',
        delay: f.departure?.delay || f.arrival?.delay || 0,
        time: f.departure?.scheduledTime || f.arrival?.scheduledTime || new Date().toISOString(),
      }));
  } catch (error) {
    console.error('Flight delays error:', error);
    return [];
  }
}

function getMockAlerts(): FlightAlert[] {
  return [
    { flight: 'IB331', airline: 'Iberia', departure: 'MAD', arrival: 'JFK', status: 'delayed', delay: 45, time: new Date().toISOString() },
    { flight: 'AA100', airline: 'American', departure: 'LAX', arrival: 'ORD', status: 'delayed', delay: 30, time: new Date().toISOString() },
    { flight: 'BA249', airline: 'British Airways', departure: 'LHR', arrival: 'DXB', status: 'delayed', delay: 60, time: new Date().toISOString() },
    { flight: 'LH400', airline: 'Lufthansa', departure: 'FRA', arrival: 'JFK', status: 'on-time', delay: 0, time: new Date().toISOString() },
  ];
}

export async function GET(request: NextRequest) {
  const delay = request.nextUrl.searchParams.get('delay');

  let flights = await fetchFlightDelays();

  if (flights.length === 0) {
    flights = getMockAlerts();
  }

  if (delay) {
    const minDelay = parseInt(delay);
    flights = flights.filter(f => f.delay >= minDelay);
  }

  return NextResponse.json({
    success: true,
    source: AVIATIONSTACK_KEY ? 'AviationStack' : 'Mock',
    timestamp: new Date().toISOString(),
    flights: flights.slice(0, 10),
  });
}