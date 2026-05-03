import { Metadata } from 'next';
import RadiusExplorer from './RadiusExplorer';

export const metadata: Metadata = {
  title: 'Radio Inteligente | Viaje con Inteligencia',
  description: 'Descubre destinos increíbles en un radio de kilómetros desde tu ubicación o cualquier ciudad del mundo.',
};

export default function RadiusPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🎯 Radio Inteligente</h1>
              <p className="text-slate-400 text-sm">
                Descubre destinos cerca de ti
              </p>
            </div>
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Volver
            </a>
          </div>
        </div>
      </div>
      <RadiusExplorer />
    </div>
  );
}
