'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, HelpCircle, Mail, Shield, Zap, Users, BarChart3, AlertTriangle, Loader2, Copy, CheckCircle2 } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '0',
    requests: '1,000',
    cta: 'Ver documentación',
    href: '/api-endpoints',
    features: ['1 API key', 'Risk endpoint', 'TCI endpoint', 'Incidents endpoint', 'Countries list', 'Actualizaciones diarias'],
  },
  {
    name: 'Pro',
    price: '4.99',
    requests: '10,000',
    cta: 'Suscribirse',
    href: '#',
    featured: true,
    features: ['5 API keys', 'Todos los endpoints', '90 días histórico', 'Email support', 'Alertas en tiempo real'],
    priceId: 'price_1TZjOo1yXjIoL1LjQf4rIc65',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    requests: 'Ilimitadas',
    cta: 'Contactar',
    href: 'mailto:info@viajeinteligencia.com',
    features: ['API keys ilimitadas', 'Endpoints personalizados', 'Histórico completo', 'Soporte dedicado', 'Onboarding asistido', 'SLA personalizado'],
  },
];

export default function PrecioApiPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFreeKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setApiKey('');
    try {
      const res = await fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.key) {
        setApiKey(data.key);
      } else {
        setError(data.error || 'Error al generar key');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async (priceId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, trialDays: 7, type: 'api_pro' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Error al conectar con Stripe');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="grid md:grid-cols-3 max-w-3xl mx-auto gap-6 items-start">
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
                <span className="text-3xl font-bold text-white">{tier.price}{tier.name !== 'Enterprise' ? '€' : ''}</span>
                {tier.name !== 'Enterprise' && <span className="text-slate-500 text-sm">/mes</span>}
              </div>
              <p className="text-slate-400 text-sm mt-1">{tier.name === 'Enterprise' ? 'Volumen personalizado' : `Hasta ${tier.requests} req/mes`}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.name === 'Free' ? (
                apiKey ? (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-green-300 text-xs font-medium">Key generada</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 rounded-lg px-3 py-2 border border-slate-600">
                      <code className="text-amber-400 text-xs truncate flex-1 font-mono">{apiKey}</code>
                      <button onClick={copyKey} className="text-slate-400 hover:text-white shrink-0">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">Guárdala, solo la verás una vez.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFreeKey} className="mt-8 space-y-2">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-center py-3 rounded-xl text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin inline" /> Generando...</> : 'Obtener API Key gratis'}
                    </button>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  </form>
                )
              ) : tier.name === 'Enterprise' ? (
                <a
                  href={tier.href}
                  className="mt-8 flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl text-sm font-medium transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  {tier.cta}
                </a>
              ) : (
                <button
                  onClick={() => handleCheckout(tier.priceId!)}
                  disabled={loading}
                  className="mt-8 flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : tier.cta}
                </button>
              )}
              {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
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
              { icon: Users, title: 'Datos por país', desc: '136 países con bandera, capital, moneda, zona horaria y nivel de riesgo' },
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
    </div>
  );
}
