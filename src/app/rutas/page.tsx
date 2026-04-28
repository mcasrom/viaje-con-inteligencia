import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import RouteDetail from '@/components/RouteDetail';

interface PageProps {
  searchParams: Promise<{ route?: string; days?: string; all?: string }>;
}

const ALL_ROUTES = [
  { id: 'molinos', title: 'Ruta de los Molinos', region: 'La Mancha', color: 'amber', days: '4-5', km: '450', difficulty: 'Fácil', desc: 'Don Quijote vio gigantes. Molinos monumentales, gastronomía manchega e historia.', icon: 'wind' },
  { id: 'faros', title: 'Ruta de los Faros', region: 'Costa España', color: 'cyan', days: '5-7', km: '2100', difficulty: 'Moderado', desc: 'De Huelva a Gerona. Los faros más emblemáticos de la costa española.', icon: 'lighthouse' },
  { id: 'murcia', title: 'Ruta de Murcia', region: 'Región de Murcia', color: 'emerald', days: '3-4', km: '280', difficulty: 'Fácil', desc: 'Caravaca, Calasparra, Moratalla. Pueblos monumentales y naturaleza.', icon: 'mountain' },
  { id: 'rioja', title: 'Ruta del Vino', region: 'La Rioja', color: 'red', days: '3-4', km: '200', difficulty: 'Fácil', desc: 'Bodegas centenarias, viñedos y gastronomía riojana.', icon: 'wine' },
  { id: 'pirineos', title: 'Ruta de Nieve', region: 'Pirineos', color: 'blue', days: '5-7', km: '350', difficulty: 'Alto', desc: 'Estaciones de esquí, pueblos medievales y montaña.', icon: 'snow' },
  { id: 'costa', title: 'Best Beaches', region: 'Costa del Sol', color: 'yellow', days: '4-5', km: '300', difficulty: 'Fácil', desc: 'Las mejores playas de Málaga y Granada.', icon: 'beach' },
  { id: 'norte', title: 'Gran Ruta Verde', region: 'España Verde', color: 'green', days: '7-10', km: '800', difficulty: 'Moderado', desc: 'Costa cantábrica: Asturias, Cantabria y País Vasco.', icon: 'forest' },
  { id: 'patrimonio', title: 'Ciudades Patrimonio', region: 'Centro España', color: 'purple', days: '5-6', km: '600', difficulty: 'Fácil', desc: 'Toledo, Ávila, Salamanca. Cities patrimonio de la humanidad.', icon: 'building' },
];

const COLOR_MAP: Record<string, string> = {
  amber: 'from-amber-600 to-orange-700', cyan: 'from-cyan-600 to-blue-700', emerald: 'from-emerald-600 to-teal-700',
  red: 'from-red-600 to-rose-700', blue: 'from-blue-600 to-indigo-700', yellow: 'from-yellow-500 to-orange-600',
  green: 'from-green-600 to-emerald-700', purple: 'from-purple-600 to-violet-700',
};

function getRotatedRoutes() {
  const shuffled = [...ALL_ROUTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export async function generateStaticParams() {
  return ALL_ROUTES.map(r => ({ route: r.id }));
}

function getRotatedRoutes() {
  return ALL_ROUTES.slice(0, 3);
}

export default async function RutasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const routeId = params.route;
  const days = parseInt(params.days || '4');
  const allRoutes = routeId === 'all' ? ALL_ROUTES : getRotatedRoutes();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {!routeId ? (
          <>
            {/* Page Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                🛣️ Rutas Temáticas de España
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Itinerarios diseñados para descubrir España de otra manera. 
                Molinos legendarios, faros costeros y secretos del interior.
              </p>
            </div>

            {/* Route Cards - 3 rotatorias */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {allRoutes.map((route, idx) => (
                <RouteCard key={`${route.id}-${idx}`} route={route} delay={idx * 0.1} />
              ))}
            </motion.div>

            {/* Button Ver todas las rutas */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 text-center"
            >
              <Link 
                href="/rutas?all=true" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-lg font-medium transition-all hover:scale-105"
              >
                Ver todas las rutas
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 h-96">
                  <div className="absolute inset-0 bg-[url('/images/rutas/molinos-la-mancha.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                      <Wind className="w-5 h-5" />
                      <span className="text-sm font-medium">La Mancha</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ruta de los Molinos</h3>
                    <p className="text-slate-200 text-sm mb-4">
                      Don Quijote vio gigantes. Molinos monumentales, gastronomía manchega e historia.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 450 km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4-5 días</span>
                      <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> Fácil</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Faros */}
              <Link href="/rutas?route=faros&days=5" className="group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 h-96">
                  <div className="absolute inset-0 bg-[url('/images/rutas/faros-espana.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-cyan-300 mb-2">
                      <Lighthouse className="w-5 h-5" />
                      <span className="text-sm font-medium">Costa España</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ruta de los Faros</h3>
                    <p className="text-slate-200 text-sm mb-4">
                      De Huelva a Gerona. Los faros más emblemáticos de la costa española.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 2.100 km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5-7 días</span>
                      <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> Moderado</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Murcia */}
              <Link href="/rutas?route=murcia&days=3" className="group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 h-96">
                  <div className="absolute inset-0 bg-[url('/images/rutas/murcia-interior.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 text-emerald-300 mb-2">
                      <Mountain className="w-5 h-5" />
                      <span className="text-sm font-medium">Región de Murcia</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ruta de Murcia</h3>
                    <p className="text-slate-200 text-sm mb-4">
                      Caravaca, Calasparra, Moratalla. Pueblos monumentales y naturaleza.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 280 km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3-4 días</span>
                      <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> Fácil</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Coming Soon */}
            <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="text-yellow-400" />
                Próximamente más rutas
              </h3>
              <div className="flex flex-wrap gap-3">
                {['🏔️ Rutas de Nieve (PirINEOS)', '🏖️ Best Beaches (Costa del Sol)', '🍷 Rutas del Vino (Rioja, Ribera)', '🏛️ Ciudades Patrimonio', '🥾 Gran Ruta Verde (Norte)'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Suspense fallback={<div className="text-white">Cargando...</div>}>
            <RouteDetail routeId={routeId as any} days={days} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function Wind({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" /></svg>;
}

function Lighthouse({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
}

function Mountain({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18l4.286-6.857L12 4l3.714 7.143L20 18M4 14h16" /></svg>;
}