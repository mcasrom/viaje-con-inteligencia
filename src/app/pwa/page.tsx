import Link from 'next/link';
import { ArrowLeft, Smartphone, Download, Globe, CheckCircle } from 'lucide-react';

export default function PWAPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 font-medium mb-4">
            <Smartphone className="w-5 h-5" />
            <span>App Móvil - Instala Nuestra PWA</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🇺️ Viaje con Inteligencia
          </h1>
          <p className="text-slate-400 text-lg">
            Añade la app a tu pantalla de inicio para acceso rápido como una aplicación nativa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔵 En Android (Chrome)
            </h2>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0">1</span>
                <span>Abre la web en Chrome</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0">2</span>
                <span>Toca los tres puntos (arriba derecha)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0">3</span>
                <span>Selecciona &quot;Instalar app&quot; o &quot;Añadir a pantalla inicio&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0">4</span>
                <span>Confirmas y listo</span>
              </li>
            </ol>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🍎 En iOS (Safari)
            </h2>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center flex-shrink-0">1</span>
                <span>Abre la web en Safari</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center flex-shrink-0">2</span>
                <span>Toca el botón Compartir (📤)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center flex-shrink-0">3</span>
                <span>Desliza y selecciona &quot;Añadir a pantalla inicio&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center flex-shrink-0">4</span>
                <span>Toca "Añadir" y listo</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-6 border border-green-700/30 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ✅ Beneficios de la PWA
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Acceso instantáneo desde pantalla inicio</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Funciona sin conexión a internet</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No requiere App Store</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No ocupa espacio en tu dispositivo</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Notificaciones push</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Siempre actualizada</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            <Globe className="w-5 h-5" />
            <span>Ir al mapa de riesgos</span>
          </Link>
        </div>
      </main>
    </div>
  );
}