export interface OpenRouteRouteOption {
  mode: 'driving' | 'cycling' | 'walking'
  durationMinutes: number
  distanceKm: number
  summary: string
  steps: { instruction: string; distance: string; duration: string }[]
}

interface ORSResponse {
  features?: {
    properties: {
      segments: {
        duration: number
        distance: number
        steps: {
          instruction: string
          distance: number
          duration: number
        }[]
      }[]
      summary: { duration: number; distance: number }
    }
  }[]
}

const PROFILE_MAP: Record<string, string> = {
  driving: 'driving-car',
  cycling: 'cycling-regular',
  walking: 'foot-walking',
}

const KEY = () => process.env.OPENROUTESERVICE_API_KEY || ''

async function geocode(location: { lat: number; lng: number } | string): Promise<[number, number] | null> {
  const key = KEY()
  if (!key) return null

  if (typeof location !== 'string') return [location.lng, location.lat]

  try {
    const params = new URLSearchParams({ api_key: key, text: location, size: '1' })
    const res = await fetch(`https://api.openrouteservice.org/geocode/search?${params}`, {
      headers: { 'Accept': 'application/json, application/geo+json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const coords = data?.features?.[0]?.geometry?.coordinates
    return coords || null
  } catch {
    return null
  }
}

export async function getOpenRouteRoutes(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string,
  mode: 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<OpenRouteRouteOption[]> {
  const key = KEY()
  if (!key) return []

  const originCoords = await geocode(origin)
  const destCoords = await geocode(destination)
  if (!originCoords || !destCoords) return [] as any

  const profile = PROFILE_MAP[mode] || 'driving-car'

  try {
    const res = await fetch('https://api.openrouteservice.org/v2/directions/' + profile + '/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': key,
      },
      body: JSON.stringify({
        coordinates: [originCoords, destCoords],
        units: 'km',
        language: 'es',
        geometry: false,
        instructions: true,
      }),
    })

    if (!res.ok) return [] as any

    const data: ORSResponse = await res.json()
    if (!data.features?.length) return [] as any

    const route = data.features[0]
    const summary = route.properties.summary
    const segments = route.properties.segments?.[0]

    const result: OpenRouteRouteOption = {
      mode,
      durationMinutes: Math.round((summary?.duration || 0) / 60),
      distanceKm: Math.round((summary?.distance || 0) * 10) / 10,
      summary: `${mode === 'driving' ? 'Coche' : mode === 'cycling' ? 'Bici' : 'A pie'} ${Math.round(summary?.distance || 0)} km`,
      steps: segments?.steps?.map((s) => ({
        instruction: s.instruction || '',
        distance: `${Math.round(s.distance * 10) / 10} km`,
        duration: `${Math.round(s.duration / 60)} min`,
      })) || [],
    }

    return [result]
  } catch {
    return []
  }
}
