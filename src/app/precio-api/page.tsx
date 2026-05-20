'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, HelpCircle, Mail, Shield, Zap, Users, BarChart3, AlertTriangle } from 'lucide-react';
import RequestApiPlanModal from '@/components/RequestApiPlanModal';

const TIERS = [
  {
    name: 'Free',
    price: '0',
    requests: '3,000',
    cta: 'Empieza gratis',
    href: '/admin/api-keys',
    features: ['1 API key', 'Risk endpoint', 'TCI endpoint', 'Incidents endpoint', 'Countries list', 'Actualizaciones diarias'],
    needsRequest: false,
  },
  {
    name: 'Starter',
    price: '29',
    requests: '10,000',
    cta: 'Quiero esto para aquí',
    href: '#',
    featured: true,
    features: ['5 API keys', 'Todos los endpoints', '90 días histórico', 'Email support', 'Alertas en tiempo real'],
    needsRequest: true,
  },
  {
    name: 'Pro',
    price: '99',
    requests: '50,000',
    cta: 'Quiero esto para aquí',
    href: '#',
    features: ['API keys ilimitadas', 'Todos los endpoints', '1 año histórico', 'SLA 99.9%', 'Support prioritario', 'Webhooks personalizados'],
    needsRequest: true,
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    requests: 'Ilimitadas',
    cta: 'Quiero esto para aquí',
    href: '#',
    features: ['Volumen personalizado', 'Endpoints dedicados', 'Histórico completo', 'SLA 99.99%', 'Support dedicado', 'Onboarding asistido', 'Contrato anual'],
    needsRequest: true,
  },
];

export default function PrecioApiPage() {
  const [requestTier, setRequestTier] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" /> API Pública v1
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">API de Riesgo y Viajes</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Datos estructurados de riesgo MAEC, costes TCI, incidentes en tiempo real y más para integrar en tus aplicaciones.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-slate-800 rounded-2xl border p-6 flex flex-col ${tier.featured ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-700'}`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                  Más popular
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                {tier.price !== 'Personalizado' ? (
                  <>
                    <span className="text-3xl font-bold text-white">{tier.price}€</span>
                    <span className="text-slate-500 text-sm">/mes</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-white">Personalizado</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">Hasta {tier.requests} req/mes</p>
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.needsRequest ? (
                <button
                  onClick={() => setRequestTier(tier.name)}
                  className={`mt-8 block w-full text-center py-3 rounded-xl text-sm font-medium transition-colors ${
                    tier.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tier.cta}
                </button>
              ) : (
                <Link
                  href={tier.href}
                  className={`mt-8 block w-full text-center py-3 rounded-xl text-sm font-medium transition-colors ${
                    tier.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Features grid */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">¿Qué incluye la API?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Riesgo país', desc: 'Nivel MAEC + US State Dept, score numérico, predicción por IA a 7/14/30 días' },
              { icon: BarChart3, title: 'Travel Cost Index', desc: 'TCI completo con desglose por demanda, petróleo, estacionalidad, IPC y riesgo' },
              { icon: AlertTriangle, title: 'Incidentes en vivo', desc: 'Incidentes activos con severidad, coordenadas y recomendaciones. Filtrables por país/tipo' },
              { icon: Users, title: 'Datos por país', desc: '137 países con bandera, capital, moneda, zona horaria y nivel de riesgo' },
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <feature.icon className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 p-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl text-center">
          <HelpCircle className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">¿Necesitas algo más?</h2>
          <p className="text-slate-400 mb-6">Volúmenes superiores, endpoints personalizados o integración asistida.</p>
          <a
            href="mailto:info@viajeinteligencia.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Mail className="w-4 h-4" /> info@viajeinteligencia.com
          </a>
        </section>

        {/* Docs link */}
        <div className="mt-12 text-center">
          <Link href="/api-endpoints" className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4">
            Ver documentación técnica completa →
          </Link>
        </div>
      </main>

      {requestTier && (
        <RequestApiPlanModal
          planTier={TIERS.find(t => t.name === requestTier)?.name.toLowerCase() || requestTier.toLowerCase()}
          onClose={() => setRequestTier(null)}
        />
      )}
    </div>
  );
}
