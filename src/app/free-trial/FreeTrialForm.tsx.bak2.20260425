'use client';

import { useState } from 'react';
import { Gift, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';

const PROMO_CODES = [
  { code: 'FREE7', description: '7 días premium gratis', trialDays: 7 },
  { code: 'WELCOME30', description: '30 días premium gratis', trialDays: 30 },
  { code: 'WELCOME60', description: '60 días premium - Bienvenida', trialDays: 60 },
  { code: 'LAUNCH50', description: '50% descuento primera suscripción', discount: 50 },
];

const MONTHLY_PRICE_ID = 'price_1TNvdo1yXjIoL1LjxAec6d2C';

export default function FreeTrialForm() {
  const [step, setStep] = useState<'select' | 'email' | 'loading' | 'success' | 'error'>('select');
  const [selectedCode, setSelectedCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleStartTrial = async () => {
    if (!email || !selectedCode) return;
    
    setStep('loading');
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: MONTHLY_PRICE_ID,
          promoCode: selectedCode,
          email 
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Error al procesar');
        setStep('error');
      }
    } catch (err) {
      setError('Error de conexión');
      setStep('error');
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-slate-800/70 rounded-2xl p-8 border border-green-500/50 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">¡Código aplicado!</h3>
        <p className="text-slate-400">Revisa tu email para completar el registro.</p>
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
          onClick={() => setStep('select')}
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
          <p className="text-slate-400">Procesando...</p>
        </div>
      ) : step === 'email' ? (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-4xl">🎁</span>
            <div className="text-2xl font-bold text-yellow-400 mt-2">{selectedCode}</div>
            <p className="text-green-400 text-sm mt-1">
              {PROMO_CODES.find(p => p.code === selectedCode)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-2">Tu email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600 text-sm text-slate-300 flex gap-2">
            <span>🔒</span>
            <span>Se solicitará tarjeta para reservar tu acceso. <strong className="text-white">No se cobra nada hasta el día 8.</strong> Cancela en cualquier momento antes y no pagarás nada.</span>
          </div>
          <button 
            onClick={handleStartTrial}
            disabled={!email}
            className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Gift className="w-5 h-5" />
            Activar {selectedCode}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setStep('select')}
            className="w-full text-slate-400 hover:text-white text-sm"
          >
            ← Cambiar código
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white">Selecciona tu código</h3>
          </div>
          
          <div className="space-y-3">
            {PROMO_CODES.map((promo) => (
              <button
                key={promo.code}
                onClick={() => {
                  setSelectedCode(promo.code);
                  setStep('email');
                }}
                className="w-full p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-yellow-500/50 hover:bg-slate-700 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-yellow-400 font-bold text-lg">{promo.code}</span>
                    <p className="text-slate-400 text-sm">{promo.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-sm text-center">
              ¿Ya tienes código? <Link href="/premium" className="text-purple-400 hover:text-purple-300">Ir a premium →</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}