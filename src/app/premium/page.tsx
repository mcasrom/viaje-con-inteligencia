import Link from 'next/link';
import { ArrowLeft, Bot, Bell, FileCheck, Map, TrendingUp, Star, Check, Zap, Shield } from 'lucide-react';

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold mb-6">
            <Star className="w-5 h-5" />
            <span>Premium</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Viaja más inteligente con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Premium</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Desbloquea todo el potencial de Viaje con Inteligencia con características exclusivas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Gratis</h2>
              <p className="text-4xl font-bold text-white">0€</p>
              <p className="text-slate-400">Para siempre</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-green-500" />
                Mapa de riesgos 28 países
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-green-500" />
                Información embajadas
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-green-500" />
                Consejos generales
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-green-500" />
                Checklist básico
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <span className="w-5 h-5 flex items-center justify-center">✗</span>
                Bot Telegram IA
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <span className="w-5 h-5 flex items-center justify-center">✗</span>
                Alertas tiempo real
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <span className="w-5 h-5 flex items-center justify-center">✗</span>
                Itinerario inteligente
              </li>
            </ul>
            <button className="w-full mt-6 py-3 border-2 border-slate-600 text-slate-400 rounded-lg font-medium cursor-not-allowed">
              Plan actual
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 border-2 border-blue-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
              Popular
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Premium</h2>
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-bold text-white">4.99€</p>
                <span className="text-slate-300">/mes</span>
              </div>
              <p className="text-slate-300">o 49.99€ lifetime</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white">
                <Check className="w-5 h-5 text-green-400" />
                Todo lo del plan Gratis
              </li>
              <li className="flex items-center gap-3 text-white">
                <Bot className="w-5 h-5 text-blue-400" />
                Bot Telegram con IA
              </li>
              <li className="flex items-center gap-3 text-white">
                <Bell className="w-5 h-5 text-yellow-400" />
                Alertas riesgos en tiempo real
              </li>
              <li className="flex items-center gap-3 text-white">
                <FileCheck className="w-5 h-5 text-green-400" />
                Checklist completo imprimible
              </li>
              <li className="flex items-center gap-3 text-white">
                <Map className="w-5 h-5 text-purple-400" />
                Itinerario inteligente IA
              </li>
              <li className="flex items-center gap-3 text-white">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Análisis predicción gastos
              </li>
              <li className="flex items-center gap-3 text-white">
                <Shield className="w-5 h-5 text-cyan-400" />
                Análisis profundo país
              </li>
            </ul>
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all">
              Suscribirse ahora
            </button>
            <p className="text-center text-slate-400 text-sm mt-4">
              Sin compromiso • Cancela cuando quieras
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">💡 Características Premium</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-700/50 rounded-xl p-6">
              <Bot className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Bot IA @AlertasViajero</h3>
              <p className="text-slate-400 text-sm">
                Chatbot inteligente en Telegram. Pregunta lo que necesites y obtén respuestas personalizadas sobre cualquier país.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-6">
              <Bell className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Alertas en Tiempo Real</h3>
              <p className="text-slate-400 text-sm">
                Recibe notificaciones cuando el MAEC actualice niveles de riesgo o emita alertas de viaje.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-6">
              <Map className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Itinerario Inteligente</h3>
              <p className="text-slate-400 text-sm">
                IA genera rutas optimizadas según tus preferencias, tiempo y presupuesto disponible.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Análisis de Gastos</h3>
              <p className="text-slate-400 text-sm">
                Predice costes de tu viaje: alojamiento, comida, transporte y actividades por destino.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-6">
              <FileCheck className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Checklist Completo</h3>
              <p className="text-slate-400 text-sm">
                +80 items organizados por categoría, imprimible y con seguimiento de progreso.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-xl p-6">
              <Zap className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Acceso Prioritario</h3>
              <p className="text-slate-400 text-sm">
                Nuevos países y funciones disponibles antes que nadie.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            🚀 ¿Listo para viajar más inteligente?
          </h2>
          <p className="text-white/80 mb-6">
            Únete a miles de viajeros que ya disfrutan de viajes más seguros y organizados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 transition-colors">
              Suscribirme - 4.99€/mes
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
              49.99€ - Lifetime
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-white mb-4">📱 Únete a nuestro Bot</h3>
          <p className="text-slate-400 mb-4">
            Prueba gratis el bot de Telegram y descubre cómo puede ayudarte
          </p>
          <a
            href="https://t.me/AlertasViajeroBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Abrir @AlertasViajeroBot
          </a>
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} <a href="mailto:mybloggingnotes@gmail.com" className="text-slate-400 hover:text-blue-400">M.Castillo</a> - 
            Información basada en datos oficiales del MAEC español
          </p>
        </div>
      </footer>
    </div>
  );
}
