'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Users, TrendingUp, Star, CheckCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SharedTripClientProps {
  token: string;
  sharedTrip: any;
  tripData: any;
  ownerData: any;
}

export default function SharedTripClient({ token, sharedTrip, tripData, ownerData }: SharedTripClientProps) {
  const [accepted, setAccepted] = useState(false);
  const [now] = useState(() => Date.now());

  if (!sharedTrip || !tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Viaje no disponible</h1>
          <p className="text-slate-400 mb-6">Este viaje compartido ha expirado o no existe.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const expiresAt = sharedTrip.expires_at ? new Date(sharedTrip.expires_at) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-2 text-emerald-100 text-sm">
            <Users className="w-4 h-4" />
            <span>Te han invitado a este viaje</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tripData.name}</h1>
          <p className="text-emerald-100">
            {ownerData?.username || ownerData?.email?.split('@')[0] || 'Un viajero'} te invita a explorar {tripData.destination}
          </p>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4">
            <MapPin className="w-5 h-5 text-rose-400 mb-2" />
            <p className="text-white font-bold">{tripData.destination}</p>
            <p className="text-slate-400 text-xs">Destino</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-white font-bold">
              {tripData.start_date ? new Date(tripData.start_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'Flexible'}
            </p>
            <p className="text-slate-400 text-xs">Inicio</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <Clock className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-white font-bold">{tripData.days || '?'} días</p>
            <p className="text-slate-400 text-xs">Duración</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-white font-bold">{tripData.budget ? `${tripData.budget}€` : 'Flexible'}</p>
            <p className="text-slate-400 text-xs">Presupuesto</p>
          </div>
        </div>

        {/* Interest Tags */}
        {tripData.interests && tripData.interests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-3">Intereses del viaje</h3>
            <div className="flex flex-wrap gap-2">
              {tripData.interests.map((interest: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                  {interest === 'playa' ? '🏖️' :
                   interest === 'cultural' ? '🏛️' :
                   interest === 'naturaleza' ? '🏔️' :
                   interest === 'gastronomia' ? '🍽️' :
                   interest === 'vino' ? '🍷' :
                   interest === 'aventura' ? '🧗' : '⭐'}{' '}
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3">Estado del viaje</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">
                Estado: <strong className="text-white">{tripData.status || 'Planificado'}</strong>
              </span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm">
                  Enlace expira en <strong className="text-white">{daysLeft} días</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm">
                {sharedTrip.views} visitas
              </span>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        {tripData.itinerary_raw && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Itinerario del viaje
            </h3>
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed">
              <ReactMarkdown>{tripData.itinerary_raw}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          {accepted ? (
            <div className="bg-emerald-500/20 rounded-xl p-6 border border-emerald-500/30">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">¡Te has unido al viaje!</h3>
              <p className="text-slate-300">El organizador será notificado.</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAccepted(true)}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-lg font-medium transition-all mb-4"
              >
                <Star className="w-5 h-5 inline mr-2" />
                ¡Quiero unirme a este viaje!
              </button>
              <p className="text-slate-400 text-sm">
                O{' '}
                <Link href="/rutas" className="text-emerald-400 hover:underline">
                  explora rutas por tu cuenta
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
