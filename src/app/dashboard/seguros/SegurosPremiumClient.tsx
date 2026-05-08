'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Plus, Trash2, Bell, CheckCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { UserPolicy, InsuranceAlert } from '@/lib/seguros/monitor';

const PROVIDERS = ['IATI Seguros', 'Chapka', 'Intermundial', 'AXA', 'Mapfre', 'Allianz', 'Otro'];

interface Props {
  userId: string;
}

export default function SegurosPremiumClient({ userId }: Props) {
  const [policies, setPolicies] = useState<UserPolicy[]>([]);
  const [alerts, setAlerts] = useState<InsuranceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const [form, setForm] = useState({
    policy_name: '',
    provider: '',
    medical_coverage: 500000,
    evacuation_coverage: 1000000,
    cancelation_percent: 75,
    covers_repatriation: true,
    covers_covid: true,
    covers_sports: true,
    covers_adventure_sports: false,
    covers_electronics: false,
    max_equipaje: 800,
  });

  const loadData = async () => {
    const [pRes, aRes] = await Promise.all([
      fetch('/api/seguros/policies'),
      fetch('/api/seguros/alerts'),
    ]);
    if (pRes.ok) setPolicies(await pRes.json());
    if (aRes.ok) setAlerts(await aRes.json());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/seguros/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          policy_name: '', provider: '', medical_coverage: 500000,
          evacuation_coverage: 1000000, cancelation_percent: 75,
          covers_repatriation: true, covers_covid: true, covers_sports: true,
          covers_adventure_sports: false, covers_electronics: false, max_equipaje: 800,
        });
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/seguros/policies?id=${id}`, { method: 'DELETE' });
    await loadData();
  };

  const handleCheckNow = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/seguros/monitor', { method: 'POST' });
      const data = await res.json();
      setCheckResult(data.alerts !== undefined ? `${data.alerts} alertas generadas` : 'Error');
      await loadData();
    } catch {
      setCheckResult('Error al verificar');
    } finally {
      setChecking(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/seguros/alerts?id=${id}`, { method: 'PATCH' });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const unreadCount = alerts.filter(a => !a.read).length;
  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 10);

  const SEVERITY_COLORS: Record<string, string> = {
    high: 'bg-red-500/10 border-red-500/30 text-red-400',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Monitor de Seguros</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Compara tu póliza con el riesgo real de tus destinos favoritos
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300">
            ← Dashboard
          </Link>
        </div>

        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Alertas {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
              </h2>
              <button
                onClick={handleCheckNow}
                disabled={checking}
                className="text-sm px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-1"
              >
                {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Verificar ahora
              </button>
            </div>

            {checkResult && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
                {checkResult}
              </div>
            )}

            <div className="space-y-2">
              {displayedAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-xl ${!alert.read ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-700/50 opacity-70'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                      <div>
                        <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                        <p className="text-slate-400 text-xs mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}`}>
                            {alert.severity}
                          </span>
                          {alert.country_code && (
                            <span className="text-xs text-slate-500">{alert.country_code}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.read && (
                      <button
                        onClick={() => handleMarkRead(alert.id!)}
                        className="text-xs text-blue-400 hover:text-blue-300 shrink-0"
                      >
                        ✓ Leído
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {alerts.length > 10 && (
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="mt-2 text-sm text-slate-400 hover:text-white flex items-center gap-1"
              >
                {showAllAlerts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAllAlerts ? 'Mostrar menos' : `Mostrar todas (${alerts.length})`}
              </button>
            )}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Tus pólizas
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Añadir póliza
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nombre de la póliza</label>
                  <input
                    type="text"
                    value={form.policy_name}
                    onChange={e => setForm({ ...form, policy_name: e.target.value })}
                    placeholder="Ej: IATI Top Ventas"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Aseguradora</label>
                  <select
                    value={form.provider}
                    onChange={e => setForm({ ...form, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cobertura médica (€)</label>
                  <input
                    type="number"
                    value={form.medical_coverage}
                    onChange={e => setForm({ ...form, medical_coverage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cobertura evacuación (€)</label>
                  <input
                    type="number"
                    value={form.evacuation_coverage}
                    onChange={e => setForm({ ...form, evacuation_coverage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cancelación (%)</label>
                  <input
                    type="number"
                    value={form.cancelation_percent}
                    onChange={e => setForm({ ...form, cancelation_percent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Equipaje (€)</label>
                  <input
                    type="number"
                    value={form.max_equipaje}
                    onChange={e => setForm({ ...form, max_equipaje: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { key: 'covers_repatriation', label: 'Repatriación' },
                  { key: 'covers_covid', label: 'Cobertura COVID' },
                  { key: 'covers_sports', label: 'Deportes básicos' },
                  { key: 'covers_adventure_sports', label: 'Deportes aventura' },
                  { key: 'covers_electronics', label: 'Electrónica' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-600"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-400 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Guardar póliza'}
              </button>
            </form>
          )}

          {policies.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-xl">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Añade tu seguro de viaje para empezar a monitorizar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {policies.map(policy => (
                <div key={policy.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{policy.policy_name}</h3>
                      <p className="text-slate-400 text-xs">{policy.provider}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="text-slate-400">Médica: <span className="text-white">{(policy.medical_coverage / 1000000).toFixed(1)}M€</span></div>
                    <div className="text-slate-400">Evacuación: <span className="text-white">{(policy.evacuation_coverage / 1000000).toFixed(1)}M€</span></div>
                    <div className="text-slate-400">Cancelación: <span className="text-white">{policy.cancelation_percent}%</span></div>
                    <div className="text-slate-400">Equipaje: <span className="text-white">{policy.max_equipaje}€</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { label: 'Repatriación', active: policy.covers_repatriation },
                      { label: 'COVID', active: policy.covers_covid },
                      { label: 'Deportes', active: policy.covers_sports },
                      { label: 'Aventura', active: policy.covers_adventure_sports },
                      { label: 'Electrónica', active: policy.covers_electronics },
                    ].map(({ label, active }) => (
                      <span key={label} className={`px-2 py-0.5 rounded text-xs ${active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {alerts.length === 0 && policies.length > 0 && (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>No hay alertas activas. Tus pólizas cumplen con la cobertura recomendada para tus destinos.</p>
            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="mt-3 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >
              {checking ? 'Verificando...' : 'Verificar ahora'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
