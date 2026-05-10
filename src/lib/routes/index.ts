import { getGoogleRoutes } from './google'
import { getFlights, type FlightOption } from './serpapi'
import { estimateAllModes, type FallbackRoute } from './fallback'
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
  source: 'google' | 'serpapi' | 'fallback'
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
    for (const mode of ['driving', 'transit'] as const) {
      const googleRoutes = await getGoogleRoutes(
        { lat: originCoords[0], lng: originCoords[1] },
        { lat: destCoords[0], lng: destCoords[1] },
        mode
      )
      for (const gr of googleRoutes) {
        const hasExisting = results.some(
          (r) => r.mode === mode && Math.abs(r.durationMinutes - gr.durationMinutes) < 10
        )
        if (hasExisting) continue

        const baseCost = gr.mode === 'driving'
          ? Math.round(gr.distanceKm * 0.12)
          : Math.round(gr.distanceKm * 0.08)

        const riskAdjustment = Math.round((destRisk.score - 50) * 0.3)
        const adjustedCost = Math.round(baseCost * (1 + riskAdjustment / 100))

        results.push({
          mode: gr.mode,
          durationMinutes: gr.durationMinutes,
          distanceKm: gr.distanceKm,
          costEur: adjustedCost,
          costRange: [Math.round(adjustedCost * 0.7), Math.round(adjustedCost * 1.5)],
          summary: `${gr.mode === 'driving' ? 'Coche' : 'Transporte público'} • ${gr.distanceKm} km • ${gr.durationMinutes} min`,
          riskLevel: destRisk.level,
          riskScore: avgRisk,
          source: 'google',
          details: { steps: gr.steps.length > 10 ? gr.steps.slice(0, 10) : gr.steps },
        })
      }
    }
  }

  if (date) {
    const originPais = paisesData[originCode.toLowerCase()]
    const destPais = paisesData[destCode.toLowerCase()]
    const originAirport = originPais?.transporte?.aeropuertos?.[0]?.iata
    const destAirport = destPais?.transporte?.aeropuertos?.[0]?.iata

    if (originAirport && destAirport) {
      const flights = await getFlights(originAirport, destAirport, date)
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

  results.sort((a, b) => {
    const riskA = a.riskScore
    const riskB = b.riskScore
    if (Math.abs(riskA - riskB) > 10) return riskA - riskB
    return a.costEur - b.costEur
  })

  return results
}

export function getRouteRecommendation(routes: RouteResult[]): string {
  if (!routes.length) return 'No hay rutas disponibles para este destino.'

  const best = routes[0]
  const riskAdvice = best.riskScore >= 75
    ? '⚠️ Destino de alto riesgo. Considera alternativas más seguras.'
    : best.riskScore >= 50
      ? 'ℹ️ Riesgo moderado. Toma precauciones normales.'
      : '✅ Destino seguro para viajar.'

  const costAdvice = best.costEur > 1000
    ? 'Coste elevado. Revisa opciones más económicas.'
    : best.costEur > 300
      ? 'Coste medio. Presupuesto estándar.'
      : 'Coste bajo. Viaje económico.'

  return `${riskAdvice} ${costAdvice} Mejor opción: ${best.summary}`
}
