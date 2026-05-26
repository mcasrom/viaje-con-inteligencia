'use client';

import { useState } from 'react';
import { AlertTriangle, Info, ExternalLink, X } from 'lucide-react';

interface BiasDisclaimerProps {
  variant?: 'badge' | 'inline';
  country?: string;
  className?: string;
}

export default function BiasDisclaimer({ variant = 'badge', country, className = '' }: BiasDisclaimerProps) {
  const [open, setOpen] = useState(false);

  const title = country
    ? `Contexto geopolítico: ${country}`
    : '⚠️ Posible sesgo diplomático';

  const body = country
    ? `Las alertas del MAEC sobre ${country} pueden estar influenciadas por las relaciones diplomáticas bilaterales entre España y su gobierno, no exclusivamente por la seguridad objetiva sobre el terreno. Se recomienda contrastar con fuentes alternativas (US State Dept, UK Foreign Office).`
    : 'Las alertas del MAEC (Ministerio de Asuntos Exteriores de España) pueden reflejar relaciones diplomáticas bilaterales, acuerdos migratorios o comerciales, no exclusivamente la seguridad objetiva. El mapa compara múltiples fuentes para mitigar este sesgo.';

  if (variant === 'inline') {
    return (
      <div className={`bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm mb-1">{title}</p>
            <p className="text-amber-200/70 text-xs leading-relaxed">{body}</p>
            <a href="/transparencia#sesgos" className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs mt-2 underline">
              <ExternalLink className="w-3 h-3" />Más sobre sesgos potenciales
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all ${className}`}
        title="Posible sesgo diplomático en fuentes oficiales"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Sesgo
        <Info className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold text-sm">{title}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{body}</p>
            <div className="flex gap-2">
              <a href="/transparencia#sesgos"
                className="flex-1 text-center px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors">
                Centro de Transparencia
              </a>
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-xs font-medium hover:bg-slate-600 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
