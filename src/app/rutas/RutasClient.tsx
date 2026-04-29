'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight } from 'lucide-react';

const ALL_ROUTES = [
  { id: 'molinos', title: 'Ruta de los Molinos', region: 'La Mancha', days: '4-5', km: '450', desc: 'Molinos monumentales de La Mancha.' },
  { id: 'faros', title: 'Ruta de los Faros', region: 'Costa España', days: '5-7', km: '2100', desc: 'Los faros más emblemáticos.' },
  { id: 'murcia', title: 'Ruta de Murcia', region: 'Murcia', days: '3-4', km: '280', desc: 'Caravaca, Calasparra, Moratalla.' },
  { id: 'rioja', title: 'Ruta del Vino', region: 'La Rioja', days: '3-4', km: '200', desc: 'Bodegas y viñedos.' },
  { id: 'pirineos', title: 'Ruta de Nieve', region: 'Pirineos', days: '5-7', km: '350', desc: 'Estaciones de esquí.' },
  { id: 'costa', title: 'Best Beaches', region: 'Costa del Sol', days: '4-5', km: '300', desc: 'Las mejores playas.' },
  { id: 'norte', title: 'Gran Ruta Verde', region: 'España Verde', days: '7-10', km: '800', desc: 'Costa cantábrica.' },
  { id: 'patrimonio', title: 'Ciudades Patrimonio', region: 'Centro', days: '5-6', km: '600', desc: 'Toledo, Ávila, Salamanca.' },
];

const COLORS = ['from-amber-600 to-orange-600', 'from-cyan-600 to-blue-600', 'from-emerald-600 to-teal-600', 'from-red-600 to-rose-600', 'from-blue-600 to-indigo-600', 'from-yellow-500 to-orange-600', 'from-green-600 to-emerald-600', 'from-purple-600 to-violet-600'];

export default function RutasClient() {
  const searchParams = useSearchParams();
  const showAll = searchParams.get('all') === 'true';
  const route = searchParams.get('route');
  const allMode = showAll || route;
  
  const routes = allMode ? ALL_ROUTES : ALL_ROUTES.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🛣️ Rutas Temáticas de España</h1>
          <p className="text-lg text-slate-300">Itinerarios diseñados para descubrir España.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((r, idx) => (
            <Link key={r.id} href={`/rutas?route=${r.id}`}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${COLORS[idx]} h-64 cursor-pointer hover:scale-[1.02] transition-transform`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-sm text-white/80 mb-2">{r.region}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{r.title}</h3>
                  <p className="text-slate-200 text-sm mb-3">{r.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.km} km</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.days} días</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/rutas?all=true" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-lg font-medium">
            Ver todas las rutas<ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}