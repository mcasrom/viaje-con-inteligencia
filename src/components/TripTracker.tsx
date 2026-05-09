'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plane, Plus, Trash2, Loader2, MapPin, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { paisesData } from '@/data/paises';

interface Trip {
  id: string;
  name: string;
  destination: string;
  country_code?: string;
  start_date?: string;
  end_date?: string;
  days: number;
  status: 'draft' | 'planned' | 'completed' | 'cancelled';
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400',
  planned: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', planned: 'Planificado', completed: 'Completado', cancelled: 'Cancelado',
};

export default function TripTracker() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !countryCode) return;
    setSaving(true);
    try {
      const pais = paisesData[countryCode as keyof typeof paisesData];
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          destination: pais?.nombre || countryCode,
          country_code: countryCode,
          start_date: startDate || null,
          end_date: endDate || null,
          days: 7,
          budget: 'moderate',
          interests: [],
          status: startDate ? 'planned' : 'draft',
        }),
      });
      if (res.ok) {
        await loadTrips();
        setShowForm(false);
        setName('');
        setCountryCode('');
        setStartDate('');
        setEndDate('');
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) setTrips(trips.filter(t => t.id !== id));
    } catch {}
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'Pasado';
    if (diff === 0) return '¡Hoy!';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  };

  const upcoming = trips.filter(t => t.status === 'planned' && t.start_date && new Date(t.start_date).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime());
  const past = trips.filter(t => t.status === 'completed' || t.status === 'cancelled' || (t.start_date && new Date(t.start_date).getTime() < Date.now()))
    .sort((a, b) => new Date(b.start_date || b.created_at).getTime() - new Date(a.start_date || a.created_at).getTime());
  const drafts = trips.filter(t => t.status === 'draft');

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Mis Viajes</h3>
            {!loading && <span className="text-xs text-slate-500">({trips.length})</span>}
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> Nuevo viaje
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600 space-y-3">
            <div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del viaje" required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <select value={countryCode} onChange={e => setCountryCode(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Seleccionar país...</option>
                {Object.values(paisesData).filter((p: any) => p.codigo !== 'cu').sort((a: any, b: any) => a.nombre.localeCompare(b.nombre)).map((p: any) => (
                  <option key={p.codigo} value={p.codigo}>{p.bandera} {p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-medium">Salida</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium">Vuelta</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Crear viaje'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-6">
            <Plane className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No tienes viajes planificados</p>
            <button onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300">Crear tu primer viaje</button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.length > 0 && (
              <>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Próximos</p>
                {upcoming.map(trip => (
                  <TripRow key={trip.id} trip={trip} onDelete={handleDelete} />
                ))}
              </>
            )}
            {drafts.length > 0 && (
              <>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-3">Borradores</p>
                {drafts.map(trip => (
                  <TripRow key={trip.id} trip={trip} onDelete={handleDelete} />
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-3">Historial</p>
                {past.slice(0, 3).map(trip => (
                  <TripRow key={trip.id} trip={trip} onDelete={handleDelete} compact />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TripRow({ trip, onDelete, compact }: { trip: Trip; onDelete: (id: string) => void; compact?: boolean }) {
  const pais = trip.country_code ? paisesData[trip.country_code as keyof typeof paisesData] : null;
  const isUpcoming = trip.start_date && new Date(trip.start_date) >= new Date(Date.now() - 86400000);

  return (
    <div className="flex items-center gap-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl p-3 transition-colors group">
      <span className="text-2xl">{pais?.bandera || '🌍'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/viajes/${trip.id}`} className="text-white font-medium text-sm hover:text-blue-400 transition-colors truncate">{trip.name}</Link>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${STATUS_STYLES[trip.status]}`}>{STATUS_LABELS[trip.status]}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 truncate">{trip.destination}</span>
          {trip.start_date && (
            <>
              <span className="text-slate-600 text-[10px]">·</span>
              <span className="text-[10px] text-slate-500">
                {new Date(trip.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
              </span>
              {isUpcoming && (
                <span className="text-[10px] text-blue-400 font-medium">{daysUntil(trip.start_date)}</span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link href={`/viajes/${trip.id}`} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </Link>
        {compact ? null : (
          <button onClick={() => onDelete(trip.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function daysUntil(date: string): string {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (diff < 0) return '';
  if (diff === 0) return '¡Hoy!';
  if (diff === 1) return 'Mañana';
  return `En ${diff} días`;
}
