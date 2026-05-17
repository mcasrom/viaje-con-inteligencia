'use client';

import { useState } from 'react';
import { X, Check, Loader2, Send } from 'lucide-react';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

interface Props {
  planTier: string;
  onClose: () => void;
}

export default function RequestApiPlanModal({ planTier, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/plans/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          planTier,
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar');
      }
      setStatus('success');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Solicitud enviada</h3>
            <p className="text-slate-400 text-sm mb-4">
              Te contactaremos en <strong className="text-white">{email}</strong> para activar tu plan {TIER_LABELS[planTier]}.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Plan {TIER_LABELS[planTier]}</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Déjanos tus datos y te activamos el acceso en 24-48h.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Nombre *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
              />
              <input
                placeholder="Empresa (opcional)"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
              />
              <textarea
                placeholder="Cuéntanos tu caso de uso (opcional)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm resize-none"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={status === 'loading' || !name.trim() || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-4 h-4" /> Solicitar plan {TIER_LABELS[planTier]}</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
