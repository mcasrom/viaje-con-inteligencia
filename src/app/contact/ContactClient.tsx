'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function ContactClient() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Contacto desde Viaje con Inteligencia');
    const body = encodeURIComponent(`Nombre: ${formData.name}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`);
    window.location.href = `mailto:info@viajeinteligencia.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            Contacto
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            ¿Tienes alguna pregunta?
          </h1>
          <p className="text-slate-400">
            Escríbenos y te responderemos lo antes posible.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">¡Mensaje enviado!</h2>
            <p className="text-slate-300 mb-4">
              Se abrirá tu cliente de email. Envíanos el mensaje y lo procesaremos ASAP.
            </p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mensaje
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
            >
              <Send className="w-5 h-5" />
              Enviar mensaje
            </button>
          </form>
        )}

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <a
            href="mailto:info@viajeinteligencia.com"
            className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors"
          >
            <Mail className="w-8 h-8 text-blue-400" />
            <div>
              <div className="font-medium text-white">Email</div>
              <div className="text-sm text-slate-400">info@viajeinteligencia.com</div>
            </div>
          </a>
          <a
            href="https://t.me/ViajeConInteligencia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors"
          >
            <MessageCircle className="w-8 h-8 text-blue-400" />
            <div>
              <div className="font-medium text-white">Telegram</div>
              <div className="text-sm text-slate-400">@ViajeConInteligencia</div>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
