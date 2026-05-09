'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Loader2, Check, Download } from 'lucide-react';

const DISMISS_KEY = 'newsletter-popup-dismissed';
const DISMISS_DAYS = 7;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed, 10);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      localStorage.removeItem(DISMISS_KEY);
    }
    const timer = setTimeout(() => setVisible(true), 25000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing-popup' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          window.open('/api/checklist-pdf?' + new URLSearchParams({ email }), '_blank');
        }, 500);
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al procesar');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1030] max-w-sm w-full animate-slide-up">
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-2xl p-5 shadow-2xl">
        <button onClick={dismiss} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white font-semibold text-sm">Checklist enviada</p>
            <p className="text-slate-400 text-xs mt-1">Revisa tu bandeja de entrada</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Checklist de Viaje</p>
                <p className="text-slate-400 text-[11px]">80+ items en PDF gratis</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Descargar gratis
                  </>
                )}
              </button>
            </form>

            {status === 'error' && message && (
              <p className="text-red-400 text-xs mt-2">{message}</p>
            )}

            <p className="text-slate-500 text-[10px] mt-3 text-center">
              Sin spam. Cancelación fácil.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
