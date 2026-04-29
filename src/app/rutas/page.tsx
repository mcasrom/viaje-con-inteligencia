'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight } from 'lucide-react';

const ALL_ROUTES = [
  { id: 'molinos', title: 'Ruta de los Molinos', region: 'La Mancha', color: 'amber', days: '4-5', km: '450', desc: 'Don Quijote vio gigantes. Molinos monumentales.', image: 'https://images.unsplash.com/photo-1564053489984-317fa0d8bc2e?w=800&q=80' },
  { id: 'faros', title: 'Ruta de los Faros', region: 'Costa España', color: 'cyan', days: '5-7', km: '2100', desc: 'De Huelva a Gerona. Los faros más emblemáticos.', image: 'https://images.unsplash.com/photo-1507003098321-0bfab38fda89?w=800&q=80' },
  { id: 'murcia', title: 'Ruta de Murcia', region: 'Murcia', color: 'emerald', days: '3-4', km: '280', desc: 'Caravaca, Calasparra, Moratalla. Pueblos monumentales.', image: 'https://images.unsplash.com/photo-1539037116267-5dd7691cee47?w=800&q=80' },
  { id: 'rioja', title: 'Ruta del Vino', region: 'La Rioja', color: 'red', days: '3-4', km: '200', desc: 'Bodegas centenarias, viñedos y gastronomía.', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
  { id: 'pirineos', title: 'Ruta de Nieve', region: 'Pirineos', color: 'blue', days: '5-7', km: '350', desc: 'Estaciones de esquí y montañas.', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402e?w=800&q=80' },
  { id: 'costa', title: 'Best Beaches', region: 'Costa del Sol', color: 'yellow', days: '4-5', km: '300', desc: 'Las mejores playas de Málaga y Granada.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { id: 'norte', title: 'Gran Ruta Verde', region: 'España Verde', color: 'green', days: '7-10', km: '800', desc: 'Asturias, Cantabria y País Vasco.', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e01e?w=800&q=80' },
  { id: 'patrimonio', title: 'Ciudades Patrimonio', region: 'Centro España', color: 'purple', days: '5-6', km: '600', desc: 'Toledo, Ávila, Salamanca. Ciudades patrimonio.', image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80' },
];

const COLOR_MAP: Record<string, string> = {
  amber: 'from-amber-600 to-orange-700', cyan: 'from-cyan-600 to-blue-700', emerald: 'from-emerald-600 to-teal-700',
  red: 'from-red-600 to-rose-700', blue: 'from-blue-600 to-indigo-700', yellow: 'from-yellow-500 to-orange-600',
  green: 'from-green-600 to-emerald-700', purple: 'from-purple-600 to-violet-700',
};

const TEXT_COLORS: Record<string, string> = {
  amber: 'text-amber-300', cyan: 'text-cyan-300', emerald: 'text-emerald-300',
  red: 'text-red-300', blue: 'text-blue-300', yellow: 'text-yellow-300',
  green: 'text-green-300', purple: 'text-purple-300',
};

function getRandomRoutes(count: number) {
  const shuffled = [...ALL_ROUTES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function RutasPage() {
  const [displayRoutes, setDisplayRoutes] = useState(ALL_ROUTES.slice(0, 3));
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setDisplayRoutes(showAll ? ALL_ROUTES : getRandomRoutes(3));
  }, [showAll]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🛣️ Rutas Temáticas de España</h1>
          <p className="text-lg text-slate-300">Itinerarios diseñados para descubrir España de otra manera.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayRoutes.map((route) => (
            <Link key={route.id} href={`/rutas?route=${route.id}&days=${route.days.split('-')[0]}`}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${COLOR_MAP[route.color]} h-72 cursor-pointer hover:scale-[1.02] transition-transform`}>
                {route.image && (
                  <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${route.image})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className={`flex items-center gap-2 mb-2 ${TEXT_COLORS[route.color]}`}>
                    <span className="text-sm font-medium">{route.region}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{route.title}</h3>
                  <p className="text-slate-200 text-sm mb-2">{route.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{route.km} km</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{route.days} días</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          {!showAll ? (
            <button onClick={() => setShowAll(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-lg font-medium cursor-pointer">
              Ver todas las rutas<ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <Link href="/rutas" onClick={() => { setShowAll(false); setDisplayRoutes(getRandomRoutes(3)); }} className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-lg font-medium cursor-pointer">
              🔄 Ver otras rutas<ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}