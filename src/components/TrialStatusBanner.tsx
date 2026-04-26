'use client';

import Link from 'next/link';
import { Crown, Clock, AlertTriangle, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * TrialStatusBanner
 * Muestra el estado de suscripción del usuario autenticado:
 *  - Premium activo → badge verde discreto
 *  - En trial → barra con días restantes + CTA
 *  - Trial expirado → alerta naranja + CTA urgente
 *  - Sin suscripción → banner azul suave invitando a premium
 *  - No autenticado → null (no renderiza nada)
 */
export default function TrialStatusBanner() {
  const { premium, status, daysLeft, trialEnd, trialExpired, loading } = useSubscription();

  // No mostrar nada si no hay sesión o Supabase no está configurado
  if (status === 'no_session' || status === 'no_configured') return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-6 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Verificando acceso...
      </div>
    );
  }

  // ── PREMIUM ACTIVO ──────────────────────────────────────────────
  if (premium && status === 'active') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl mb-6">
        <Crown className="w-5 h-5 text-yellow-400 shrink-0" />
        <div className="flex-1">
          <p className="text-yellow-300 font-semibold text-sm">Acceso Premium activo</p>
          <p className="text-yellow-400/70 text-xs">Tienes acceso completo a todas las funciones</p>
        </div>
        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold">PRO</span>
      </div>
    );
  }

  // ── EN TRIAL ────────────────────────────────────────────────────
  if (status === 'trialing' && daysLeft !== null) {
    const urgency = daysLeft <= 2;
    const trialEndFormatted = trialEnd
      ? new Date(trialEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
      : '';

    return (
      <div className={`px-4 py-4 rounded-xl mb-6 border ${
        urgency
          ? 'bg-orange-500/10 border-orange-500/40'
          : 'bg-blue-500/10 border-blue-500/30'
      }`}>
        <div className="flex items-start gap-3">
          <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${urgency ? 'text-orange-400' : 'text-blue-400'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className={`font-semibold text-sm ${urgency ? 'text-orange-300' : 'text-blue-300'}`}>
                Prueba gratuita · {daysLeft === 0 ? 'Último día' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                urgency ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                FREE7
              </span>
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full transition-all ${urgency ? 'bg-orange-400' : 'bg-blue-400'}`}
                style={{ width: `${Math.max(5, (daysLeft / 7) * 100)}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs">
              {urgency ? '⚠️ Tu trial acaba pronto · ' : ''}
              {trialEndFormatted ? `Expira el ${trialEndFormatted}` : 'Activa premium para continuar'}
            </p>
          </div>
          <Link
            href="/premium"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              urgency
                ? 'bg-orange-500 hover:bg-orange-400 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Activar
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // ── TRIAL EXPIRADO ──────────────────────────────────────────────
  if (trialExpired || status === 'trial_expired') {
    return (
      <div className="px-4 py-4 bg-red-500/10 border border-red-500/40 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 font-semibold text-sm">Tu prueba gratuita ha expirado</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Activa Premium desde 4,99€/mes para recuperar el acceso completo
            </p>
          </div>
          <Link
            href="/premium"
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all"
          >
            Ver planes
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // ── SIN SUSCRIPCIÓN (free) ──────────────────────────────────────
  if (status === 'none' || status === 'canceled') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-6 hover:border-purple-500/40 transition-colors group">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
        <div className="flex-1">
          <p className="text-slate-200 text-sm font-medium">
            Prueba Premium gratis 7 días
          </p>
          <p className="text-slate-500 text-xs">Sin tarjeta de crédito. Cancela cuando quieras.</p>
        </div>
        <Link
          href="/free-trial"
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all"
        >
          Empezar
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return null;
}
