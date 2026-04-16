import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';

export default function ArticuloPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al blog</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              Destinos
            </span>
            <h1 className="text-4xl font-bold text-white mt-6 mb-4">
              Guía completa para viajar seguro a Japón
            </h1>
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                15 de Abril, 2026
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                8 min de lectura
              </span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-8">
            <p className="text-xl text-slate-300 mb-6 leading-relaxed">
              Japón es uno de los destinos más seguros del mundo para viajar. Con esta guía aprenderás 
              todo lo necesario para disfrutar de tu viaje sin preocupaciones.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">🇯🇵 ¿Por qué Japón es seguro?</h2>
            <p className="text-slate-300 mb-4">
              Japón posee una de las tasas de criminalidad más bajas del mundo. Los habitantes son conocidos 
              por su hospitalidad y respeto hacia los visitantes. Es común que dejéis objetos de valor en 
              una mesa de cafetería y estos permanezcan ahí cuando volváis.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">⚠️ Precauciones a tomar</h2>
            <ul className="space-y-3 text-slate-300 mb-4">
              <li>🚇 <strong>Transporte público:</strong> Tened cuidado con las aglomeraciones en horas punta en Tokio.</li>
              <li>🌊 <strong>Tsunamis:</strong> Conoced las rutas de evacuación de vuestra zona.</li>
              <li>🔥 <strong>Terremotos:</strong> Son frecuentes pero generalmente de baja intensidad.</li>
              <li>🗣️ <strong>Idioma:</strong> En zonas turísticas encontraréis inglés, pero es útil aprender frases básicas.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">📋 Checklist MAEC</h2>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <ul className="space-y-2 text-slate-300">
                <li>✅ Pasaporte con validez mínima de 6 meses</li>
                <li>✅ Visado si permaneéis más de 90 días</li>
                <li>✅ Seguro de viaje con cobertura médica</li>
                <li>✅ Registro en el programa de españoles en el exterior</li>
                <li>✅ Descargar app de emergencia del MAEC</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">🆘 Teléfonos de emergencia</h2>
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
              <p className="text-red-300 font-medium">Emergencias generales: 110</p>
              <p className="text-red-300 font-medium">Emergencias médicas: 119</p>
              <p className="text-slate-400 text-sm mt-2">
                Embajada de España en Tokio: +81 3 3580 1871
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← Volver al blog
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </article>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia
          </p>
        </div>
      </footer>
    </div>
  );
}
