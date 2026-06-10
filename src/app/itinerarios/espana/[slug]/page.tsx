import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shield, MapPin, Clock, Euro, ChevronLeft, AlertTriangle } from 'lucide-react';
import { RUTAS, presupuestoLabel, presupuestoColor, riesgoColor } from '../data';

export async function generateStaticParams() {
  return RUTAS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ruta = RUTAS.find((r) => r.slug === slug);
  if (!ruta) return {};
  return {
    title: `${ruta.titulo} | Itinerarios España — Viaje con Inteligencia`,
    description: ruta.descripcion,
    alternates: { canonical: `https://www.viajeinteligencia.com/itinerarios/espana/${slug}` },
  };
}

export default async function RutaDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ruta = RUTAS.find((r) => r.slug === slug);
  if (!ruta) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Back */}
        <Link href="/itinerarios/espana" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Todos los itinerarios
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {ruta.tags.map(t => (
              <span key={t} className="text-xs bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-slate-400">{t}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{ruta.titulo}</h1>
          <p className="text-slate-400 text-lg">{ruta.descripcion}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-8">
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" /> {ruta.dias} días
          </span>
          <span className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border ${presupuestoColor[ruta.presupuesto]}`}>
            <Euro className="w-4 h-4" /> {presupuestoLabel[ruta.presupuesto]}
          </span>
          <span className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border ${riesgoColor[ruta.riesgo]}`}>
            <Shield className="w-4 h-4" /> Riesgo {ruta.riesgo}
          </span>
        </div>

        {/* Zonas */}
        <div className="flex flex-wrap gap-2 mb-10">
          {ruta.zonas.map(z => (
            <span key={z} className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-slate-400">
              <MapPin className="w-3 h-3" /> {z}
            </span>
          ))}
        </div>

        {/* Seguridad */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-10 flex gap-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Análisis de seguridad</p>
            <p className="text-sm text-slate-400">{ruta.riesgoNota}</p>
          </div>
        </div>

        {/* Itinerario */}
        <h2 className="text-xl font-bold text-white mb-6">Itinerario día a día</h2>
        <div className="space-y-4 mb-12">
          {ruta.itinerario.map((item) => (
            <div key={item.dia} className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                {item.dia}
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{item.titulo}</p>
                <p className="text-sm text-slate-400">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Premium */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Análisis completo de seguridad</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            Alertas AEMET en tiempo real, incidentes OSINT por zona, perfil de riesgo detallado y recomendaciones personalizadas.
          </p>
          <Link href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30">
            Probar gratis 7 días →
          </Link>
        </div>

      </div>
    </div>
  );
}
