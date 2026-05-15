import { supabaseAdmin } from '@/lib/supabase-admin';

const CACHE_TTL_HOURS = 24;

async function getCached(key: string): Promise<SerpAPIResponse | null> {
  try {
    const { data } = await supabaseAdmin
      .from('serpapi_cache')
      .select('data, updated_at')
      .eq('route_key', key)
      .maybeSingle();
    if (!data) return null;
    const age = (Date.now() - new Date(data.updated_at).getTime()) / 1000 / 3600;
    if (age > CACHE_TTL_HOURS) return null;
    return data.data as SerpAPIResponse;
  } catch { return null; }
}

async function setCache(key: string, data: SerpAPIResponse) {
  try {
    await supabaseAdmin
      .from('serpapi_cache')
      .upsert({ route_key: key, data, updated_at: new Date().toISOString() });
  } catch { /* cache write failure is non-critical */ }
}

export interface FlightOption {
  airline: string
  flightNumber?: string
  departure: string
  arrival: string
  durationMinutes: number
  priceEur: number
  stops: number
  stopoverAirports?: string[]
}

interface SerpAPIResponse {
  best_flights?: {
    flights: { airline: string; flight_number: string; departure_airport: { name: string; id: string }; arrival_airport: { name: string; id: string }; duration: number; departure: string }[]
    price: number
    total_duration: number
    stops: number
  }[]
  other_flights?: {
    flights: { airline: string; flight_number: string; departure_airport: { name: string; id: string }; arrival_airport: { name: string; id: string }; duration: number; departure: string }[]
    price: number
    total_duration: number
    stops: number
  }[]
  error?: string
}

export async function getFlights(
  originIata: string,
  destIata: string,
  date: string
): Promise<FlightOption[]> {
  const key = process.env.SERPAPI_API_KEY
  if (!key) return []

  const routeKey = `${originIata}:${destIata}:${date}`.toUpperCase()

  const cached = await getCached(routeKey)
  if (cached) {
    const all = [...(cached.best_flights || []), ...(cached.other_flights || [])]
    return all.slice(0, 10).map((f) => {
      const stops = typeof f.stops === 'number' ? f.stops : f.flights.length - 1
      return {
        airline: f.flights[0]?.airline || 'Unknown',
        flightNumber: f.flights[0]?.flight_number,
        departure: f.flights[0]?.departure || '',
        arrival: f.flights[f.flights.length - 1]?.arrival_airport?.id || '',
        durationMinutes: f.total_duration,
        priceEur: f.price,
        stops,
        stopoverAirports: f.flights.slice(1, -1).map((seg) => seg.arrival_airport?.id).filter(Boolean),
      }
    })
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_flights',
      api_key: key,
      departure_id: originIata,
      arrival_id: destIata,
      outbound_date: date,
      currency: 'EUR',
      hl: 'es',
      type: '2',
    })

    const res = await fetch(`https://serpapi.com/search?${params}`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return []

    const data: SerpAPIResponse = await res.json()
    if (data.error) return []

    setCache(routeKey, data)

    const all = [...(data.best_flights || []), ...(data.other_flights || [])]
    return all.slice(0, 10).map((f) => {
      const stops = typeof f.stops === 'number' ? f.stops : f.flights.length - 1
      return {
        airline: f.flights[0]?.airline || 'Unknown',
        flightNumber: f.flights[0]?.flight_number,
        departure: f.flights[0]?.departure || '',
        arrival: f.flights[f.flights.length - 1]?.arrival_airport?.id || '',
        durationMinutes: f.total_duration,
        priceEur: f.price,
        stops,
        stopoverAirports: f.flights.slice(1, -1).map((seg) => seg.arrival_airport?.id).filter(Boolean),
      }
    })
  } catch {
    return []
  }
}
