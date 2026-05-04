'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Plane, Save, Trash2, Edit2, Plus, RefreshCw } from 'lucide-react';

interface AirspaceClosure {
  id?: string;
  country_code: string;
  country_name: string;
  closure_date: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notes: string;
}

interface AffectedRoute {
  id?: string;
  origin_iata: string;
  destination_iata: string;
  destination_country: string;
  closed_airspace: string;
  detour_km: number;
  fuel_surcharge_pct: number;
  time_extra_hours: number;
  alternative_route: string;
  is_active: boolean;
}

export default function AdminAirspace() {
  const router = useRouter();
  const [closures, setClosures] = useState<AirspaceClosure[]>([]);
  const [routes, setRoutes] = useState<AffectedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClosure, setEditingClosure] = useState<AirspaceClosure | null>(null);
  const [editingRoute, setEditingRoute] = useState<AffectedRoute | null>(null);
  const [showNewClosure, setShowNewClosure] = useState(false);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/airspace')
      .then(res => res.json())
      .then(data => {
        setClosures(data.closures || []);
        setRoutes(data.routes || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveClosure = async (c: AirspaceClosure) => {
    setSaving(true);
    const endpoint = c.id ? '/api/airspace/closures' : '/api/airspace/closures';
    const method = c.id ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });

    if (res.ok) {
      setEditingClosure(null);
      setShowNewClosure(false);
      window.location.reload();
    }
    setSaving(false);
  };

  const toggleClosure = async (id: string, is_active: boolean) => {
    await fetch(`/api/airspace/closures`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    });
    window.location.reload();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al dashboard</span>
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Espacio Aéreo</h1>
        <p className="text-slate-400 mb-8">Administra cierres de espacio aéreo y rutas afectadas. Los cambios se aplican inmediatamente.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Cierres de espacio aéreo
              </h2>
              <button
                onClick={() => setShowNewClosure(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </button>
            </div>

            {showNewClosure && (
              <ClosureForm
                onSave={saveClosure}
                onCancel={() => setShowNewClosure(false)}
                saving={saving}
              />
            )}

            <div className="space-y-2">
              {closures.map((c) => (
                <div key={c.id} className={`bg-slate-800 rounded-lg p-4 border ${c.is_active ? 'border-slate-700' : 'border-slate-700/50 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${c.is_active ? 'bg-rose-400' : 'bg-slate-500'}`} />
                      <div>
                        <span className="text-white font-medium">{c.country_name}</span>
                        <span className="text-slate-500 text-sm ml-2">({c.country_code})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                        c.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        c.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {c.severity}
                      </span>
                      <button
                        onClick={() => toggleClosure(c.id!, !c.is_active)}
                        className={`text-xs px-2 py-1 rounded ${c.is_active ? 'bg-rose-500/20 text-rose-400' : 'bg-green-500/20 text-green-400'}`}
                      >
                        {c.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{c.reason}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-cyan-400" />
                Rutas afectadas desde MAD
              </h2>
              <button
                onClick={() => setShowNewRoute(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500"
              >
                <Plus className="w-4 h-4" />
                Nueva
              </button>
            </div>

            {showNewRoute && (
              <RouteForm
                onSave={(r) => {
                  setSaving(true);
                  fetch('/api/airspace/routes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(r),
                  }).then(() => window.location.reload());
                }}
                onCancel={() => setShowNewRoute(false)}
                saving={saving}
              />
            )}

            <div className="space-y-2">
              {routes.map((r) => (
                <div key={r.id} className={`bg-slate-800 rounded-lg p-4 border ${r.is_active ? 'border-slate-700' : 'border-slate-700/50 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">MAD → {r.destination_iata}</span>
                      <span className="text-slate-500 text-sm ml-2">({r.destination_country})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 text-sm font-medium">+{r.fuel_surcharge_pct}%</span>
                      <span className="text-slate-400 text-sm">+{r.time_extra_hours}h</span>
                      <span className="text-xs text-slate-500">vía {r.closed_airspace}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{r.alternative_route}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ClosureForm({ onSave, onCancel, saving }: { onSave: (c: AirspaceClosure) => void; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState<AirspaceClosure>({
    country_code: '',
    country_name: '',
    closure_date: new Date().toISOString().split('T')[0],
    reason: '',
    severity: 'medium',
    is_active: true,
    notes: '',
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30 mb-4">
      <h3 className="text-white font-medium mb-3">Nuevo cierre</h3>
      <div className="grid grid-cols-2 gap-3">
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" placeholder="Código país (RU)" value={form.country_code} onChange={e => setForm({...form, country_code: e.target.value.toUpperCase()})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" placeholder="Nombre país" value={form.country_name} onChange={e => setForm({...form, country_name: e.target.value})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" type="date" value={form.closure_date} onChange={e => setForm({...form, closure_date: e.target.value})} />
        <select className="bg-slate-700 text-white rounded px-3 py-2 text-sm" value={form.severity} onChange={e => setForm({...form, severity: e.target.value as any})}>
          <option value="low">Bajo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="critical">Crítico</option>
        </select>
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm col-span-2" placeholder="Razón" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm col-span-2" placeholder="Notas" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500 flex items-center gap-1">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">Cancelar</button>
      </div>
    </div>
  );
}

function RouteForm({ onSave, onCancel, saving }: { onSave: (r: AffectedRoute) => void; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState<AffectedRoute>({
    origin_iata: 'MAD',
    destination_iata: '',
    destination_country: '',
    closed_airspace: '',
    detour_km: 0,
    fuel_surcharge_pct: 0,
    time_extra_hours: 0,
    alternative_route: '',
    is_active: true,
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30 mb-4">
      <h3 className="text-white font-medium mb-3">Nueva ruta afectada</h3>
      <div className="grid grid-cols-3 gap-3">
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" placeholder="Destino IATA (NRT)" value={form.destination_iata} onChange={e => setForm({...form, destination_iata: e.target.value.toUpperCase()})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" placeholder="Código país destino" value={form.destination_country} onChange={e => setForm({...form, destination_country: e.target.value.toUpperCase()})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" placeholder="Espacio cerrado (RU)" value={form.closed_airspace} onChange={e => setForm({...form, closed_airspace: e.target.value.toUpperCase()})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" type="number" placeholder="Km desvío" value={form.detour_km || ''} onChange={e => setForm({...form, detour_km: Number(e.target.value)})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" type="number" placeholder="% sobrecoste" value={form.fuel_surcharge_pct || ''} onChange={e => setForm({...form, fuel_surcharge_pct: Number(e.target.value)})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm" type="number" placeholder="Horas extra" value={form.time_extra_hours || ''} onChange={e => setForm({...form, time_extra_hours: Number(e.target.value)})} />
        <input className="bg-slate-700 text-white rounded px-3 py-2 text-sm col-span-3" placeholder="Ruta alternativa" value={form.alternative_route} onChange={e => setForm({...form, alternative_route: e.target.value})} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500 flex items-center gap-1">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">Cancelar</button>
      </div>
    </div>
  );
}
