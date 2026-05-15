import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { ArrowLeft, MapPin, Clock, DollarSign, Sparkles, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const budgetLabels: Record<string, string> = {
  low: 'Económico (<50€/día)',
  moderate: 'Moderado (50-150€/día)',
  high: 'Alto (>150€/día)',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isSupabaseAdminConfigured()) return { title: 'Itinerario no disponible' };

  const { data } = await supabaseAdmin
    .from('trips')
    .select('name, destination, itinerary_raw')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (!data) return { title: 'Itinerario no encontrado' };

  const description = data.itinerary_raw
    ? data.itinerary_raw.replace(/\*\*/g, '').replace(/\n+/g, ' ').slice(0, 200) + '...'
    : `Itinerario de viaje a ${data.destination}`;

  return {
    title: `${data.name} | Itinerario - Viaje con Inteligencia`,
    description,
    openGraph: {
      title: `${data.name} - Itinerario de viaje a ${data.destination}`,
      description,
      url: `https://www.viajeinteligencia.com/viajes/destacados/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} - ${data.destination}`,
      description,
      creator: '@ViajeIntel2026',
    },
    alternates: {
      canonical: `https://www.viajeinteligencia.com/viajes/destacados/${slug}`,
    },
  };
}

export default async function DestacadoSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isSupabaseAdminConfigured()) notFound();

  const { data: trip, error } = await supabaseAdmin
    .from('trips')
    .select('id, name, destination, country_code, days, budget, interests, itinerary_raw, slug, start_date, created_at')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (error || !trip) notFound();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/viajes/destacados" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Destacados</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">{trip.name}</h1>

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
            {trip.start_date && (
              <div>
                <p className="text-slate-400">Fecha</p>
                <p className="text-white flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            )}
          </div>

          {trip.interests && trip.interests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Intereses</p>
              <div className="flex flex-wrap gap-2">
                {trip.interests.map((i: string) => (
                  <span key={i} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {trip.itinerary_raw ? (
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Itinerario
            </h2>
            <div className="bg-slate-700 rounded-xl p-4">
              <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {trip.itinerary_raw}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-6 text-center py-12">
            <p className="text-slate-400">Este itinerario aún no tiene contenido detallado.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/viajes/nuevo"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Crear mi propio itinerario con IA
          </Link>
        </div>
      </main>
    </div>
  );
}
