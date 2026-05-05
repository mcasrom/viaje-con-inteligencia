'use client';

import { useState } from 'react';
import { Gift, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function FreeTrialForm() {
  const { user, signUpWithPassword, signInWithPassword } = useAuth();
  const [step, setStep] = useState<'auth' | 'loading' | 'success' | 'error'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    if (!email || !password) {
      setError('Email y contraseña requeridos');
      return;
    }
    
    setStep('loading');
    setError('');
    
    try {
      let authResult;
      
      if (isLogin) {
        authResult = await signInWithPassword(email, password);
      } else {
        authResult = await signUpWithPassword(email, password);
      }
      
      if (authResult?.error) {
        setError(authResult.error);
        setStep('error');
        return;
      }

      const res = await fetch('/api/trial/activate', { method: 'POST' });
      const data = await res.json();
      
      if (res.status === 409) {
        setError('Ya tienes un trial activo. Ve al dashboard.');
        setStep('error');
        return;
      }
      
      if (!res.ok) {
        setError(data.error || 'Error al activar trial');
        setStep('error');
        return;
      }

      setStep('success');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError('Error de conexión');
      setStep('error');
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-slate-800/70 rounded-2xl p-8 border border-green-500/50 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">¡Trial activado!</h3>
        <p className="text-slate-400 mb-4">7 días de acceso Premium. Sin tarjeta.</p>
        <p className="text-green-400 text-sm">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="bg-slate-800/70 rounded-2xl p-8 border border-red-500/50 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error</h3>
        <p className="text-slate-400 mb-4">{error}</p>
        <button 
          onClick={() => setStep('auth')}
          className="text-purple-400 hover:text-purple-300"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700">
      {step === 'loading' ? (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Activando tu trial...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white">7 días Premium gratis</h3>
            <p className="text-slate-400 text-sm mt-1">Sin tarjeta de crédito</p>
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-3 text-sm text-green-300">
            ✅ Sin tarjeta · Acceso completo · Cancela cuando quieras
          </div>

          <button 
            onClick={handleActivate}
            disabled={!email || !password || step === 'loading'}
            className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Gift className="w-5 h-5" />
            Activar 7 días gratis
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-slate-500 text-sm text-center">
            {isLogin ? (
              <>¿No tienes cuenta? <button onClick={() => setIsLogin(false)} className="text-purple-400 hover:text-purple-300">Crear cuenta</button></>
            ) : (
              <>¿Ya tienes cuenta? <button onClick={() => setIsLogin(true)} className="text-purple-400 hover:text-purple-300">Iniciar sesión</button></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
