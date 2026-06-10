import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, MapPin, Clock, Euro, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Itinerarios por España con Análisis de Seguridad | Viaje con Inteligencia',
  description: 'Rutas por España con datos de seguridad en tiempo real, alertas meteorológicas y perfil de riesgo por zona. Planifica tu viaje inteligente por España.',
  alternates: { canonical: 'https://www.viajeinteligencia.com/itinerarios/espana' },
  openGraph: {
    title: 'Itinerarios España con Seguridad | Viaje con Inteligencia',
    description: 'Rutas inteligentes por España con análisis de riesgo, alertas AEMET y recomendaciones OSINT.',
    url: 'https://www.viajeinteligencia.com/itinerarios/espana',
  },
};

const RUTAS = [
  {
    slug: 'camino-de-santiago',
    titulo: 'Camino de Santiago Francés',
    descripcion: 'La ruta jacobea más popular del mundo: 780 km desde Saint-Jean-Pied-de-Port hasta Santiago de Compostela atravesando Navarra, La Rioja, Castilla y León y Galicia.',
    dias: 30,
    presupuesto: 'bajo',
    zonas: ['Navarra', 'La Rioja', 'Castilla y León', 'Galicia'],
    perfil: 'aventurero',
    tags: ['senderismo', 'cultura', 'naturaleza'],
  },
  {
    slug: 'ruta-del-quijote',
    titulo: 'Ruta del Quijote — La Mancha',
    descripcion: 'Por los paisajes de Cervantes: molinos de viento, castillos medievales y llanuras infinitas de Castilla-La Mancha.',
    dias: 7,
    presupuesto: 'bajo',
    zonas: ['Castilla-La Mancha'],
    perfil: 'cultural',
    tags: ['cultura', 'historia', 'road-trip'],
  },
  {
    slug: 'costa-brava-y-pirineos',
    titulo: 'Costa Brava y Pirineos Catalanes',
    descripcion: 'Combina calas cristalinas de la Costa Brava con pueblos medievales del Pirineo catalán. De Cadaqués a la Cerdanya.',
    dias: 10,
    presupuesto: 'medio',
    zonas: ['Girona', 'Cataluña'],
    perfil: 'familiar',
    tags: ['playa', 'montaña', 'naturaleza'],
  },
  {
    slug: 'andalucia-profunda',
    titulo: 'Andalucía Profunda',
    descripcion: 'De Sevilla a Granada pasando por Córdoba y la Alpujarra. Flamenco, arquitectura árabe y gastronomía del sur.',
    dias: 12,
    presupuesto: 'medio',
    zonas: ['Sevilla', 'Córdoba', 'Granada', 'Almería'],
    perfil: 'cultural',
    tags: ['cultura', 'gastronomía', 'historia'],
  },
  {
    slug: 'picos-de-europa',
    titulo: 'Picos de Europa y Costa Cantábrica',
    descripcion: 'El corazón verde de España: Parque Nacional de Picos de Europa, Covadonga, acantilados cántabros y sidrerías asturianas.',
    dias: 8,
    presupuesto: 'medio',
    zonas: ['Asturias', 'Cantabria', 'Castilla y León'],
    perfil: 'aventurero',
    tags: ['senderismo', 'naturaleza', 'gastronomía'],
  },
  {
    slug: 'islas-canarias-tenerife-lanzarote',
    titulo: 'Canarias: Tenerife y Lanzarote',
    descripcion: 'Volcanes activos, playas de arena negra y paisajes lunares. El Teide y los Jameos del Agua como protagonistas.',
    dias: 10,
    presupuesto: 'medio',
    zonas: ['Tenerife', 'Lanzarote'],
    perfil: 'aventurero',
    tags: ['naturaleza', 'playa', 'volcanes'],
  },
];

const presupuestoLabel: Record<string, string> = {
  bajo: '< 50€/día',
  medio: '50–100€/día',
  alto: '100€+/día',
};

const presupuestoColor: Record<string, string> = {
  bajo: 'text-green-400 bg-green-500/10 border-green-500/20',
  medio: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  alto: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function ItinerariosEspanaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" />
            Rutas con análisis de seguridad
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Itinerarios por España
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Rutas seleccionadas con datos de seguridad en tiempo real, alertas meteorológicas AEMET y análisis de riesgo por zona.
          </p>
        </div>

        {/* Grid rutas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {RUTAS.map((ruta) => (
            <Link
              key={ruta.slug}
              href={`/itinerarios/espana/${ruta.slug}`}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition-all hover:bg-slate-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                  {ruta.titulo}
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
              </div>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {ruta.descripcion}
              </p>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> {ruta.dias} días
                </span>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${presupuestoColor[ruta.presupuesto]}`}>
                  <Euro className="w-3 h-3" /> {presupuestoLabel[ruta.presupuesto]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {ruta.zonas.slice(0, 3).map(z => (
                  <span key={z} className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-slate-400">
                    <MapPin className="w-2.5 h-2.5" /> {z}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Premium */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Análisis de seguridad completo</h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Accede al perfil de riesgo detallado de cada zona, alertas AEMET en tiempo real, incidentes OSINT y recomendaciones personalizadas según tu perfil de viajero.
          </p>
          <Link href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30">
            Probar gratis 7 días →
          </Link>
        </div>

      </div>
    </div>
  );
}
