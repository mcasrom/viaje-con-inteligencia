import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import RouteDetail from '@/components/RouteDetail';

const ALL_ROUTES = [
  { id: 'molinos', title: 'Ruta de los Molinos', region: 'La Mancha', color: 'amber', days: '4-5', km: '450', difficulty: 'Fácil', desc: 'Don Quijote vio gigantes. Molinos monumentales, gastronomía manchega e historia.', icon: 'wind' },
  { id: 'faros', title: 'Ruta de los Faros', region: 'Costa España', color: 'cyan', days: '5-7', km: '2100', difficulty: 'Moderado', desc: 'De Huelva a Gerona. Los faros más emblemáticos de la costa española.', icon: 'lighthouse' },
  { id: 'murcia', title: 'Ruta de Murcia', region: 'Región de Murcia', color: 'emerald', days: '3-4', km: '280', difficulty: 'Fácil', desc: 'Caravaca, Calasparra, Moratalla. Pueblos monumentales y naturaleza.', icon: 'mountain' },
  { id: 'rioja', title: 'Ruta del Vino', region: 'La Rioja', color: 'red', days: '3-4', km: '200', difficulty: 'Fácil', desc: 'Bodegas centenarias, viñedos y gastronomía riojana.', icon: 'wine' },
  { id: 'pirineos', title: 'Ruta de Nieve', region: 'Pirineos', color: 'blue', days: '5-7', km: '350', difficulty: 'Alto', desc: 'Estaciones de esquí, pueblos medievales y montaña.', icon: 'snow' },
  { id: 'costa', title: 'Best Beaches', region: 'Costa del Sol', color: 'yellow', days: '4-5', km: '300', difficulty: 'Fácil', desc: 'Las mejores playas de Málaga y Granada.', icon: 'beach' },
  { id: 'norte', title: 'Gran Ruta Verde', region: 'España Verde', color: 'green', days: '7-10', km: '800', difficulty: 'Moderado', desc: 'Costa cantábrica: Asturias, Cantabria y País Vasco.', icon: 'forest' },
  { id: 'patrimonio', title: 'Ciudades Patrimonio', region: 'Centro España', color: 'purple', days: '5-6', km: '600', difficulty: 'Fácil', desc: 'Toledo, Ávila, Salamanca. Ciudades patrimonio de la humanidad.', icon: 'building' },
];

const COLOR_MAP: Record<string, string> = {
  amber: 'from-amber-600 to-orange-700', cyan: 'from-cyan-600 to-blue-700', emerald: 'from-emerald-600 to-teal-700',
  red: 'from-red-600 to-rose-700', blue: 'from-blue-600 to-indigo-700', yellow: 'from-yellow-500 to-orange-600',
  green: 'from-green-600 to-emerald-700', purple: 'from-purple-600 to-violet-700',
};

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  wind: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0 .83.67 1.5 1.5 1.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" /></svg>,
  lighthouse: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  mountain: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18l4.286-6.857L12 4l3.714 7.143L20 18M4 14h16" /></svg>,
  wine: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  snow: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H4m14.95-3.05a9 9 0 01-2.12 2.12M9 12l2.12 2.12m0-4.24l-2.12 2.12" /></svg>,
  beach: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9H3m18 0h-1M4.6 4.6l.7.7m7.4 7.4l-.7.7M4.6 19.4l.7-.7m7.4-7.4l-.7-.7" /></svg>,
  forest: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M5 9l7-7 7 7M5 15l7 7 7-7" /></svg>,
  building: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};

const TEXT_COLORS: Record<string, string> = {
  amber: 'text-amber-300', cyan: 'text-cyan-300', emerald: 'text-emerald-300',
  red: 'text-red-300', blue: 'text-blue-300', yellow: 'text-yellow-300',
  green: 'text-green-300', purple: 'text-purple-300',
};

interface PageProps {
  searchParams: Promise<{ route?: string; days?: string; all?: string }>;
}

export async function generateStaticParams() {
  return ALL_ROUTES.map(r => ({ route: r.id }));
}

export default async function RutasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const routeId = params.route;
  const days = parseInt(params.days || '4');

  const allMode = params.all === 'true';
  const displayRoutes = allMode ? ALL_ROUTES : ALL_ROUTES.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        {!routeId ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">🛣️ Rutas Temáticas de España</h1>
              <p className="text-xl text-slate-300">Itinerarios diseñados para descubrir España de otra manera.</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
              {displayRoutes.map((route, idx) => {
                const Icon = ICONS[route.icon] || ICONS.wind;
                return (
                  <Link key={route.id} href={`/rutas?route=${route.id}&days=${route.days.split('-')[0]}`}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${COLOR_MAP[route.color]} h-96`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className={`flex items-center gap-2 mb-2 ${TEXT_COLORS[route.color]}`}>
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{route.region}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{route.title}</h3>
                        <p className="text-slate-200 text-sm mb-4">{route.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-300">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{route.km} km</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{route.days} días</span>
                          <span>{route.difficulty === 'Fácil' ? '✅' : route.difficulty === 'Moderado' ? '⚠️' : '❄️'}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>

            <div className="mt-10 text-center">
              <Link href="/rutas?all=true" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-lg font-medium">
                Ver todas las rutas<ChevronRight className="w-5 h-5" />
              </Link>
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