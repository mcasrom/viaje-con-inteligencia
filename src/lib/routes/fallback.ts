import { paisesData } from '@/data/paises'

export interface FallbackRoute {
  mode: 'driving' | 'transit' | 'flight'
  durationMinutes: number
  distanceKm: number
  estimatedCostEur: number
  estimatedCostRange: [number, number]
  summary: string
}

const EARTH_RADIUS_KM = 6371

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getCountryCoords(code: string): [number, number] | null {
  const pais = paisesData[code.toLowerCase()]
  if (pais?.mapaCoordenadas && pais.mapaCoordenadas[0] !== 0) return pais.mapaCoordenadas
  return null
}

const MODE_SPEEDS: Record<string, number> = {
  driving: 80,
  transit: 60,
  flight: 800,
}

const MODE_COST_PER_KM: Record<string, number> = {
  driving: 0.12,
  transit: 0.08,
  flight: 0.15,
}

export function estimateFallbackRoute(
  originCode: string,
  destCode: string,
  mode: 'driving' | 'transit' | 'flight' = 'flight'
): FallbackRoute | null {
  const originCoords = getCountryCoords(originCode)
  const destCoords = getCountryCoords(destCode)
  if (!originCoords || !destCoords) return null

  const distanceKm = haversineKm(originCoords[0], originCoords[1], destCoords[0], destCoords[1])
  const directDistance = distanceKm

  const roadFactor = mode === 'flight' ? 1 : 1.3
  const actualDistance = directDistance * roadFactor

  const speed = MODE_SPEEDS[mode] || 80
  const durationMinutes = Math.round((actualDistance / speed) * 60)

  const costPerKm = MODE_COST_PER_KM[mode] || 0.12
  const baseCost = Math.round(actualDistance * costPerKm)

  const costLow = Math.round(baseCost * 0.7)
  const costHigh = Math.round(baseCost * 1.5)

  const modeLabels: Record<string, string> = {
    driving: 'Coche',
    transit: 'Transporte público',
    flight: 'Vuelo',
  }

  return {
    mode,
    durationMinutes,
    distanceKm: Math.round(actualDistance),
    estimatedCostEur: baseCost,
    estimatedCostRange: [costLow, costHigh] as [number, number],
    summary: `${modeLabels[mode]} • ${Math.round(actualDistance)} km • ${Math.round(actualDistance / speed * 60)} min • ~${baseCost}€`,
  }
}

export function estimateAllModes(originCode: string, destCode: string): FallbackRoute[] {
  const modes: ('driving' | 'transit' | 'flight')[] = ['flight', 'driving', 'transit']
  const routes: FallbackRoute[] = []

  for (const mode of modes) {
    const route = estimateFallbackRoute(originCode, destCode, mode)
    if (route && route.durationMinutes > 0) routes.push(route)
  }

  return routes.sort((a, b) => a.durationMinutes - b.durationMinutes)
}
