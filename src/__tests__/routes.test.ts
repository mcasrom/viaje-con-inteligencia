import { describe, it, expect } from '@jest/globals'
import { estimateAllModes } from '@/lib/routes/fallback'
import { getRouteRecommendation } from '@/lib/routes'

describe('haversine engine', () => {
  it('returns 3 modes for ES to FR', () => {
    const routes = estimateAllModes('es', 'fr')
    expect(routes).toHaveLength(3)
    const modes = routes.map(r => r.mode)
    expect(modes).toContain('driving')
    expect(modes).toContain('transit')
    expect(modes).toContain('flight')
  })

  it('all modes have positive duration and cost', () => {
    const routes = estimateAllModes('es', 'fr')
    for (const r of routes) {
      expect(r.durationMinutes).toBeGreaterThan(0)
      expect(r.distanceKm).toBeGreaterThan(0)
      expect(r.estimatedCostEur).toBeGreaterThan(0)
      expect(r.estimatedCostRange[0]).toBeLessThanOrEqual(r.estimatedCostRange[1])
    }
  })

  it('flight is faster than driving and transit', () => {
    const routes = estimateAllModes('es', 'fr')
    const flight = routes.find(r => r.mode === 'flight')!
    expect(flight.durationMinutes).toBeLessThan(routes.find(r => r.mode === 'driving')!.durationMinutes)
    expect(flight.durationMinutes).toBeLessThan(routes.find(r => r.mode === 'transit')!.durationMinutes)
  })

  it('handles unknown country code gracefully', () => {
    const routes = estimateAllModes('xx', 'yy')
    for (const r of routes) {
      expect(r.distanceKm).toBeGreaterThanOrEqual(0)
      expect(r.estimatedCostEur).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns empty for same country', () => {
    const routes = estimateAllModes('es', 'es')
    expect(routes).toHaveLength(0)
  })
})

describe('getRouteRecommendation', () => {
  const makeRoute = (overrides: any = {}) => ({
    mode: 'driving',
    durationMinutes: 600,
    distanceKm: 1000,
    costEur: 100,
    costRange: [70, 150] as [number, number],
    co2Kg: 120,
    summary: 'Coche • 1000 km • 600 min',
    riskLevel: 'Sin riesgo',
    riskScore: 10,
    source: 'fallback' as const,
    ...overrides,
  })

  it('returns empty message for no routes', () => {
    expect(getRouteRecommendation([])).toBe('No hay rutas disponibles para este destino.')
  })

  it('safe + low cost + low co2 recommendation', () => {
    const rec = getRouteRecommendation([makeRoute()])
    expect(rec).toContain('seguro')
    expect(rec).toContain('Coste bajo')
    expect(rec).toContain('Huella de carbono')
  })

  it('high risk warning', () => {
    const rec = getRouteRecommendation([makeRoute({ riskScore: 95 })])
    expect(rec).toContain('alto riesgo')
  })

  it('moderate risk', () => {
    const rec = getRouteRecommendation([makeRoute({ riskScore: 60, costEur: 500 })])
    expect(rec).toContain('Riesgo moderado')
    expect(rec).toContain('Coste medio')
  })

  it('elevated cost warning', () => {
    const rec = getRouteRecommendation([makeRoute({ costEur: 1500 })])
    expect(rec).toContain('Coste elevado')
  })

  it('prefers first route as best', () => {
    const routes = [
      makeRoute({ mode: 'flight', costEur: 300, summary: 'Vuelo', source: 'fallback' as const }),
      makeRoute({ mode: 'driving', costEur: 100, summary: 'Coche', source: 'fallback' as const }),
    ]
    const rec = getRouteRecommendation(routes)
    expect(rec).toContain('Vuelo')
  })
})
