export interface AirspaceStatus {
  countryCode: string;
  flightCount: number;
  lastChecked: string;
  isActive: boolean;
}

const COUNTRY_BOUNDS: Record<string, { lamin: number; lamax: number; lomin: number; lomax: number }> = {
  ru: { lamin: 41.2, lamax: 81.9, lomin: 19.6, lomax: 190.0 },
  ua: { lamin: 44.4, lamax: 52.4, lomin: 22.1, lomax: 40.2 },
  sy: { lamin: 32.3, lamax: 37.3, lomin: 35.6, lomax: 42.4 },
  ly: { lamin: 19.5, lamax: 33.2, lomin: 9.4, lomax: 25.0 },
  ye: { lamin: 12.1, lamax: 19.0, lomin: 42.5, lomax: 54.0 },
  af: { lamin: 29.4, lamax: 38.5, lomin: 60.5, lomax: 75.0 },
  iq: { lamin: 29.1, lamax: 37.4, lomin: 38.8, lomax: 48.6 },
  so: { lamin: -1.8, lamax: 11.8, lomin: 40.9, lomax: 51.4 },
  sd: { lamin: 8.7, lamax: 22.2, lomin: 21.8, lomax: 38.7 },
  ir: { lamin: 25.1, lamax: 39.8, lomin: 44.0, lomax: 63.3 },
  il: { lamin: 29.5, lamax: 33.3, lomin: 34.2, lomax: 35.9 },
  lb: { lamin: 33.0, lamax: 34.7, lomin: 35.1, lomax: 36.6 },
  ps: { lamin: 31.2, lamax: 32.6, lomin: 34.1, lomax: 35.6 },
  es: { lamin: 35.9, lamax: 43.8, lomin: -9.3, lomax: 4.3 },
  fr: { lamin: 42.3, lamax: 51.1, lomin: -4.8, lomax: 8.2 },
  de: { lamin: 47.3, lamax: 55.1, lomin: 5.9, lomax: 15.0 },
  it: { lamin: 36.6, lamax: 47.1, lomin: 6.6, lomax: 18.5 },
  gb: { lamin: 49.9, lamax: 60.9, lomin: -8.2, lomax: 1.8 },
};

const OPENSKY_BASE = 'https://opensky-network.org/api/states/all';

async function fetchFlightCount(bounds: { lamin: number; lamax: number; lomin: number; lomax: number }): Promise<number> {
  try {
    const params = new URLSearchParams({
      lamin: String(bounds.lamin),
      lamax: String(bounds.lamax),
      lomin: String(bounds.lomin),
      lomax: String(bounds.lomax),
    });

    const res = await fetch(`${OPENSKY_BASE}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return -1;

    const data = await res.json();
    return data?.states?.length ?? -1;
  } catch {
    return -1;
  }
}

export async function getAirspaceStatuses(codes?: string[]): Promise<AirspaceStatus[]> {
  const targetCodes = codes || Object.keys(COUNTRY_BOUNDS);
  const now = new Date().toISOString();
  const results: AirspaceStatus[] = [];

  for (const code of targetCodes) {
    const bounds = COUNTRY_BOUNDS[code];
    if (!bounds) continue;

    const count = await fetchFlightCount(bounds);
    if (count >= 0) {
      results.push({
        countryCode: code,
        flightCount: count,
        lastChecked: now,
        isActive: count > 0,
      });
    }
  }

  return results;
}

export async function detectAnomalousAirspace(
  baselineThreshold = 5
): Promise<{ countryCode: string; flightCount: number; status: 'active' | 'inactive' | 'unknown' }[]> {
  const statuses = await getAirspaceStatuses();
  return statuses.map((s) => ({
    countryCode: s.countryCode,
    flightCount: s.flightCount,
    status: s.flightCount > baselineThreshold ? 'active' : s.flightCount === 0 ? 'inactive' : 'unknown',
  }));
}
