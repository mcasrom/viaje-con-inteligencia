import { getOpenRouteRoutes } from './openroute'
import { getFlights } from './serpapi'
import { estimateAllModes } from './fallback'
import { paisesData } from '@/data/paises'

export interface RouteResult {
  mode: string
  durationMinutes: number
  distanceKm: number
  costEur: number
  costRange: [number, number]
  summary: string
  riskLevel: string
  riskScore: number
  source: 'openroute' | 'serpapi' | 'fallback'
  details?: Record<string, unknown>
}

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
}

function getRiskLevel(code: string): { level: string; score: number } {
  const pais = paisesData[code.toLowerCase()]
  if (!pais) return { level: 'desconocido', score: 50 }
  const level = pais.nivelRiesgo
  const riskMap: Record<string, number> = {
    'sin-riesgo': 10,
    'bajo': 25,
    'medio': 50,
    'alto': 75,
    'muy-alto': 95,
  }
  return { level: riesgoLabels[level] || level, score: riskMap[level] || 50 }
}

export async function findRoutes(
  originCode: string,
  destCode: string,
  date?: string
): Promise<RouteResult[]> {
  const results: RouteResult[] = []
  const destRisk = getRiskLevel(destCode)
  const originRisk = getRiskLevel(originCode)
  const avgRisk = Math.round((destRisk.score + originRisk.score) / 2)

  const fallbackRoutes = estimateAllModes(originCode, destCode)

  for (const fr of fallbackRoutes) {
    const riskAdjustment = Math.round((destRisk.score - 50) * 0.3)
    const adjustedCostMin = Math.round(fr.estimatedCostRange[0] * (1 + riskAdjustment / 100))
    const adjustedCostMax = Math.round(fr.estimatedCostRange[1] * (1 + riskAdjustment / 100))

    results.push({
      mode: fr.mode,
      durationMinutes: fr.durationMinutes,
      distanceKm: fr.distanceKm,
      costEur: fr.estimatedCostEur,
      costRange: [adjustedCostMin, adjustedCostMax],
      summary: fr.summary,
      riskLevel: destRisk.level,
      riskScore: avgRisk,
      source: 'fallback',
    })
  }

  const originCoords = paisesData[originCode.toLowerCase()]?.mapaCoordenadas
  const destCoords = paisesData[destCode.toLowerCase()]?.mapaCoordenadas

  if (originCoords && destCoords) {
    for (const mode of ['driving', 'walking', 'cycling'] as const) {
      const orsRoutes = await getOpenRouteRoutes(
        { lat: originCoords[0], lng: originCoords[1] },
        { lat: destCoords[0], lng: destCoords[1] },
        mode
      )
      for (const or of orsRoutes) {
        const hasExisting = results.some(
          (r) => r.mode === mode && Math.abs(r.durationMinutes - or.durationMinutes) < 10
        )
        if (hasExisting) continue

        const baseCost = or.mode === 'driving'
          ? Math.round(or.distanceKm * 0.12)
          : or.mode === 'cycling'
            ? 0
            : Math.round(or.distanceKm * 0.08)

        const riskAdjustment = Math.round((destRisk.score - 50) * 0.3)
        const adjustedCost = Math.round(baseCost * (1 + riskAdjustment / 100))

        const modeLabel: Record<string, string> = {
          driving: 'Coche',
          cycling: 'Bicicleta',
          walking: 'A pie',
        }

        results.push({
          mode: or.mode,
          durationMinutes: or.durationMinutes,
          distanceKm: or.distanceKm,
          costEur: adjustedCost,
          costRange: [Math.round(adjustedCost * 0.7), Math.round(adjustedCost * 1.5)],
          summary: `${modeLabel[or.mode] || or.mode} • ${or.distanceKm} km • ${or.durationMinutes} min`,
          riskLevel: destRisk.level,
          riskScore: avgRisk,
          source: 'openroute',
          details: {
            steps: or.steps.length > 10 ? or.steps.slice(0, 10) : or.steps,
            polyline: or.polyline,
          },
        })
      }
    }
  }

  if (date) {
    const originPais = paisesData[originCode.toLowerCase()]
    const destPais = paisesData[destCode.toLowerCase()]
    const airportMap: Record<string, string> = {
      es: 'MAD', fr: 'CDG', de: 'FRA', it: 'FCO', gb: 'LHR', pt: 'LIS',
      nl: 'AMS', be: 'BRU', ch: 'ZRH', at: 'VIE', ie: 'DUB', dk: 'CPH',
      se: 'ARN', no: 'OSL', fi: 'HEL', pl: 'WAW', cz: 'PRG', hu: 'BUD',
      gr: 'ATH', ro: 'OTP', bg: 'SOF', hr: 'ZAG', rs: 'BEG', tr: 'IST',
      us: 'JFK', ca: 'YYZ', mx: 'MEX', br: 'GRU', ar: 'EZE', cl: 'SCL',
      jp: 'NRT', cn: 'PEK', kr: 'ICN', in: 'DEL', au: 'SYD', nz: 'AKL',
      eg: 'CAI', za: 'JNB', ma: 'CMN', tn: 'TUN', ke: 'NBO', ng: 'LOS',
    }
    const originAirport = originPais?.transporte?.aeropuertos?.[0]?.iata || airportMap[originCode.toLowerCase()]
    const destAirport = destPais?.transporte?.aeropuertos?.[0]?.iata || airportMap[destCode.toLowerCase()]

    if (originAirport && destAirport) {
      const flights = await getFlights(originAirport, destAirport, date)
      if (flights.length > 0) {
        for (let i = results.length - 1; i >= 0; i--) {
          if (results[i].mode === 'flight' && results[i].source === 'fallback') {
            results.splice(i, 1)
          }
        }
      }
      for (const f of flights.slice(0, 3)) {
        results.push({
          mode: 'flight',
          durationMinutes: f.durationMinutes,
          distanceKm: 0,
          costEur: f.priceEur,
          costRange: [f.priceEur, f.priceEur],
          summary: `${f.airline} • ${f.stops === 0 ? 'Directo' : `${f.stops} escala${f.stops > 1 ? 's' : ''}`} • ${f.durationMinutes} min`,
          riskLevel: destRisk.level,
          riskScore: avgRisk,
          source: 'serpapi',
          details: {
            airline: f.airline,
            flightNumber: f.flightNumber,
            stops: f.stops,
            departure: f.departure,
            arrival: f.arrival,
          },
        })
      }
    }
  }

  const modePriority: Record<string, number> = {
    flight: 1, driving: 2, transit: 3, walking: 4, cycling: 5,
  }

  results.sort((a, b) => {
    const riskA = a.riskScore
    const riskB = b.riskScore
    if (Math.abs(riskA - riskB) > 10) return riskA - riskB
    const prioA = modePriority[a.mode] ?? 99
    const prioB = modePriority[b.mode] ?? 99
    if (prioA !== prioB) return prioA - prioB
    return a.costEur - b.costEur
  })

  return results
}

export function getRouteRecommendation(routes: RouteResult[]): string {
  if (!routes.length) return 'No hay rutas disponibles para este destino.'

  const best = routes[0]
  const riskAdvice = best.riskScore >= 75
    ? 'Destino de alto riesgo. Considera alternativas más seguras.'
    : best.riskScore >= 50
      ? 'Riesgo moderado. Toma precauciones normales.'
      : 'Destino seguro para viajar.'

  const costAdvice = best.costEur > 1000
    ? 'Coste elevado.'
    : best.costEur > 300
      ? 'Coste medio.'
      : 'Coste bajo.'

  return `${riskAdvice} ${costAdvice} Mejor opción: ${best.summary}`
}
