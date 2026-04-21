'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Loader2, LogOut, User, Mail, X } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showEmail?: boolean;
}

export default function LoginButton({ variant = 'button', size = 'md', showEmail = true }: LoginButtonProps) {
  const { user, loading, signInWithEmail, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setMessage(null);
    const result = await signInWithEmail(email);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: '¡Enlace enviado! Revisa tu email.' });
      setEmail('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'} bg-slate-700 rounded-lg`}>
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        {variant === 'icon' ? (
          <button
            onClick={() => signOut()}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors ${
              size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        )}
      </>
    );
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setShowModal(true)}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          title="Iniciar sesión"
        >
          <User className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ${
            size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Acceder</span>
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Accede a tu cuenta</h2>
              <p className="text-slate-400 text-sm">
                Inicia sesión para guardar países favoritos y acceder a contenido premium.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar enlace de acceso
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-500 text-xs text-center">
                Al iniciar sesión aceptas nuestros términos de servicio.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}