'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, Sparkles, Loader2, Send, Plane, Clock, Pencil, X, Check, FileDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/lib/supabase';
import PDFExportButton from '@/components/PDFExportButton';
import { ShareTrip } from '@/components/ShareTrip';
import { trackActivity } from '@/components/UserLevel';

const statusOptions: { value: Trip['status']; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'planned', label: 'Planificado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const budgetLabels: Record<string, string> = {
  low: 'Económico (<50€/día)',
  moderate: 'Moderado (50-150€/día)',
  high: 'Alto (>150€/día)',
};

export default function ViajeDetallePage() {
  const { user, loading: authLoading, getSession } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Trip['status']>('draft');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !tripId) return;

    async function fetchTrip() {
      try {
        const token = await getSession();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`/api/trips/${tripId}`, { 
          cache: 'no-store',
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
          setEditName(data.trip.name);
          setEditStatus(data.trip.status);
        } else {
          router.push('/viajes');
        }
      } catch {
        router.push('/viajes');
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [user, tripId, router]);

  const handleRegenerateItinerary = async () => {
    if (!trip) return;
    setRegenerating(true);

    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          days: trip.days,
          interests: trip.interests,
        }),
      });

      const data = await res.json();
      if (data.itinerary) {
        setTrip(prev => prev ? { ...prev, itinerary_raw: data.itinerary } : null);
        const token = await getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        await fetch(`/api/trips/${tripId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            itinerary_raw: data.itinerary,
            updated_at: new Date().toISOString(),
          }),
        });
        trackActivity('generate_route', { trip_id: tripId, destination: trip.destination });
      }
    } catch {
      setError('Error al regenerar itinerario');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    if (!trip || !user) return;
    setSaving(true);
    setError('');

    try {
      const token = await getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: editName,
          status: editStatus,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      const data = await res.json();
      setTrip(data.trip);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/viajes" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Mis Viajes</span>
          </Link>
          <div className="flex items-center gap-3">
            {trip && trip.itinerary_raw && (
              <PDFExportButton trip={trip} />
            )}
            <ShareTrip tripId={tripId} tripName={trip.name} />
            <button
              onClick={() => setEditing(e => !e)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {editing ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Estado</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as Trip['status'])}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      trip.status === 'draft' ? 'bg-slate-600 text-slate-200' :
                      trip.status === 'planned' ? 'bg-blue-600 text-blue-100' :
                      trip.status === 'completed' ? 'bg-green-600 text-green-100' :
                      'bg-red-600 text-red-100'
                    }`}>
                      {statusOptions.find(s => s.value === trip.status)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Destino</p>
                  <p className="text-white flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {trip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Duración</p>
                  <p className="text-white flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    {trip.days} {trip.days === 1 ? 'día' : 'días'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Presupuesto</p>
                  <p className="text-white mt-1">{budgetLabels[trip.budget] || trip.budget}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fechas</p>
                  <p className="text-white flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {trip.start_date
                      ? `${new Date(trip.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}${trip.end_date ? ` - ${new Date(trip.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}` : ''}`
                      : 'Sin definir'}
                  </p>
                </div>
              </div>

              {trip.interests && trip.interests.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">Intereses</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {trip.interests.map(i => (
                      <span key={i} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Itinerario
            </h2>
            <button
              onClick={handleRegenerateItinerary}
              disabled={regenerating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Regenerar
            </button>
          </div>

          {trip.itinerary_raw ? (
            <div className="bg-slate-700 rounded-xl p-4 max-h-[600px] overflow-y-auto">
              <pre className="text-slate-300 whitespace-pre-wrap text-sm">{trip.itinerary_raw}</pre>
            </div>
          ) : (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">Sin itinerario generado</p>
              <button
                onClick={handleRegenerateItinerary}
                disabled={regenerating}
                className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {regenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generar Itinerario con IA
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}