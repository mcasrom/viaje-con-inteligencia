'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Calendar, Plane, Clock, ChevronRight, Trash2, Loader2, Lock, Mail, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/lib/supabase';

type StatusConfig = Record<Trip['status'], { label: string; color: string }>;

const statusLabels: StatusConfig = {
  draft: { label: 'Borrador', color: 'bg-slate-600 text-slate-200' },
  planned: { label: 'Planificado', color: 'bg-blue-600 text-blue-100' },
  completed: { label: 'Completado', color: 'bg-green-600 text-green-100' },
  cancelled: { label: 'Cancelado', color: 'bg-red-600 text-red-100' },
};

export default function ViajesPage() {
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginPrompt(true);
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    async function fetchTrips() {
      try {
        const res = await fetch('/api/trips', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    
    setLoginLoading(true);
    setLoginError('');
    
    const { error } = await signInWithEmail(loginEmail.trim());
    
    if (error) {
      setLoginError(error);
    } else {
      setLoginSent(true);
    }
    setLoginLoading(false);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    setDeletingId(tripId);

    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok) {
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

  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Lock className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Acceso Restringido</h1>
          <p className="text-slate-400 mb-2">
            La opción <span className="text-white font-semibold">Mis Viajes</span> está disponible solo para usuarios registrados.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Regístrate gratis para crear y gestionar tus itinerarios de viaje con IA.
          </p>
          
          {loginSent ? (
            <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">¡Revisa tu correo!</h3>
              <p className="text-slate-400 text-sm">
                Hemos enviado un enlace mágico a <span className="text-white">{loginEmail}</span>
              </p>
              <p className="text-slate-500 text-xs mt-3">
                Haz clic en el enlace para {loginMode === 'signup' ? 'crear tu cuenta' : 'iniciar sesión'}.
              </p>
              <button
                onClick={() => { setLoginSent(false); setLoginEmail(''); }}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Usar otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginMode('login')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginMode === 'login' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginMode === 'signup' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 rounded-xl text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              {loginError && (
                <p className="text-red-400 text-sm text-left">{loginError}</p>
              )}
              
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {loginMode === 'signup' ? 'Crear Cuenta' : 'Enviar Enlace'}
                  </>
                )}
              </button>
            </form>
          )}
          
          <Link href="/" className="block mt-6 text-slate-500 hover:text-slate-300 text-sm">
            ← Volver al inicio
          </Link>
        </div>
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