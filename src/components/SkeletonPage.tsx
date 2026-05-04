import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

interface SkeletonPageProps {
  title: string;
  description?: string;
  backHref?: string;
  badge?: string;
}

export default function SkeletonPage({ title, description, backHref = '/', badge }: SkeletonPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-6 left-6">
        <Link href={backHref} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </Link>
      </div>

      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
        <Construction className="w-10 h-10 text-blue-500" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {badge && (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-500/30">
            {badge}
          </span>
        )}
      </div>

      <p className="text-slate-400 max-w-md mb-8">
        {description || 'Esta página está siendo refactorizada en la versión 2.1. Volverá pronto con mejoras.'}
      </p>

      <div className="flex gap-4">
        <Link 
          href="/premium"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          Ver Premium
        </Link>
        <Link 
          href="/rutas"
          className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
        >
          Explorar Rutas
        </Link>
      </div>

      <div className="absolute bottom-6 right-6 text-xs text-slate-600">
        v2.1-refactor
      </div>
    </div>
  );
}
