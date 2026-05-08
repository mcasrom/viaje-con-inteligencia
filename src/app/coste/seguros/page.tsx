'use client';

import { useState } from 'react';
import { Search, Shield, AlertTriangle, Users, Euro, Activity, ChevronRight, ExternalLink, Loader2, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { SeguroScore } from '@/lib/seguros/scoring';

interface CompareResult {
  resultados: SeguroScore[];
  alerta_osint: string | null;
  irv: number;
  cobertura_recomendada: { medica: number; evacuacion: number };
}

const ACTIVIDADES = [
  'senderismo', 'trekking', 'buceo', 'snorkel', 'esquí',
  'surf', 'kitesurf', 'moto', 'ciclismo', 'puenting',
  'paracaidismo', 'rafting', 'escalada', 'safari', 'voluntariado',
];

export default function SegurosPage() {
  const [destino, setDestino] = useState('');
  const [edades, setEdades] = useState('30');
  const [costeViaje, setCosteViaje] = useState('1500');
  const [actividades, setActividades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleActividad = (a: string) => {
    setActividades(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destino.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/seguros/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destino: destino.toUpperCase(),
          edades: edades.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
          actividades,
          costeViaje: parseInt(costeViaje) || 1500,
          tipoViaje: edades.split(',').length > 2 ? 'familiar' : 'individual',
          residencia: 'ES',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selected = selectedId
    ? result?.resultados.find(p => p.id === selectedId)
    : null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Comparador de Seguros de Viaje</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Comparamos seguros según el riesgo real de tu destino, tu perfil y las actividades que planeas.
            Basado en datos OSINT (IRV, sanidad local, alertas activas).
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                Datos de tu viaje
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Destino</label>
                  <input
                    type="text"
                    value={destino}
                    onChange={e => setDestino(e.target.value)}
                    placeholder="Código ISO del país (ES, FR, TH...)"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Edades de los viajeros
                  </label>
                  <input
                    type="text"
                    value={edades}
                    onChange={e => setEdades(e.target.value)}
                    placeholder="30 o 30,28,5"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5 flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5" />
                    Coste total del viaje (€)
                  </label>
                  <input
                    type="number"
                    value={costeViaje}
                    onChange={e => setCosteViaje(e.target.value)}
                    placeholder="1500"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Actividades planeadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVIDADES.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleActividad(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        actividades.includes(a)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !destino.trim()}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Comparar seguros <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Resultados</h2>
              <button
                onClick={() => { setResult(null); setSelectedId(null); }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Nueva búsqueda
              </button>
            </div>

            {result.alerta_osint && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium text-sm">Alerta OSINT para tu destino</p>
                  <p className="text-yellow-400/80 text-sm mt-1">{result.alerta_osint}</p>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-slate-400">
                  IRV destino: <strong className="text-white">{result.irv}/100</strong>
                </span>
                <span className="text-slate-400">
                  Cobertura médica recomendada: <strong className="text-white">{(result.cobertura_recomendada.medica / 1000000).toFixed(1)}M€</strong>
                </span>
                <span className="text-slate-400">
                  Evacuación recomendada: <strong className="text-white">{(result.cobertura_recomendada.evacuacion / 1000000).toFixed(1)}M€</strong>
                </span>
              </div>
            </div>

            {selected ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-sm text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a resultados
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selected.nombre}</h3>
                    <p className="text-slate-400 text-sm">{selected.aseguradora}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{selected.score}/100</div>
                    <div className="text-slate-400 text-sm">puntuación</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Coberturas</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Médica', value: `${(selected.coberturas.medica / 1000000).toFixed(1)}M€` },
                        { label: 'Evacuación', value: `${(selected.coberturas.evacuacion / 1000000).toFixed(1)}M€` },
                        { label: 'Cancelación', value: `${selected.coberturas.cancelacion}%` },
                        { label: 'Equipaje', value: `${selected.coberturas.equipaje}€` },
                        { label: 'Resp. Civil', value: `${(selected.coberturas.responsabilidad_civil / 1000).toFixed(0)}K€` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Incluye</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Repatriación', value: selected.coberturas.repatriacion },
                        { label: 'Cobertura COVID', value: selected.coberturas.covid },
                        { label: 'Deportes básicos', value: selected.coberturas.deportes_basicos },
                        { label: 'Deportes aventura', value: selected.coberturas.deportes_aventura },
                        { label: 'Electrónica', value: selected.coberturas.electronica },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-slate-400">{label}</span>
                          {value
                            ? <Check className="w-4 h-4 text-green-400" />
                            : <X className="w-4 h-4 text-red-400" />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Exclusiones importantes</h4>
                  <ul className="space-y-1">
                    {selected.exclusiones.map((ex, i) => (
                      <li key={i} className="text-sm text-red-400/80 flex items-center gap-1">
                        <X className="w-3 h-3" /> {ex}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={selected.afiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Ver oferta <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {result.resultados.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-left hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                          {p.nombre}
                        </h3>
                        <p className="text-slate-500 text-xs">{p.aseguradora}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${p.score >= 80 ? 'text-green-400' : p.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {p.score}
                          <span className="text-xs text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <Euro className="w-3.5 h-3.5" />
                      {p.precio_min}€ — {p.precio_max}€
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {p.recomendado_para.slice(0, 3).map((r: string) => (
                        <span key={r} className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
