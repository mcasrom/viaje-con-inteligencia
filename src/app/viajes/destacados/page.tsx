import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { MapPin, Clock, Sparkles, DollarSign, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Itinerarios destacados | Viaje con Inteligencia',
  description: 'Descubre itinerarios de viaje creados con IA. Inspírate para tu próximo viaje con rutas personalizadas por destino, presupuesto e intereses.',
  openGraph: {
    title: 'Itinerarios destacados | Viaje con Inteligencia',
    description: 'Explora itinerarios de viaje generados con IA. Encuentra inspiración para tu próxima aventura.',
    url: 'https://www.viajeinteligencia.com/viajes/destacados',
    type: 'website',
  },
};

interface PublicTrip {
  id: string;
  name: string;
  destination: string;
  country_code?: string;
  days: number;
  budget: string;
  interests: string[];
  itinerary_raw?: string;
  slug: string;
  created_at: string;
}

const budgetLabels: Record<string, string> = {
  low: 'Económico',
  moderate: 'Moderado',
  high: 'Alto',
};

function getExcerpt(itinerary: string | undefined, maxLength = 200): string {
  if (!itinerary) return '';
  const cleaned = itinerary.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
}

export default async function DestacadosPage() {
  let trips: PublicTrip[] = [];

  if (isSupabaseAdminConfigured()) {
    const { data } = await supabaseAdmin
      .from('trips')
      .select('id, name, destination, country_code, days, budget, interests, itinerary_raw, slug, created_at')
      .eq('is_public', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    trips = (data || []) as PublicTrip[];
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Itinerarios destacados</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Rutas generadas con IA para inspirar tu próximo viaje. Cada itinerario está personalizado por destino, presupuesto e intereses.
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Próximamente</h2>
            <p className="text-slate-400">Los primeros itinerarios destacados estarán disponibles pronto.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/viajes/destacados/${trip.slug}`}
                className="group bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10 block"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {trip.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {trip.days} {trip.days === 1 ? 'día' : 'días'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {budgetLabels[trip.budget] || trip.budget}
                    </span>
                  </div>

                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.interests.map((i) => (
                        <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {getExcerpt(trip.itinerary_raw)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
