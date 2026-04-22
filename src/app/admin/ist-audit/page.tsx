'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface Prediction {
  id: string;
  country_code: string;
  country_name: string;
  travel_date: string;
  ist_score: number;
  recommendation: string;
  events_count: number;
  created_at: string;
  feedback?: {
    real_saturation_rating: number;
    was_accurate: boolean;
    actual_crowding: string;
    actual_prices: string;
    comments: string;
  };
}

interface Stats {
  total: number;
  accurate: number;
  avgRating: string;
}

export default function ISTAuditPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ist/feedback');
      const data = await res.json();
      setPredictions(data.predictions || []);
      setStats(data.stats);
    } catch (e) {
      console.error('Error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const accuracyRate = stats ? Math.round((stats.accurate / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Admin</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Auditoría IST
          </h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 mb-8 border border-purple-700/30">
          <h2 className="text-2xl font-bold text-white mb-2">📊 Auditoría Índice de Saturación Turística</h2>
          <p className="text-slate-300">
            Comparación entre predicciones IST y experiencia real de los viajeros.
          </p>
        </div>

        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-blue-300 text-sm">Predicciones</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.accurate}</div>
              <div className="text-green-300 text-sm">Con feedback</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-purple-400">{accuracyRate}%</div>
              <div className="text-purple-300 text-sm">Precisión</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.avgRating}/5</div>
              <div className="text-yellow-300 text-sm">Rating promedio</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-400 mb-2">Sin datos todavía</h3>
            <p className="text-slate-500">
              Las predicciones aparecerán cuando los usuarios calculen el IST.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className="bg-slate-800/70 rounded-xl p-5 border border-slate-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{pred.country_code === 'ES' ? '🇪🇸' : pred.country_code === 'FR' ? '🇫🇷' : '🌍'}</span>
                      <div>
                        <h3 className="text-white font-bold">{pred.country_name}</h3>
                        <p className="text-slate-400 text-sm">
                          Viaje: {new Date(pred.travel_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        IST: {pred.ist_score}
                      </span>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded">
                        {pred.recommendation}
                      </span>
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded">
                        {pred.events_count} eventos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {pred.feedback ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {pred.feedback.was_accurate ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="text-white font-bold">
                            Rating real: {pred.feedback.real_saturation_rating}/5
                          </span>
                        </div>
                        {pred.feedback.comments && (
                          <p className="text-slate-400 text-sm max-w-xs truncate">
                            "{pred.feedback.comments}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-slate-700/50 rounded-lg text-slate-500 text-sm">
                        Sin feedback
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}