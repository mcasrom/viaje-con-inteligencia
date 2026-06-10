import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { MapPin, Clock, Sparkles, DollarSign, Shield, ArrowLeft } from 'lucide-react';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Itinerarios destacados por España | Viaje con Inteligencia',
  description: 'Itinerarios por España creados con IA. Rutas por Andalucía, Madrid, Canarias, Camino de Santiago y más con análisis de seguridad smart traveller.',
  alternates: { canonical: 'https://www.viajeinteligencia.com/itinerarios/espana/destacados' },
};
interface PublicTrip {
  id: string; name: string; destination: string;
  days: number; budget: string; interests: string[];
  itinerary_raw?: string; slug: string; created_at: string;
}
const budgetLabels: Record<string, string> = {
  low: 'Económico', moderate: 'Moderado', high: 'Alto',
};
function getExcerpt(itinerary: string | undefined, maxLength = 180): string {
  if (!itinerary) return '';
  return itinerary.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim().slice(0, maxLength) + '...';
}
export default async function ItinerariosEspanaDestacadosPage() {
  let trips: PublicTrip[] = [];
  if (isSupabaseAdminConfigured()) {
    const { data } = await supabaseAdmin
      .from('trips')
      .select('id, name, destination, days, budget, interests, itinerary_raw, slug, created_at')
      .eq('is_public', true)
      .ilike('destination', '%España%')
      .order('created_at', { ascending: false })
      .limit(24);
    trips = (data || []) as PublicTrip[];
  }
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/itinerarios/espana" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Crear itinerario
        </Link>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> Smart Traveller · España
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Itinerarios destacados por España</h1>
          <p className="text-slate-400">Rutas generadas con IA por la comunidad. Inspírate para tu próximo viaje por España.</p>
        </div>
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">Aún no hay itinerarios destacados por España.</p>
            <Link href="/itinerarios/espana" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all">
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/viajes/${trip.slug || trip.id}`}
                className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">{trip.name}</h2>
                </div>
                <div className="flex flex-wrap gap-3 mb-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.days} días</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{budgetLabels[trip.budget] || trip.budget}</span>
                </div>
                {trip.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {trip.interests.slice(0, 4).map((i: string) => (
                      <span key={i} className="text-xs bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-slate-400">{i}</span>
                    ))}
                  </div>
                )}
                <p className="text-slate-400 text-sm line-clamp-2">{getExcerpt(trip.itinerary_raw)}</p>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-12 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Crea tu propio itinerario</h2>
          <p className="text-slate-400 text-sm mb-5">IA + datos de seguridad real por región española.</p>
          <Link href="/itinerarios/espana" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all">
            Generar itinerario gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
