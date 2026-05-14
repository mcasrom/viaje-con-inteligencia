import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';

export interface AirportInfo {
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
}

export async function getMainAirport(countryCode: string): Promise<AirportInfo | undefined> {
  const normalized = countryCode.toLowerCase();
  if (isSupabaseAdminConfigured()) {
    try {
      const { data } = await supabaseAdmin!
        .from('airports')
        .select('*')
        .eq('country_code', normalized)
        .maybeSingle();
      if (data) return { iata: data.iata, name: data.name, city: data.city, lat: data.lat, lon: data.lon };
    } catch { /* fallback */ }
  }
  const { MAIN_AIRPORTS } = await import('@/data/airports');
  const airports = MAIN_AIRPORTS[normalized];
  if (!airports || airports.length === 0) return undefined;
  return airports[0];
}

export async function getAirportCoordinates(countryCode: string): Promise<[number, number] | undefined> {
  const airport = await getMainAirport(countryCode);
  if (!airport) return undefined;
  return [airport.lat, airport.lon];
}
