import Link from 'next/link';
import AnalisisContent from '@/components/AnalisisContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Análisis de Viaje - Viaje con Inteligencia',
  description: 'Obtén recomendaciones personalizadas basadas en datos MAEC y IA para planificar tu viaje seguro.',
};

export default function AnalisisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-blue-400 text-sm">Análisis de Viaje</p>
              </div>
            </Link>
            <Link href="/premium" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors">
              Premium
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">🧠 Análisis de Viaje Inteligente</h2>
          <p className="text-slate-400">Obtén recomendaciones personalizadas basadas en datos MAEC y IA</p>
        </div>
        <AnalisisContent />
      </main>
    </div>
  );
}