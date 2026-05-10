export interface GoogleRouteOption {
  mode: 'driving' | 'transit' | 'walking' | 'bicycling'
  durationMinutes: number
  distanceKm: number
  summary: string
  steps: { instruction: string; distance: string; duration: string }[]
  polyline?: string
}

interface GoogleRoutesResponse {
  routes: {
    duration: string
    distanceMeters: number
    polyline?: { encodedPolyline: string }
    description?: string
    legs: {
      steps: {
        navigationInstruction?: { instructions: string }
        distanceMeters: number
        duration: string
        travelMode: string
      }[]
    }[]
  }[]
}

const API_KEY = () => process.env.GOOGLE_MAPS_API_KEY || ''

export async function getGoogleRoutes(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string,
  mode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving'
): Promise<GoogleRouteOption[]> {
  const key = API_KEY()
  if (!key) return []

  const originObj = typeof origin === 'string'
    ? { address: origin }
    : { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } }
  const destObj = typeof destination === 'string'
    ? { address: destination }
    : { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } }

  try {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.duration,routes.legs.steps.travelMode',
      },
      body: JSON.stringify({
        origin: originObj,
        destination: destObj,
        travelMode: mode.toUpperCase(),
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: true,
        languageCode: 'es',
        units: 'METRIC',
      }),
    })

    if (!res.ok) return []

    const data: GoogleRoutesResponse = await res.json()
    if (!data.routes?.length) return []

    return data.routes.map((route) => ({
      mode,
      durationMinutes: Math.round(parseInt(route.duration) / 60),
      distanceKm: Math.round(route.distanceMeters / 10) / 100,
      summary: route.description || `${mode} ${Math.round(route.distanceMeters / 10) / 100}km`,
      steps: route.legs[0]?.steps?.map((s) => ({
        instruction: s.navigationInstruction?.instructions || '',
        distance: `${Math.round(s.distanceMeters / 10) / 100} km`,
        duration: `${Math.round(parseInt(s.duration) / 60)} min`,
      })) || [],
      polyline: route.polyline?.encodedPolyline,
    }))
  } catch {
    return []
  }
}
