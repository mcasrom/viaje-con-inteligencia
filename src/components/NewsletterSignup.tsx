'use client';

import { useState } from 'react';
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'blog' | 'footer';
}

export default function NewsletterSignup({ variant = 'blog' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '¡Suscripción exitosa!');
        if (!data.already_subscribed) {
          setEmail('');
          setName('');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al suscribir');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Suscribirse'}
          </button>
        </div>
        <p className="text-slate-500 text-xs">
          Al suscribirte aceptas nuestra{' '}
          <a href="/legal#privacidad" className="underline hover:text-slate-300">
            política de privacidad
          </a>
          . Tu email solo se usará para el newsletter. Cancela en cualquier momento.
        </p>
      </form>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Resumen semanal de viajes
          </h3>
          <p className="text-white/80 text-sm">
            Recibe las últimas alertas y consejos cada semana
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-green-300">
          <Check className="w-5 h-5" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="px-4 py-3 bg-white/20 text-white placeholder-white/60 rounded-lg border border-white/30 focus:border-white focus:outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-3 bg-white/20 text-white placeholder-white/60 rounded-lg border border-white/30 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Suscribirse'
              )}
            </button>
          </div>
          <p className="text-white/60 text-xs">
            Sin spam. Cancela cuando quieras. Al suscribirte aceptas nuestra{' '}
            <a href="/legal#privacidad" className="underline hover:text-white/80">
              política de privacidad
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}