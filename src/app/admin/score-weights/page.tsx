'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sliders, Loader2, Save, RefreshCw, Check, AlertTriangle } from 'lucide-react';

interface WeightRow {
  id: string;
  profile: string;
  riesgo: number;
  season: number;
  coste: number;
  perfil: number;
  updated_at: string;
}

const PROFILE_LABELS: Record<string, string> = {
  mochilero: 'Mochilero',
  familiar: 'Familiar',
  lujo: 'Lujo',
  aventura: 'Aventura',
  negocios: 'Negocios',
  default: 'Default',
};

const PROFILE_DESCS: Record<string, string> = {
  mochilero: 'Prioriza coste bajo, tolera riesgo medio',
  familiar: 'Prioriza seguridad, presupuesto medio',
  lujo: 'Prioriza perfil del destino, coste alto',
  aventura: 'Balance riesgo-aventura, presupuesto flexible',
  negocios: 'Prioriza coste y seguridad, viajes cortos',
  default: 'Perfil genérico sin preferencia específica',
};

const DIMENSION_LABELS: Record<string, { label: string; desc: string }> = {
  riesgo: { label: 'Riesgo', desc: 'Peso de la seguridad (MAEC)' },
  season: { label: 'Temporada', desc: 'Peso de la estacionalidad' },
  coste: { label: 'Coste', desc: 'Peso del presupuesto' },
  perfil: { label: 'Perfil', desc: 'Peso de la afinidad al perfil' },
};

export default function AdminScoreWeightsPage() {
  const [weights, setWeights] = useState<WeightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ profile: string; ok: boolean } | null>(null);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/score-weights');
      const data = await res.json();
      setWeights(data.weights || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeights(); }, []);

  const updateWeight = (profile: string, dim: string, val: number) => {
    setWeights(prev => prev.map(w => w.profile === profile ? { ...w, [dim]: val } : w));
  };

  const handleSave = async (row: WeightRow) => {
    setSaving(row.profile);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/score-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: row.profile,
          riesgo: row.riesgo,
          season: row.season,
          coste: row.coste,
          perfil: row.perfil,
        }),
      });
      const data = await res.json();
      setSaveMsg({ profile: row.profile, ok: data.success });
    } catch {
      setSaveMsg({ profile: row.profile, ok: false });
    } finally {
      setSaving(null);
    }
  };

  const total = (row: WeightRow) => (row.riesgo + row.season + row.coste + row.perfil);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard Admin</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/15 rounded-full border border-indigo-500/30">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 text-sm font-semibold">Pesos Score</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Pesos del Score por Perfil</h1>
              <p className="text-slate-400 text-sm mt-1">Ajusta cómo se pondera cada dimensión (riesgo, temporada, coste, perfil) según el tipo de viajero. Los pesos de cada perfil deben sumar 1.</p>
            </div>
            <button onClick={fetchWeights} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-8">
              {weights.map((row) => {
                const sum = total(row);
                const sumOk = Math.abs(sum - 1) < 0.01;
                return (
                  <div key={row.profile} className="bg-slate-900/50 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold">{PROFILE_LABELS[row.profile] || row.profile}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">{PROFILE_DESCS[row.profile] || ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sumOk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          Suma: {sum.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleSave(row)}
                          disabled={saving === row.profile || !sumOk}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {saving === row.profile ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Guardar
                        </button>
                      </div>
                    </div>

                    {saveMsg && saveMsg.profile === row.profile && (
                      <div className={`mb-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${saveMsg.ok ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                        {saveMsg.ok ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {saveMsg.ok ? 'Guardado correctamente' : 'Error al guardar'}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['riesgo', 'season', 'coste', 'perfil'].map((dim) => {
                        const info = DIMENSION_LABELS[dim];
                        const val = row[dim as keyof WeightRow] as number;
                        const valNum = typeof val === 'number' ? val : 0;
                        return (
                          <div key={dim}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-slate-300 text-xs font-medium">{info.label}</label>
                              <span className="text-white text-sm font-bold">{(valNum * 100).toFixed(0)}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={Math.round(valNum * 100)}
                              onChange={(e) => updateWeight(row.profile, dim, Number(e.target.value) / 100)}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-slate-600 text-[10px] mt-0.5">{info.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-2">Nota</h2>
          <p className="text-slate-400 text-sm">
            Los cambios se aplican en el siguiente cálculo de score (caché en servidor de 5 min).
            Cada perfil debe sumar 1.0 entre las 4 dimensiones. El perfil "Default" se usa como
            fallback cuando no hay un perfil específico.
          </p>
        </div>
      </main>
    </div>
  );
}
