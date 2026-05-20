'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Mail, PenLine, Globe, Code, BookOpen, Users, Zap, Shield, ChevronRight, ArrowRight, Sparkles, Send } from 'lucide-react';

type ColaborarRol = 'contenido' | 'traduccion' | 'osint' | 'desarrollo' | 'embajador' | 'otro';

const ROLES: { id: ColaborarRol; label: string; icon: any; desc: string }[] = [
  { id: 'contenido', label: 'Redactor de contenido', icon: PenLine, desc: 'Escribes sobre viajes, seguridad, OSINT o geopolítica' },
  { id: 'traduccion', label: 'Traductor', icon: Globe, desc: 'Traduces contenido a inglés, portugués o francés' },
  { id: 'osint', label: 'Investigador OSINT', icon: Shield, desc: 'Aportas fuentes, señales o análisis OSINT' },
  { id: 'desarrollo', label: 'Desarrollador', icon: Code, desc: 'Contribuyes al código (Next.js, Python, ML)' },
  { id: 'embajador', label: 'Embajador', icon: Users, desc: 'Difundes el proyecto en redes, foros o tu comunidad' },
  { id: 'otro', label: 'Otro', icon: Sparkles, desc: 'Tienes otra idea de colaboración' },
];

const BENEFITS = [
  { icon: BookOpen, label: 'Byline y enlace a tu portfolio en cada publicación' },
  { icon: Zap, label: 'Acceso beta anticipado a nuevas features' },
  { icon: Mail, label: 'Newsletter privada con datos y análisis exclusivos' },
  { icon: Users, label: 'Comunidad reducida de colaboradores del proyecto' },
];

export default function ColaborarClient() {
  const [selectedRol, setSelectedRol] = useState<ColaborarRol | null>(null);
  const [form, setForm] = useState({ name: '', email: '', redes: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/colaborar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rol: selectedRol }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg('¡Gracias! Te responderé en 24-48h.');
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 font-medium text-sm mb-4">
            <Users className="w-4 h-4" />
            Proyecto independiente · Código abierto
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Colabora con el proyecto
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Viaje con Inteligencia es un proyecto independiente. Busco personas que aporten
            contenido, traducciones, análisis OSINT, código o simplemente difusión.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <b.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-white text-xs leading-tight">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Rol selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">¿Cómo quieres colaborar?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ROLES.map((rol) => {
              const Icon = rol.icon;
              return (
                <button
                  key={rol.id}
                  onClick={() => setSelectedRol(rol.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedRol === rol.id
                      ? 'bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selectedRol === rol.id ? 'text-purple-400' : 'text-slate-400'}`} />
                  <p className="text-white text-sm font-medium">{rol.label}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">{rol.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        {selectedRol && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-1">Cuéntame más</h2>
            <p className="text-slate-400 text-sm mb-6">
              Rellena el formulario y te responderé personalmente.
            </p>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg">{msg}</h3>
                <p className="text-slate-400 text-sm mt-1">Mientras tanto, puedes explorar el proyecto.</p>
                <Link href="/" className="inline-flex items-center gap-2 mt-6 text-purple-400 hover:text-purple-300 text-sm">
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
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none text-sm"
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
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-sm block mb-1">Redes o portfolio (opcional)</label>
                  <input
                    type="text"
                    value={form.redes}
                    onChange={e => setForm(f => ({ ...f, redes: e.target.value }))}
                    placeholder="URL de tu web, LinkedIn, GitHub, etc."
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-sm block mb-1">Mensaje</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Cuéntame qué te gustaría aportar, experiencia, ideas..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Preguntas frecuentes</h2>
          {[
            { q: '¿Hay compensación económica?', a: 'Depende del tipo de colaboración. Para contenido publicado hay byline + enlace. Para código, si hay contribución sostenida, se puede discutir revenue share.' },
            { q: '¿Cuánto tiempo requiere?', a: 'El que tú quieras. Desde un artículo puntual hasta colaboración recurrente. Sin compromiso mínimo.' },
            { q: '¿Puedo colaborar sin saber de tecnología?', a: 'Sí. Busco redactores de contenido, traductores y embajadores. No necesitas saber programar.' },
            { q: '¿Quién toma las decisiones?', a: 'El proyecto tiene un solo founder (M. Castillo). Las decisiones técnicas y de producto son unilaterales, pero las colaboraciones son bienvenidas y se reconocen.' },
          ].map((faq, i) => (
            <details key={i} className="bg-slate-800 rounded-xl border border-slate-700 group">
              <summary className="px-5 py-4 text-white font-medium text-sm cursor-pointer hover:text-purple-400 transition-colors flex items-center justify-between">
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
            <a href="mailto:colabs@viajeinteligencia.com" className="text-purple-400 hover:text-purple-300 underline">
              colabs@viajeinteligencia.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
