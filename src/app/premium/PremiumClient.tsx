'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, Sparkles, Shield, Bell, MessageSquare, FileCheck, TrendingUp, Map, Plane, Star, Zap, Crown, Loader2 } from 'lucide-react';
import { TOTAL_PAISES } from '@/lib/constants';

const FEATURES = [
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Chat IA de Viajes', desc: '5 mensajes/día gratis con llama-3.1-8b. Premium: ilimitado con llama-3.1-70b (9x más inteligente).' },
  { icon: <Plane className="w-5 h-5" />, title: 'Planificador IA', desc: 'Genera itinerarios personalizados por destino, días e intereses.' },
  { icon: <Bell className="w-5 h-5" />, title: 'Alertas en Tiempo Real', desc: 'Cambios de riesgo, conflictos naturales y recomendaciones MAEC.' },
  { icon: <Map className="w-5 h-5" />, title: 'Mapa de Sismos (USGS)', desc: 'Terremotos en vivo con magnitud, ubicación y alertas de tsunami.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Análisis de Riesgo', desc: 'Fichas completas por país: seguridad, costes, contactos y visados.' },
  { icon: <FileCheck className="w-5 h-5" />, title: 'Reclamaciones PDF', desc: 'Genera formularios de reclamación listos para enviar a aerolíneas.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'KPIs Globales', desc: '6 índices comparativos: paz, terrorismo, desarrollo, inflación, sismos.' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'ML Clustering', desc: 'Destinos agrupados por IA según seguridad, coste y preferencias.' },
];

const COMPARISON = [
  { feature: 'Mapa de riesgos MAEC', free: true, premium: true },
  { feature: `${TOTAL_PAISES} países con datos`, free: true, premium: true },
  { feature: 'Filtros por nivel de riesgo', free: true, premium: true },
  { feature: 'Blog OSINT', free: true, premium: true },
  { feature: 'Chat IA (5 mensajes/día)', free: true, premium: true },
  { feature: 'Chat IA ilimitado + modelo 70b', free: false, premium: true },
  { feature: 'Planificador de itinerarios IA', free: false, premium: true },
  { feature: 'Alertas en tiempo real', free: false, premium: true },
  { feature: 'Mapa de sismos USGS', free: false, premium: true },
  { feature: 'Monitor de conflictos activo', free: false, premium: true },
  { feature: 'ML Clustering de destinos', free: false, premium: true },
  { feature: 'KPIs globales comparativos', free: false, premium: true },
  { feature: 'Reclamaciones PDF', free: false, premium: true },
  { feature: 'Dashboard personalizado', free: false, premium: true },
  { feature: 'Mis Viajes + documentos', free: false, premium: true },
];

export default function PremiumClient() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const priceId = isAnnual
        ? 'price_1TQ0Ng1yXjIoL1LjZTzKEfOF'
        : 'price_1TNvdo1yXjIoL1LjxAec6d2C';

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, trialDays: 7 }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al crear la sesión');
        setLoading(false);
      }
    } catch (e) {
      alert('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Premium</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">7 días gratis · Sin tarjeta</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Viaja con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              inteligencia real
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            IA, datos en tiempo real y análisis de riesgo en un solo lugar.
            Todo lo que necesitas para planificar, viajar seguro y resolver imprevistos.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table: Gratis vs Premium */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Gratis vs Premium
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            Compara lo que obtienes en cada plan. Empieza gratis y actualiza cuando quieras.
          </p>

          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-slate-700/50 border-b border-slate-700">
              <div className="px-6 py-3 text-sm font-semibold text-slate-400">Función</div>
              <div className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Gratis</div>
              <div className="px-4 py-3 text-center text-sm font-semibold text-amber-400 bg-amber-500/5">Premium</div>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 ${
                  i < COMPARISON.length - 1 ? 'border-b border-slate-700/30' : ''
                } ${row.premium && !row.free ? 'bg-amber-500/[0.03]' : ''}`}
              >
                <div className="px-6 py-3 text-sm text-slate-300 flex items-center">
                  {row.feature}
                </div>
                <div className="px-4 py-3 flex items-center justify-center">
                  {row.free ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="px-4 py-3 flex items-center justify-center bg-amber-500/[0.03]">
                  <Check className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat IA: Free vs Premium explainer */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Chat IA: Gratis vs Premium
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            Prueba el asistente gratis y actualiza cuando necesites más potencia.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-bold">Plan Gratuito</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  '5 mensajes por día',
                  'Modelo llama-3.1-8b-instant',
                  'Respuestas rápidas (~1s)',
                  'Contexto de país y riesgo MAEC',
                  'Ideal para consultas puntuales',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-slate-700/50">
                <Link href="/chat" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Probar Chat IA →
                </Link>
              </div>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 p-6 relative">
              <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                Recomendado
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold">Plan Premium</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  'Mensajes ilimitados',
                  'Modelo llama-3.3-70b-versatile (9x más potente)',
                  'Respuestas más detalladas y precisas',
                  'Contexto extendido de conversación',
                  'Itinerarios, comparativas y análisis',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-amber-500/20">
                <a href="/free-trial" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                  7 días gratis →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-16">
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Mensual</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-amber-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${isAnnual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-slate-500'}`}>
              Anual <span className="text-amber-400 text-xs font-bold">-83%</span>
            </span>
          </div>

          {/* Pricing card */}
          <div className="max-w-md mx-auto">
            <div className={`bg-slate-800 rounded-2xl border-2 p-8 relative ${isAnnual ? 'border-amber-500' : 'border-slate-700'}`}>
              {isAnnual && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                  Más popular
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  {isAnnual ? 'Premium Anual' : 'Premium Mensual'}
                </h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {isAnnual ? '19.99' : '4.99'}€
                  </span>
                  <span className="text-slate-400 text-sm">/{isAnnual ? 'año' : 'mes'}</span>
                </div>
                {isAnnual ? (
                  <p className="text-green-400 text-xs mt-2">
                    Equivale a 1.67€/mes — menos que un café
                  </p>
                ) : (
                  <p className="text-slate-500 text-xs mt-2">
                    Cancela cuando quieras
                  </p>
                )}
              </div>

              {/* FREE7 trial badge */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 mb-6 text-center">
                <span className="text-green-400 text-sm font-semibold">🎉 Prueba 7 días gratis</span>
                <p className="text-green-400/70 text-xs mt-0.5">Sin tarjeta · Acceso completo · Cancela cuando quieras</p>
              </div>

               <ul className="space-y-3 mb-6">
                {[
                  'Chat IA ilimitado con modelo 70b',
                  'Planificador de itinerarios',
                  'Alertas de riesgo en tiempo real',
                  'Mapa de sismos USGS en vivo',
                  'Monitor de conflictos activo',
                  'Análisis de riesgo por país',
                  'Generador de reclamaciones PDF',
                  'KPIs globales comparativos',
                  'ML Clustering de destinos',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="block w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl text-center hover:from-amber-400 hover:to-orange-400 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirigiendo a Stripe...
                  </>
                ) : (
                  'Empezar prueba gratuita'
                )}
              </button>
              <p className="text-slate-500 text-xs text-center mt-3">
                Sin compromiso · Cancela cuando quieras · Pago seguro con Stripe
              </p>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-slate-400 text-sm ml-2">4.8/5</span>
          </div>
          <p className="text-slate-500 text-sm">
            2.400+ viajeros activos · {TOTAL_PAISES} países con datos MAEC
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-6">Preguntas frecuentes</h3>
          <div className="space-y-4">
            {[
              { q: '¿Cuántos mensajes de Chat IA tengo gratis?', a: '5 mensajes por día con el modelo llama-3.1-8b-instant. Es suficiente para consultas rápidas. Para uso ilimitado y el modelo superior llama-3.1-70b (9x más inteligente), actualiza a Premium.' },
              { q: '¿Qué diferencia hay entre los modelos 8b y 70b?', a: 'El modelo 70b es 9 veces más grande, con mejor comprensión contextual, respuestas más detalladas y mayor precisión en recomendaciones complejas como itinerarios multiciudad o análisis de riesgo.' },
              { q: '¿Necesito tarjeta para la prueba?', a: 'No. Regístrate gratis y tendrás 7 días de acceso Premium completo. Sin tarjeta, sin compromiso. Cuando termine el trial, puedes suscribirte o seguir con el plan gratuito.' },
              { q: '¿Puedo cancelar en cualquier momento?', a: 'El trial no requiere cancelación — simplemente deja de usarse cuando pasan los 7 días. Si decides suscribirte después, puedes cancelar desde tu perfil en cualquier momento. No hay permanencia.' },
              { q: '¿Qué pasa cuando termina la prueba?', a: 'Se te notificará por email. Si no te suscribes, tu cuenta vuelve al plan gratuito con acceso al mapa, filtros de riesgo y 5 mensajes/día en el Chat IA.' },
              { q: '¿Hay factura?', a: 'Sí. Recibirás una factura por email con cada pago. Las empresas pueden deducirlo como gasto.' },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <h4 className="text-white font-semibold text-sm mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
