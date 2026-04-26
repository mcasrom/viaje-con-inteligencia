'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Clock } from 'lucide-react';

const photos = ['/photos/1.jpg', '/photos/2.jpg', '/photos/3.jpg', '/photos/4.jpg'];
const today = new Date();
const photoIndex = (today.getMonth() * 2 + today.getDate()) % photos.length;
const bgPhoto = photos[photoIndex];

type TravelPreference = 'playa' | 'cultural' | 'naturaleza' | 'familiar';
type Budget = 'bajo' | 'medio' | 'alto';

interface Recommendation {
  destination: string;
  nombre: string;
  bandera: string;
  nivelRiesgo: string;
  score: number;
  reason: string;
  days: number;
  bestTime: string[];
  highlights: string[];
}

const preferenciaLabels: Record<TravelPreference, { label: string; icon: string; desc: string }> = {
  playa: { label: '🏖️ Playa', icon: '🌊', desc: 'Sol, arena y relax' },
  cultural: { label: '🏛️ Cultural', icon: '🎭', desc: 'Historia y museos' },
  naturaleza: { label: '🏔️ Naturaleza', icon: '🥾', desc: 'Aventura y paisajes' },
  familiar: { label: '👨‍👩‍👧‍👦 Familiar', icon: '🎢', desc: 'Apto para niños' },
};

export default function PlanificadorSimple() {
  const [preferencia, setPreferencia] = useState<TravelPreference>('cultural');
  const [presupuesto, setPresupuesto] = useState<Budget>('medio');
  const [duracion, setDuracion] = useState('7');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ai/recommend?preferencia=${preferencia}&presupuesto=${presupuesto}&duracion=${duracion}&limit=3`
      );
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiesgoColor = (nivel: string) => {
    if (nivel === 'sin-riesgo') return 'text-green-400';
    if (nivel === 'bajo') return 'text-emerald-400';
    if (nivel === 'medio') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 border border-blue-400/30 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${bgPhoto})` }}
        />
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              ✈️ Planifica tu viaje en 30 segundos
            </h2>
            <p className="text-blue-100 text-sm">
              Selecciona tu tipo de viaje y obtén recomendaciones personalizadas con IA
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(preferenciaLabels) as TravelPreference[]).map((pref) => (
                <button
                  key={pref}
                  onClick={() => { setPreferencia(pref); setShowResults(false); }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    preferencia === pref
                      ? 'bg-white text-blue-600 font-bold shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="text-xl mb-1">{preferenciaLabels[pref].icon}</div>
                  <div className="text-sm">{preferenciaLabels[pref].label.split(' ')[1]}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">💰</span>
                <select
                  value={presupuesto}
                  onChange={(e) => { setPresupuesto(e.target.value as Budget); setShowResults(false); }}
                  className="w-full pl-8 pr-4 py-2 bg-white/90 text-slate-900 rounded-xl text-sm"
                >
                  <option value="bajo">💵 Budget Bajo (&lt;50€/día)</option>
                  <option value="medio">💰 Budget Medio (50-150€/día)</option>
                  <option value="alto">💎 Budget Alto (&gt;150€/día)</option>
                </select>
              </div>

              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                <select
                  value={duracion}
                  onChange={(e) => { setDuracion(e.target.value); setShowResults(false); }}
                  className="w-full pl-8 pr-4 py-2 bg-white/90 text-slate-900 rounded-xl text-sm"
                >
                  <option value="5">🕐 5 días</option>
                  <option value="7">🕐 7 días</option>
                  <option value="10">🕐 10 días</option>
                  <option value="14">🕐 14 días</option>
                </select>
              </div>

              <button
                onClick={handleRecommend}
                disabled={loading}
                className="px-6 py-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Obtener Recommendations
                  </>
                )}
              </button>
            </div>
          </div>

          {showResults && recommendations.length > 0 && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <div className="text-center mb-3">
                <span className="text-blue-200 text-sm">🎯 Basado en tu perfil: {preferenciaLabels[preferencia].desc}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.map((rec, idx) => (
                  <a
                    key={rec.destination}
                    href={`/analisis?destino=${rec.destination}`}
                    className="block p-4 bg-white/95 rounded-xl hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{rec.bandera}</span>
                      <span className="font-bold text-slate-800">{rec.nombre}</span>
                      <span className={`ml-auto text-xs ${getRiesgoColor(rec.nivelRiesgo)}`}>
                        {rec.nivelRiesgo === 'sin-riesgo' ? '✓ Seguro' : rec.nivelRiesgo}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mb-2">
                      {rec.highlights.slice(0, 2).join(' • ')}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>⏱️ {rec.days} días</span>
                      <span>📅 {rec.bestTime.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium group-hover:underline">
                        Ver análisis →
                      </span>
                      <span className="text-xs text-slate-400">#{idx + 1}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mt-4 text-sm">
            <span className="text-blue-200">Powered by </span>
            <span className="text-white font-medium">ML Clustering</span>
          </div>
        </div>
      </div>
    </div>
  );
}