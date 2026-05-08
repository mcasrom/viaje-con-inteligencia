'use client';

import { useState, useEffect } from 'react';
import { User, Save, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PROFILES = [
  { id: 'mochilero', label: '🎒 Mochilero', desc: 'Presupuesto ajustado, albergues, transporte público' },
  { id: 'lujo', label: '💎 Lujo', desc: 'Hoteles 5★, experiencias premium, confort' },
  { id: 'familiar', label: '👨‍👩‍👧‍👦 Familiar', desc: 'Actividades para niños, seguridad, comodidad' },
  { id: 'aventura', label: '🏔️ Aventura', desc: 'Trekking, deportes extremos, naturaleza' },
  { id: 'negocios', label: '💼 Negocios', desc: 'Conexiones, hoteles céntricos, eficiencia' },
];

const RISK_OPTIONS = [
  { id: 'baja', label: '🛡️ Baja', desc: 'Solo destinos seguros, evito zonas conflictivas' },
  { id: 'media', label: '⚖️ Media', desc: 'Valoro riesgo pero no me limito' },
  { id: 'alta', label: '🔥 Alta', desc: 'Me importa más la experiencia que el riesgo' },
];

const BUDGET_OPTIONS = [
  { id: 'bajo', label: '💰 Bajo', desc: 'Máximo 50€/día' },
  { id: 'medio', label: '💰💰 Medio', desc: '50-150€/día' },
  { id: 'alto', label: '💰💰💰 Alto', desc: 'Sin límite de presupuesto' },
];

export default function PreferencesSelector() {
  const { user } = useAuth();
  const [travelerType, setTravelerType] = useState('mochilero');
  const [riskTolerance, setRiskTolerance] = useState('media');
  const [budgetRange, setBudgetRange] = useState('medio');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setTravelerType(data.preferences.traveler_type || 'mochilero');
          setRiskTolerance(data.preferences.risk_tolerance || 'media');
          setBudgetRange(data.preferences.budget_range || 'medio');
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traveler_type: travelerType,
          risk_tolerance: riskTolerance,
          budget_range: budgetRange,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <p className="text-slate-400 text-xs text-center">
          <User className="w-3 h-3 inline mr-1" />
          Inicia sesión para guardar tus preferencias
        </p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 animate-pulse">
        <div className="h-3 bg-slate-700 rounded w-24 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-32" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <User className="w-3 h-3 text-blue-400" /> Mis Preferencias
        </span>
        <button
          onClick={save}
          disabled={saving}
          className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3 text-green-400" /> : <Save className="w-3 h-3" />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1.5">Tipo de viajero</p>
        <div className="flex flex-wrap gap-1">
          {PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => setTravelerType(p.id)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                travelerType === p.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={p.desc}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1.5">Tolerancia al riesgo</p>
        <div className="flex gap-1">
          {RISK_OPTIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setRiskTolerance(r.id)}
              className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                riskTolerance === r.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={r.desc}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1.5">Presupuesto</p>
        <div className="flex gap-1">
          {BUDGET_OPTIONS.map(b => (
            <button
              key={b.id}
              onClick={() => setBudgetRange(b.id)}
              className={`flex-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                budgetRange === b.id
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={b.desc}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
