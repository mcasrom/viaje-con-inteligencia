'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Percent, Globe, Users, TrendingUp, DollarSign, ChevronRight, ArrowRight, Send, Link as LinkIcon, Star, Shield } from 'lucide-react';

const BENEFITS = [
  { icon: Percent, label: '20% de comisión recurrente los primeros 12 meses' },
  { icon: Globe, label: 'Audiencia global: viajeros de 137 países' },
  { icon: Users, label: 'Material promocional (banners, textos, widgets)' },
  { icon: TrendingUp, label: 'Cookie de 30 días — una vez registrado, es tuyo' },
];

const COMMISSION_PLANS = [
  { tier: 'Free', commission: '—', requirement: 'Sin comisiones en plan gratuito' },
  { tier: 'Premium', commission: '20%', requirement: 'Mínimo 3 ventas/mes' },
  { tier: 'API Pro', commission: '15%', requirement: 'Contactar para acuerdo personalizado' },
];

export default function AfiliadosClient() {
  const [form, setForm] = useState({ name: '', email: '', web: '', audiencia: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/afiliados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg('¡Gracias por tu interés! Te escribiré en 24-48h con los detalles.');
      } else {
        setStatus('error');
        setMsg(data.error || 'Error al enviar');
      }
    } catch {
      setStatus('error');
      setMsg('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-[1010]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-medium text-sm mb-4">
            <Star className="w-4 h-4" />
            Programa de afiliados — abierto
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gana compartiendo inteligencia de viaje
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            ¿Tienes una web de viajes, un canal de Telegram, un boletín o una comunidad de viajeros?
            Conviértete en afiliado y gana comisiones por cada usuario que se registre a través de ti.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <b.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-white text-xs leading-tight">{b.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-12">
          <h2 className="text-lg font-bold text-white mb-6">Cómo funciona</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', label: 'Te registras', desc: 'Rellena el formulario con tu web, canal o comunidad. Reviso tu perfil y te activo.' },
              { num: '2', label: 'Compartes tu enlace', desc: 'Recibes un enlace de afiliado único. Lo pones en tu web, newsletter o redes.' },
              { num: '3', label: 'Cobras comisiones', desc: 'Cada usuario que se registra a través de tu enlace y compra Premium te genera el 20% durante 12 meses.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
                  <span className="text-amber-400 font-bold text-lg">{step.num}</span>
                </div>
                <h3 className="text-white font-medium mb-1 text-sm">{step.label}</h3>
                <p className="text-slate-400 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commission table */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-12">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Comisiones por plan
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
                <th className="text-left p-4 font-medium">Plan</th>
                <th className="text-center p-4 font-medium">Comisión</th>
                <th className="text-right p-4 font-medium">Requisito</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_PLANS.map((p, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="p-4 text-white font-medium">{p.tier}</td>
                  <td className="p-4 text-center text-amber-400 font-bold">{p.commission}</td>
                  <td className="p-4 text-right text-slate-400 text-xs">{p.requirement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Form */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-1">Solicita tu acceso</h2>
          <p className="text-slate-400 text-sm mb-6">
            Cuéntame quién eres y qué audiencia tienes. Si encajas, te activo el programa.
          </p>

          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg">{msg}</h3>
              <Link href="/" className="inline-flex items-center gap-2 mt-6 text-amber-400 hover:text-amber-300 text-sm">
                Volver al inicio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              {status === 'error' && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{msg}</div>
              )}

              <div>
                <label className="text-slate-300 text-sm block mb-1">Nombre o alias</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">Web, canal o comunidad</label>
                <input
                  type="text"
                  value={form.web}
                  onChange={e => setForm(f => ({ ...f, web: e.target.value }))}
                  placeholder="URL de tu web, Telegram, newsletter, etc."
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">¿Cuánta audiencia tienes?</label>
                <select
                  value={form.audiencia}
                  onChange={e => setForm(f => ({ ...f, audiencia: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="&lt;100">{'<'} 100 seguidores/suscriptores</option>
                  <option value="100-1000">100 — 1.000</option>
                  <option value="1000-10000">1.000 — 10.000</option>
                  <option value=">10000">{'>'} 10.000</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">Mensaje (opcional)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Cuéntame más sobre tu proyecto, cómo piensas promocionarnos, ideas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Solicitar acceso
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Preguntas frecuentes</h2>
          {[
            { q: '¿Cuándo se pagan las comisiones?', a: 'Las comisiones se liquidan mensualmente por transferencia o PayPal, siempre que se superen los 50€ acumulados.' },
            { q: '¿Qué se considera una venta?', a: 'Un usuario que hace clic en tu enlace de afiliado, se registra y compra cualquier plan Premium dentro de los 30 días siguientes.' },
            { q: '¿Puedo ser afiliado si tengo un canal pequeño?', a: 'Sí. No hay mínimo de audiencia. Evaluamos cada solicitud por la calidad de la audiencia y el ajuste con el proyecto.' },
            { q: '¿Hay material promocional?', a: 'Sí. Al activarte recibirás enlaces personalizados, banners, textos sugeridos y acceso a dashboards de ejemplo.' },
            { q: '¿Puedo promocionar en redes sociales?', a: 'Sí, siempre que sea dentro de los términos: sin spam, sin ads engañosos y sin dinámicas de puerta cerrada.' },
            { q: '¿Hay límite de afiliados?', a: 'No. El programa está abierto a cualquier persona con una audiencia alineada con viajeros conscientes.' },
          ].map((faq, i) => (
            <details key={i} className="bg-slate-800 rounded-xl border border-slate-700 group">
              <summary className="px-5 py-4 text-white font-medium text-sm cursor-pointer hover:text-amber-400 transition-colors flex items-center justify-between">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="px-5 pb-4 text-slate-400 text-sm">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            ¿Prefieres escribir directamente?{' '}
            <a href="mailto:afiliados@viajeinteligencia.com" className="text-amber-400 hover:text-amber-300 underline">
              afiliados@viajeinteligencia.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
