import Link from 'next/link';
import { Gift, Users, TrendingUp, DollarSign, Star, CheckCircle, ArrowRight, Shield, Zap, Heart } from 'lucide-react';

export const metadata = {
  title: 'Programa de Afiliados - Viaje con Inteligencia',
  description: 'Gana comisiones recomendando Viaje con Inteligencia. 20% de comisión recurrente en suscripciones Premium.',
};

export default function AfiliadosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-purple-400 text-sm">Programa de Afiliados</p>
              </div>
            </Link>
            <Link href="/premium" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors">
              Premium
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium mb-4">
            💰 Programa de Afiliados
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gana dinero recommending viajes seguros
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Únete a nuestro programa y gana <span className="text-yellow-400 font-bold">20% de comisión</span> en todas las suscripciones que recomiendes. Para siempre.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">20% Comusión Recurrente</h3>
            <p className="text-slate-400">
              Gana el 20% de cada suscripción Premium que recomiendes. Si el usuario renueva, tú sigues ganando.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">+1,000 Creadores</h3>
            <p className="text-slate-400">
              Blogueros de viaje, agencias, y creadores de contenido ya están ganando con nuestro programa.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tracking Detallado</h3>
            <p className="text-slate-400">
              Dashboard en tiempo real con clics, conversiones y comisiones. Pagos mensuales garantizados.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-8 mb-12 border border-slate-700">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4">¿Cómo funciona?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-white font-semibold">Regístrate gratis</h3>
                    <p className="text-slate-400 text-sm">Completa el formulario y accede a tu panel de afiliado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-white font-semibold">Genera tu link único</h3>
                    <p className="text-slate-400 text-sm">Recibe un enlace de afiliado personalizado para compartir.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-white font-semibold">Comparte con tu audiencia</h3>
                    <p className="text-slate-400 text-sm">Inclúyelo en tu blog, redes sociales, newsletter o web.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="text-white font-semibold">¡Gana comisiones!</h3>
                    <p className="text-slate-400 text-sm">Recibe pagos mensuales por cada usuario que se suscriba.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Ejemplo de ingresos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Usuarios referidos/mes</span>
                  <span className="text-white font-medium">10</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Tasa conversión</span>
                  <span className="text-green-400 font-medium">5%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Suscriptores nuevos</span>
                  <span className="text-white font-medium">0.5</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Comisión 20%</span>
                  <span className="text-yellow-400 font-medium">0.99€/mes</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-yellow-500/10 rounded-lg px-3">
                  <span className="text-white font-bold">Ingreso mensual</span>
                  <span className="text-yellow-400 font-bold text-xl">≈1€/mes</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300 font-semibold">Ingreso anual</span>
                  <span className="text-yellow-400 font-bold text-2xl">≈12€/año</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs text-center mt-4">
                * Estimación basada en promedio del sector. Los resultados reales pueden variar.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              Ventajas para ti
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Registro gratuito
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Sin compromiso de mínimo de ventas
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Cookies de 90 días (más tiempo para convertir)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Pagos mediante PayPal o transferencia
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Soporte dedicado para afiliados
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Materiales promocionales listos para usar
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-400" />
              ¿Qué ofreces a tus seguidores?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Herramienta única de análisis de viajes
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Datos oficiales MAEC actualizados
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Chat IA para planificación de viajes
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Alertas personalizadas de riesgo
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Itinerarios generados por IA
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Star className="w-5 h-5 text-yellow-400" />
                Contenido original y actualizado
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Completa el formulario y recibirás tu link de afiliado en menos de 24 horas. Sin trámites complicados.
          </p>
          <Link
            href="mailto:afiliados@viajeinteligencia.com?subject=Solicitud%20Programa%20Afiliados"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-xl"
          >
            <Zap className="w-5 h-5" />
            Solicitar ser Afiliado
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-yellow-400">20%</p>
              <p className="text-slate-400 text-sm">Comisión</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">90</p>
              <p className="text-slate-400 text-sm">Días cookie</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">PayPal</p>
              <p className="text-slate-400 text-sm">Pagos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">24h</p>
              <p className="text-slate-400 text-sm">Activación</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4" />
            ¿Ya eres afiliado? Accede a tu dashboard
          </p>
          <Link href="/premium" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mt-2">
            Panel de Afiliado <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}