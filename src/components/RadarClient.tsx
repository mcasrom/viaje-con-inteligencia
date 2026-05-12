'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, MapPin, Calendar, AlertTriangle, Plane, Loader2, Search, X, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface WatchlistEntry {
  id: number;
  country_code: string;
  country_name: string;
  bandera: string;
  region: string;
  nivel_riesgo: string;
  trip_start_date: string | null;
  trip_end_date: string | null;
  notes: string | null;
  created_at: string;
}

const RIESGO_COLORS: Record<string, string> = {
  'sin-riesgo': 'text-green-400 bg-green-500/10',
  bajo: 'text-green-300 bg-green-400/10',
  medio: 'text-yellow-400 bg-yellow-500/10',
  alto: 'text-orange-400 bg-orange-500/10',
  'muy-alto': 'text-red-400 bg-red-500/10',
};

const RIESGO_LABELS: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  'muy-alto': 'Muy alto',
};

async function searchCountries(query: string): Promise<{ codigo: string; nombre: string; bandera: string }[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(`/api/v1/countries/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.countries || [];
  } catch {
    return [];
  }
}

export default function RadarClient() {
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ codigo: string; nombre: string; bandera: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [newEntry, setNewEntry] = useState({ country_code: '', country_name: '', bandera: '', trip_start: '', trip_end: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch('/api/user/watchlist');
      if (!res.ok) return;
      const data = await res.json();
      setWatchlist(data.watchlist || []);
    } catch (e) {
      console.error('Error fetching watchlist:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchWatchlist();
    if (!authLoading && !user) setLoading(false);
  }, [user, authLoading, fetchWatchlist]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchCountries(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToWatchlist = async () => {
    if (!newEntry.country_code) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: newEntry.country_code,
          trip_start_date: newEntry.trip_start || null,
          trip_end_date: newEntry.trip_end || null,
          notes: newEntry.notes || null,
        }),
      });
      if (res.ok) {
        const optimistic: WatchlistEntry = {
          id: Date.now(),
          country_code: newEntry.country_code,
          country_name: newEntry.country_name,
          bandera: newEntry.bandera || '',
          region: '',
          nivel_riesgo: '',
          trip_start_date: newEntry.trip_start || null,
          trip_end_date: newEntry.trip_end || null,
          notes: newEntry.notes || null,
          created_at: new Date().toISOString(),
        };
        setWatchlist(prev => [optimistic, ...prev]);
        setShowAddForm(false);
        setNewEntry({ country_code: '', country_name: '', bandera: '', trip_start: '', trip_end: '', notes: '' });
        setSearchQuery('');
        (async () => {
          try {
            const r = await fetch('/api/user/watchlist');
            if (r.ok) {
              const d = await r.json();
              if (d.watchlist?.length) setWatchlist(d.watchlist);
            }
          } catch {}
        })();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error al añadir país');
      }
    } catch (e) {
      console.error('Error adding:', e);
      alert('Error de red al añadir país');
    } finally {
      setSaving(false);
    }
  };

  const removeFromWatchlist = async (entry: WatchlistEntry) => {
    try {
      await fetch(`/api/user/watchlist?id=${entry.id}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(w => w.id !== entry.id));
    } catch (e) {
      console.error('Error removing:', e);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Mi Radar de Viaje</h2>
        <p className="text-slate-400 mb-6">Inicia sesión para crear tu radar personal de destinos</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-7 h-7 text-blue-400" />
            Mi Radar de Viaje
          </h1>
          <p className="text-slate-400 mt-1">Monitoriza tus próximos destinos de un vistazo</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir País
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Añadir a tu radar</h3>
            <button type="button" onClick={() => { setShowAddForm(false); setNewEntry({ country_code: '', country_name: '', bandera: '', trip_start: '', trip_end: '', notes: '' }); setSearchQuery(''); }} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">País</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar país..."
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
              </div>
              {searchResults.length > 0 && !newEntry.country_code && (
                <div className="mt-2 bg-slate-700 border border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map(c => (
                    <button
                      type="button"
                      key={c.codigo}
                      onClick={() => { setNewEntry(prev => ({ ...prev, country_code: c.codigo, country_name: c.nombre, bandera: c.bandera })); setSearchQuery(''); setSearchResults([]); }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-600 text-left transition-colors"
                    >
                      <span className="text-xl">{c.bandera}</span>
                      <span className="text-white">{c.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
              {newEntry.country_name && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <span className="text-lg">{watchlist.find(w => w.country_code === newEntry.country_code)?.bandera || '🌍'}</span>
                  <span className="text-blue-300 font-medium">{newEntry.country_name}</span>
                  <button onClick={() => setNewEntry(prev => ({ ...prev, country_code: '', country_name: '', bandera: '' }))} className="ml-auto text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fecha inicio (opcional)</label>
                <input
                  type="date"
                  value={newEntry.trip_start}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, trip_start: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fecha fin (opcional)</label>
                <input
                  type="date"
                  value={newEntry.trip_end}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, trip_end: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Notas (opcional)</label>
              <input
                type="text"
                value={newEntry.notes}
                onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ej: Viaje en familia, julio 2026"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={addToWatchlist}
              disabled={saving || !newEntry.country_code}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Añadiendo...' : 'Añadir a mi Radar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700">
          <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Tu radar está vacío</h3>
          <p className="text-slate-400 mb-6">Añade países para monitorizar su riesgo, alertas y estado de un vistazo</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir mi primer destino
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {watchlist.map((entry) => (
            <Link
              key={entry.id}
              href={`/pais/${entry.country_code}`}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.bandera || '🌍'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {entry.country_name}
                    </h3>
                    <p className="text-xs text-slate-500">{entry.region}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); removeFromWatchlist(entry); }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar del radar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${RIESGO_COLORS[entry.nivel_riesgo] || 'text-slate-400 bg-slate-600/30'}`}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {RIESGO_LABELS[entry.nivel_riesgo] || entry.nivel_riesgo}
                </span>
              </div>

              {(entry.trip_start_date || entry.trip_end_date) && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  {entry.trip_start_date && <span>{entry.trip_start_date}</span>}
                  {entry.trip_start_date && entry.trip_end_date && <span>→</span>}
                  {entry.trip_end_date && <span>{entry.trip_end_date}</span>}
                </div>
              )}

              {entry.notes && (
                <p className="text-sm text-slate-500 line-clamp-2">{entry.notes}</p>
              )}

              <div className="flex items-center gap-1 mt-3 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plane className="w-3 h-3" />
                Ver detalle del país
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
