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
  flight: 'bg-sky-100 text-sky-700 border-sky-200',
  driving: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  walking: 'bg-amber-100 text-amber-700 border-amber-200',
}

const riskColors: Record<string, string> = {
  'Sin riesgo': 'bg-green-100 text-green-700',
  'Bajo': 'bg-lime-100 text-lime-700',
  'Medio': 'bg-yellow-100 text-yellow-700',
  'Alto': 'bg-orange-100 text-orange-700',
  'Muy alto': 'bg-red-100 text-red-700',
  'desconocido': 'bg-gray-100 text-gray-700',
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Planificador de Rutas
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Origen
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                required
              >
                <option value="">Selecciona un país</option>
                {countryList.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Destino
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fecha de salida (opcional — para precios de vuelo)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  Recomendación
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{result.recommendation}</p>
              </div>
              <button
                onClick={shareRoute}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                {copied ? '¡Copiado!' : 'Compartir'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {result.routes.map((route, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${modeColors[route.mode] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {modeIcons[route.mode] || <Car className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-white capitalize">
                          {route.mode === 'flight' ? 'Vuelo' : route.mode === 'driving' ? 'Coche' : route.mode === 'cycling' ? 'Bicicleta' : 'A pie'}
                        </span>
                        {route.source === 'serpapi' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Precio real</span>
                        )}
                        {route.source === 'openroute' && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Ruta real</span>
                        )}
                        {route.source === 'fallback' && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Estimado</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {route.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-slate-800 dark:text-white">
                      {formatDuration(route.durationMinutes)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Euro className="w-3.5 h-3.5" />
                      <span>{route.costRange[0]}–{route.costRange[1]}€</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {getRiskIcon(route.riskScore)}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[route.riskLevel] || 'bg-gray-100 text-gray-700'}`}>
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
                      <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        Ver detalles de la ruta
                      </summary>
                      {polyline && polyline.length > 1 && (
                        <div className="mt-2 mb-2">
                          <RouteMap polyline={polyline} />
                        </div>
                      )}
                      {steps && steps.length > 0 && (
                        <ol className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          {steps.slice(0, 5).map((step, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-slate-300 mt-0.5">•</span>
                              <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                              <span className="text-slate-400 whitespace-nowrap">({step.distance}, {step.duration})</span>
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
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-amber-700 dark:text-amber-300">
          No se encontraron rutas entre estos destinos.
        </div>
      )}
    </div>
  )
}
