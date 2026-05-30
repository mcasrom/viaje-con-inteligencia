import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { MapPin, Clock, Sparkles, DollarSign, Users, Shield, AlertTriangle, Thermometer, TrendingUp, Bell } from 'lucide-react';
import { getPaisData } from '@/lib/paises-db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Itinerarios destacados | Viaje con Inteligencia',
  description: 'Descubre itinerarios de viaje creados con IA con análisis de riesgo integrado. Inspírate para tu próximo viaje con rutas personalizadas por destino, perfil de viajero, tipo de viaje, presupuesto e intereses.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/viajes/destacados',
  },
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

const riesgoColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'sin-riesgo': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500' },
  'bajo': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
  'medio': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  'alto': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
  'muy-alto': { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700/50', dot: 'bg-red-700' },
};

const usRiskColors = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

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

  const tripRiskData = await Promise.all(
    trips.map(async (trip) => {
      if (!trip.country_code) return null;
      const code = trip.country_code.toLowerCase();
      const pais = await getPaisData(code);

      let usRisk = null;
      let incidents: any[] = [];
      let indices: any[] = [];

      if (isSupabaseAdminConfigured()) {
        const [{ data: usData }, { data: incData }, { data: idxData }] = await Promise.all([
          supabaseAdmin.from('us_state_dept').select('level').eq('country_code', code).single(),
          supabaseAdmin.from('incidents').select('severity').eq('country_code', code).gte('detected_at', new Date(Date.now() - 7 * 86400000).toISOString()).limit(5),
          supabaseAdmin.from('indices').select('tipo, valor').eq('codigo_pais', code),
        ]);
        usRisk = usData;
        incidents = incData || [];
        indices = idxData || [];
      }

      const gpi = indices.find((i: any) => i.tipo === 'gpi')?.valor;
      const gti = indices.find((i: any) => i.tipo === 'gti')?.valor;
      const hdi = indices.find((i: any) => i.tipo === 'hdi')?.valor;

      return {
        tripId: trip.id,
        nivelRiesgo: pais?.nivelRiesgo || null,
        riesgoSanitario: (pais as any)?.riesgoSanitario || null,
        usRiskLevel: usRisk?.level || null,
        gpi: gpi ?? null,
        gti: gti ?? null,
        hdi: hdi ?? null,
        alertCount: incidents.length,
        alertHigh: incidents.filter((i: any) => i.severity === 'high').length,
      };
    })
  );

  const riskMap: Record<string, NonNullable<typeof tripRiskData[number]>> = {};
  tripRiskData.forEach(r => { if (r) riskMap[r.tripId] = r; });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Itinerarios destacados</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Rutas generadas con IA para inspirar tu próximo viaje. Cada itinerario incluye perfil de viajero, tipo de viaje, radio máximo y análisis de riesgo completo.
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
            {trips.map((trip) => {
              const risk = riskMap[trip.id];
              const nivel = risk?.nivelRiesgo;
              const rc = nivel ? (riesgoColors[nivel] || riesgoColors['medio']) : null;

              return (
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

                    {risk && (
                      <div className={`rounded-xl border mb-3 overflow-hidden ${rc ? `${rc.bg} ${rc.border}` : 'bg-slate-700/30 border-slate-600/30'}`}>
                        <div className={`px-3 py-2.5 border-b ${rc ? rc.border : 'border-slate-600/30'}`}>
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${rc ? rc.text : 'text-slate-400'}`} />
                            <span className={`text-sm font-bold ${rc ? rc.text : 'text-slate-400'}`}>
                              {nivel ? nivel.replace('-', ' ').toUpperCase() : 'SIN DATOS'}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${rc ? rc.dot : 'bg-slate-500'}`} />
                          </div>
                        </div>

                        <div className="px-3 py-2.5 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-blue-400" />
                            <span className="text-slate-400">US:</span>
                            <span className={risk.usRiskLevel ? usRiskColors[(risk.usRiskLevel || 1) - 1] : 'text-slate-600'}>
                              {risk.usRiskLevel ? `Nivel ${risk.usRiskLevel}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Thermometer className="w-3 h-3 text-red-400" />
                            <span className="text-slate-400">Sanitario:</span>
                            <span className={
                              risk.riesgoSanitario === 'alto' ? 'text-red-400' :
                              risk.riesgoSanitario === 'medio' ? 'text-yellow-400' : 'text-green-400'
                            }>
                              {risk.riesgoSanitario || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-teal-400" />
                            <span className="text-slate-400">GPI:</span>
                            <span className="text-white">{risk.gpi ?? '—'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-amber-400" />
                            <span className="text-slate-400">GTI:</span>
                            <span className="text-white">{risk.gti ?? '—'}</span>
                          </div>
                        </div>

                        {risk.alertCount > 0 && (
                          <div className={`px-3 py-2 border-t ${rc ? rc.border : 'border-slate-600/30'} bg-red-500/5`}>
                            <div className="flex items-center gap-1.5">
                              <Bell className="w-3 h-3 text-red-400" />
                              <span className="text-red-300 text-xs font-medium">
                                {risk.alertCount} alerta{risk.alertCount > 1 ? 's' : ''} activa{risk.alertCount > 1 ? 's' : ''}
                                {risk.alertHigh > 0 && ` (${risk.alertHigh} crítica${risk.alertHigh > 1 ? 's' : ''})`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
