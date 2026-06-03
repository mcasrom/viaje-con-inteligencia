'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getTodosLosPaises } from '@/data/paises';

const RIESGO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'sin-riesgo':     { label: 'Sin riesgo',    color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  'precaucion':     { label: 'Precaución',     color: 'text-yellow-400',  bg: 'bg-yellow-500/20 border-yellow-500/30' },
  'no-esencial':    { label: 'No esencial',    color: 'text-orange-400',  bg: 'bg-orange-500/20 border-orange-500/30' },
  'desaconsejado':  { label: 'Desaconsejado',  color: 'text-red-400',     bg: 'bg-red-500/20 border-red-500/30' },
};

export default function PaisDelDia() {
  const pais = useMemo(() => {
    const todos = getTodosLosPaises().filter(p => p.visible !== false);
    if (!todos.length) return null;
    // Seed por fecha — mismo país todo el día
    const hoy = new Date();
    const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    return todos[seed % todos.length];
  }, []);

  if (!pais) return null;

  const riesgo = RIESGO_CONFIG[pais.nivelRiesgo] || RIESGO_CONFIG['precaucion'];
  const consejo = pais.queHacer?.[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        
        {/* Bandera + nombre */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-4xl leading-none">{pais.bandera}</span>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-0.5">País del día</p>
            <h3 className="text-white font-bold text-lg leading-tight">{pais.nombre}</h3>
            <p className="text-slate-400 text-xs">{pais.capital} · {pais.continente}</p>
          </div>
        </div>

        {/* Separador */}
        <div className="hidden sm:block w-px h-12 bg-slate-700/50" />

        {/* Nivel de riesgo */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Nivel MAEC</p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riesgo.bg} ${riesgo.color}`}>
            {riesgo.label}
          </span>
        </div>

        {/* Separador */}
        <div className="hidden sm:block w-px h-12 bg-slate-700/50" />

        {/* Consejo rápido */}
        {consejo && (
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">Consejo clave</p>
            <p className="text-slate-300 text-sm line-clamp-2">{consejo}</p>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/pais/${pais.codigo}`}
          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          Ver ficha completa →
        </Link>
      </div>
    </div>
  );
}
