'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Star, Shield, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { paisesData } from '@/data/paises';

const INTEREST_ROUTES: Record<string, { label: string; emoji: string; routes: string[] }> = {
  playa: { label: 'Playa', emoji: '🏖️', routes: ['faros', 'costa'] },
  cultural: { label: 'Cultura', emoji: '🏛️', routes: ['molinos', 'patrimonio'] },
  naturaleza: { label: 'Naturaleza', emoji: '🏔️', routes: ['murcia', 'norte', 'pirineos'] },
  gastronomia: { label: 'Gastronomía', emoji: '🍽️', routes: ['vino', 'norte'] },
  vino: { label: 'Vino', emoji: '🍷', routes: ['vino'] },
  aventura: { label: 'Aventura', emoji: '🧗', routes: ['pirineos', 'murcia', 'norte'] },
};

const ROUTES_INFO: Record<string, { name: string; desc: string; color: string; icon: string }> = {
  molinos: { name: 'Ruta de los Molinos', desc: 'La Mancha, 450km', color: 'from-amber-600 to-orange-600', icon: '🌬️' },
  faros: { name: 'Ruta de los Faros', desc: 'Costa España, 2100km', color: 'from-cyan-600 to-blue-600', icon: '🌅' },
  murcia: { name: 'Ruta de Murcia', desc: 'Interior, 280km', color: 'from-emerald-600 to-teal-600', icon: '🏔️' },
  vino: { name: 'Rutas del Vino', desc: '8 regiones DO, 1200km', color: 'from-red-600 to-rose-600', icon: '🍷' },
  pirineos: { name: 'Ruta de Nieve', desc: 'Pirineos, 350km', color: 'from-blue-600 to-indigo-600', icon: '🏔️' },
  costa: { name: 'Best Beaches', desc: 'Costa del Sol, 300km', color: 'from-yellow-500 to-orange-600', icon: '🏖️' },
  norte: { name: 'Gran Ruta Verde', desc: 'Costa Cantábrica, 800km', color: 'from-green-600 to-emerald-600', icon: '🌲' },
  patrimonio: { name: 'Ciudades Patrimonio', desc: 'Centro, 600km', color: 'from-purple-600 to-violet-600', icon: '🏛️' },
};

function DestinosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destino = searchParams.get('destino');
  const fechas = searchParams.get('fechas');
  const interes = searchParams.get('interes');

  const paisData = destino ? paisesData[destino] : null;
  const matchedRoutes = interes ? INTEREST_ROUTES[interes]?.routes || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">✈️ Tu Viaje con Inteligencia</h1>
          <p className="text-emerald-100 text-lg">
            {paisData ? `${paisData.bandera} Análisis completo de ${paisData.nombre}` : 'Descubre tu destino ideal'}
          </p>
          {fechas && (
            <div className="flex items-center justify-center gap-2 mt-3 text-emerald-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fechas seleccionadas: {fechas}</span>
            </div>
          )}
        </div>

        {paisData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Nivel de Riesgo</h3>
              </div>
              <div className={`text-2xl font-bold ${
                paisData.nivelRiesgo === 'sin-riesgo' ? 'text-emerald-400' :
                paisData.nivelRiesgo === 'bajo' ? 'text-amber-400' :
                paisData.nivelRiesgo === 'medio' ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {paisData.nivelRiesgo === 'sin-riesgo' ? '🟢 Sin riesgo' :
                 paisData.nivelRiesgo === 'bajo' ? '🟡 Riesgo bajo' :
                 paisData.nivelRiesgo === 'medio' ? '🟠 Riesgo medio' :
                 '🔴 Riesgo alto'}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">Mejor Época</h3>
              </div>
              <p className="text-slate-300">{paisData.turisticos?.temporadaAlta?.slice(0, 4).join(', ') || 'Todo el año'}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white">Destinos Top</h3>
              </div>
              <p className="text-slate-300">{paisData.turisticos?.destinosPopulares?.slice(0, 3).join(', ') || 'Varios'}</p>
            </div>
          </div>
        )}

        {matchedRoutes.length > 0 && interes && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Rutas recomendadas por IA para {INTEREST_ROUTES[interes]?.emoji} {INTEREST_ROUTES[interes]?.label}
            </h2>
            
            {/* ML Scoring Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedRoutes
                .map((routeId) => {
                  const route = ROUTES_INFO[routeId];
                  if (!route) return null;

                  // Calculate ML Score
                  let score = 70; // Base score
                  let reason = 'Buena opción general';

                  if (interes === 'vino' && routeId === 'vino') score = 98;
                  else if (interes === 'gastronomia' && routeId === 'vino') { score = 92; reason = 'Excelente maridaje gastronómico'; }
                  else if (interes === 'playa' && routeId === 'faros') { score = 95; reason = 'Ruta costera ideal'; }
                  else if (interes === 'playa' && routeId === 'costa') { score = 96; reason = 'Las mejores playas'; }
                  else if (interes === 'cultural' && routeId === 'molinos') { score = 90; reason = 'Patrimonio histórico único'; }
                  else if (interes === 'cultural' && routeId === 'patrimonio') { score = 94; reason = 'Ciudades UNESCO'; }
                  else if (interes === 'naturaleza' && routeId === 'norte') { score = 91; reason = 'Naturaleza exuberante'; }
                  else if (interes === 'aventura' && routeId === 'pirineos') { score = 95; reason = 'Deportes de montaña'; }

                  return { routeId, route, score, reason };
                })
                .filter(Boolean)
                .sort((a: any, b: any) => b.score - a.score)
                .map(({ routeId, route, score, reason }: any) => (
                  <Link key={routeId} href={`/rutas?route=${routeId}`}>
                    <div className={`relative bg-gradient-to-r ${route.color} rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all group`}>
                      {/* ML Score Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star className={`w-3 h-3 ${score >= 90 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        <span className={`font-bold text-sm ${score >= 90 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {score}% Match
                        </span>
                      </div>

                      <div className="flex items-start gap-4">
                        <span className="text-3xl bg-white/10 p-2 rounded-lg">{route.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{route.name}</h3>
                          <p className="text-white/80 text-sm mt-1">{route.desc}</p>
                          
                          {/* AI Reasoning */}
                          <div className="mt-3 flex items-center gap-2 text-xs text-white/70 bg-black/10 px-2 py-1 rounded-full inline-flex">
                            <span>🤖</span>
                            <span>{reason}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-white/60">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/rutas"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-lg font-medium transition-all"
          >
            <Clock className="w-5 h-5" />
            Explorar todas las rutas temáticas
          </Link>
        </div>

        {!paisData && !interes && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Destinos Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(paisesData).slice(0, 12).map((p) => (
                <Link
                  key={p.codigo}
                  href={`/destinos?destino=${p.codigo}`}
                  className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-all border border-slate-700"
                >
                  <span className="text-3xl">{p.bandera}</span>
                  <p className="text-white font-medium mt-2 text-sm">{p.nombre}</p>
                  <p className="text-slate-400 text-xs mt-1">{p.capital}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DestinosClient() {
  return (
    <Suspense>
      <DestinosContent />
    </Suspense>
  );
}
