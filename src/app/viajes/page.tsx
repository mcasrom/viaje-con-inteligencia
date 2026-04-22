'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Calendar, Plane, Clock, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/supabase';

type StatusConfig = Record<Trip['status'], { label: string; color: string }>;

const statusLabels: StatusConfig = {
  draft: { label: 'Borrador', color: 'bg-slate-600 text-slate-200' },
  planned: { label: 'Planificado', color: 'bg-blue-600 text-blue-100' },
  completed: { label: 'Completado', color: 'bg-green-600 text-green-100' },
  cancelled: { label: 'Cancelado', color: 'bg-red-600 text-red-100' },
};

export default function ViajesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const currentUser = user;

    async function fetchTrips() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setTrips(data);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [user]);

  const handleDelete = async (tripId: string) => {
    if (!supabase) return;
    if (!confirm('¿Eliminar este viaje?')) return;
    setDeletingId(tripId);

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (!error) {
        setTrips(prev => prev.filter(t => t.id !== tripId));
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const upcomingTrips = trips.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const pastTrips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            ← Volver
          </Link>
          <h1 className="text-xl font-bold text-white">Mis Viajes</h1>
          <Link
            href="/viajes/nuevo"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sin viajes todavía</h2>
            <p className="text-slate-400 mb-6">Crea tu primer viaje personalizado con IA</p>
            <Link
              href="/viajes/nuevo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear viaje
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Próximos viajes
                </h2>
                <div className="grid gap-4">
                  {upcomingTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} statusLabels={statusLabels} onDelete={handleDelete} deletingId={deletingId} />
                  ))}
                </div>
              </section>
            )}

            {pastTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-400 mb-4">Historial</h2>
                <div className="grid gap-4">
                  {pastTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} statusLabels={statusLabels} onDelete={handleDelete} deletingId={deletingId} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TripCard({
  trip,
  statusLabels,
  onDelete,
  deletingId,
}: {
  trip: Trip;
  statusLabels: StatusConfig;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <Link
      href={`/viajes/${trip.id}`}
      className="block bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {trip.name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabels[trip.status].color}`}>
              {statusLabels[trip.status].label}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {trip.days} {trip.days === 1 ? 'día' : 'días'}
            </span>
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(trip.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(trip.id);
            }}
            disabled={deletingId === trip.id}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            {deletingId === trip.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}