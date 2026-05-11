'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Plane, Car, Bus, AlertTriangle, CheckCircle, Info, ArrowRight, Euro, Share2, MapIcon } from 'lucide-react'

const RouteMap = dynamic(() => import('./RouteMap'), { ssr: false })
import { paisesData, type DatoPais } from '@/data/paises'

interface RouteResult {
  mode: string
  durationMinutes: number
  distanceKm: number
  costEur: number
  costRange: [number, number]
  co2Kg: number
  summary: string
  riskLevel: string
  riskScore: number
  source: 'openroute' | 'serpapi' | 'fallback'
  details?: Record<string, unknown>
}

interface RoutesResponse {
  origin: string
  destination: string
  routes: RouteResult[]
  recommendation: string
  total: number
}

const modeIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-5 h-5" />,
  driving: <Car className="w-5 h-5" />,
  walking: <Bus className="w-5 h-5" />,
}

const modeColors: Record<string, string> = {
  flight: 'bg-sky-900/40 text-sky-300 border-sky-700',
  driving: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  walking: 'bg-amber-900/40 text-amber-300 border-amber-700',
}

const riskColors: Record<string, string> = {
  'Sin riesgo': 'bg-green-900/40 text-green-300',
  'Bajo': 'bg-lime-900/40 text-lime-300',
  'Medio': 'bg-yellow-900/40 text-yellow-300',
  'Alto': 'bg-orange-900/40 text-orange-300',
  'Muy alto': 'bg-red-900/40 text-red-300',
  'desconocido': 'bg-slate-700/50 text-slate-400',
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function getRiskIcon(score: number) {
  if (score >= 75) return <AlertTriangle className="w-4 h-4 text-red-500" />
  if (score >= 50) return <Info className="w-4 h-4 text-yellow-500" />
  return <CheckCircle className="w-4 h-4 text-green-500" />
}

export default function RoutePlannerClient() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoutesResponse | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function shareRoute() {
    if (!result) return
    const lines = [
      `🗺️ ${paisesData[result.origin]?.nombre || result.origin} → ${paisesData[result.destination]?.nombre || result.destination}`,
      `🏆 ${result.recommendation}`,
      '',
      ...result.routes.slice(0, 3).map(r =>
        `${r.mode === 'flight' ? '✈️' : r.mode === 'driving' ? '🚗' : '🚌'} ${r.summary} — ${r.costEur}€`
      ),
      '',
      `🔗 viajeinteligencia.com/rutas/planificar`,
    ]
    const text = lines.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const countryList = Object.entries(paisesData)
    .filter(([_, p]) => p.visible !== false)
    .sort(([, a], [, b]) => a.nombre.localeCompare(b.nombre))
    .map(([code, pais]) => ({ code, name: pais.nombre }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!origin || !destination) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const params = new URLSearchParams({ origin, destination })
      if (date) params.set('date', date)

      const res = await fetch(`/api/routes?${params}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al buscar rutas')
      }
      const data: RoutesResponse = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Planificador de Rutas
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Origen
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-2.5 border border-slate-600 rounded-lg bg-slate-700 text-white"
                required
              >
                <option value="">Selecciona un país</option>
                {countryList.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Destino
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-2.5 border border-slate-600 rounded-lg bg-slate-700 text-white"
                required
              >
                <option value="">Selecciona un país</option>
                {countryList.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Fecha de salida (opcional — para precios de vuelo)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 border border-slate-600 rounded-lg bg-slate-700 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !origin || !destination}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                Buscar rutas
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Recomendación
                </h3>
                <p className="text-slate-400">{result.recommendation}</p>
              </div>
              <button
                onClick={shareRoute}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 rounded-lg transition-colors whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                {copied ? '¡Copiado!' : 'Compartir'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300">
                Comparativa
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="p-2 text-left font-medium">Modo</th>
                    <th className="p-2 text-right font-medium">Duración</th>
                    <th className="p-2 text-right font-medium">Distancia</th>
                    <th className="p-2 text-right font-medium">Coste</th>
                    <th className="p-2 text-right font-medium">CO₂</th>
                    <th className="p-2 text-center font-medium">Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.routes.map((route, i) => {
                    const modeLabel: Record<string, string> = {
                      flight: 'Vuelo', driving: 'Coche', walking: 'A pie',
                      cycling: 'Bicicleta', transit: 'Transporte público',
                    }
                    const co2 = route.co2Kg
                    const co2Label = co2 === 0 ? '0 kg' : co2 < 1 ? '<1 kg' : `${co2} kg`
                    return (
                      <tr key={i} className={`border-b border-slate-700/50 ${i === 0 ? 'bg-blue-900/10' : ''}`}>
                        <td className="p-2 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className={`p-1 rounded ${modeColors[route.mode] || 'bg-slate-700/50 text-slate-400'}`}>
                              {modeIcons[route.mode] || <Car className="w-3.5 h-3.5" />}
                            </span>
                            <span className="font-medium text-slate-300">
                              {modeLabel[route.mode] || route.mode}
                            </span>
                            {route.source === 'serpapi' && <span className="text-purple-400 text-[10px]">✈</span>}
                            {route.source === 'openroute' && <span className="text-green-400 text-[10px]">●</span>}
                          </div>
                        </td>
                        <td className="p-2 text-right text-slate-400 whitespace-nowrap">
                          {formatDuration(route.durationMinutes)}
                        </td>
                        <td className="p-2 text-right text-slate-400">
                          {route.distanceKm > 0 ? `${route.distanceKm} km` : '—'}
                        </td>
                        <td className="p-2 text-right text-slate-400 whitespace-nowrap">
                          {route.costRange[0]}–{route.costRange[1]}€
                        </td>
                        <td className="p-2 text-right text-slate-400 whitespace-nowrap">
                          {co2Label}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${riskColors[route.riskLevel] || 'bg-slate-700/50 text-slate-400'}`}>
                            {route.riskLevel}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            {result.routes.map((route, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${modeColors[route.mode] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                      {modeIcons[route.mode] || <Car className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white capitalize">
                          {route.mode === 'flight' ? 'Vuelo' : route.mode === 'driving' ? 'Coche' : route.mode === 'cycling' ? 'Bicicleta' : 'A pie'}
                        </span>
                        {route.source === 'serpapi' && (
                          <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">Precio real</span>
                        )}
                        {route.source === 'openroute' && (
                          <span className="text-xs bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded">Ruta real</span>
                        )}
                        {route.source === 'fallback' && (
                          <span className="text-xs bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">Estimado</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {route.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-white">
                      {formatDuration(route.durationMinutes)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-sm text-slate-400">
                      <Euro className="w-3.5 h-3.5" />
                      <span>{route.costRange[0]}–{route.costRange[1]}€</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
                  {getRiskIcon(route.riskScore)}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[route.riskLevel] || 'bg-slate-700/50 text-slate-400'}`}>
                    {route.riskLevel}
                  </span>
                  {route.distanceKm > 0 && (
                    <span className="text-xs text-slate-400">
                      {route.distanceKm} km
                    </span>
                  )}
                </div>

                {(() => {
                  const steps = route.details?.steps as { instruction: string; distance: string; duration: string }[] | undefined
                  const polyline = route.details?.polyline as [number, number][] | undefined
                  if (!steps?.length && !polyline) return null
                  return (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-400 cursor-pointer hover:underline">
                        Ver detalles de la ruta
                      </summary>
                      {polyline && polyline.length > 1 && (
                        <div className="mt-2 mb-2">
                          <RouteMap polyline={polyline} mode={route.mode} />
                        </div>
                      )}
                      {steps && steps.length > 0 && (
                        <ol className="mt-2 space-y-1 text-xs text-slate-400">
                          {steps.slice(0, 5).map((step, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-slate-500 mt-0.5">•</span>
                              <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                              <span className="text-slate-500 whitespace-nowrap">({step.distance}, {step.duration})</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </details>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.total === 0 && !error && (
        <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 text-amber-300">
          No se encontraron rutas entre estos destinos.
        </div>
      )}
    </div>
  )
}
