'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Clock, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

type SubStatus = 'loading' | 'trialing' | 'active' | 'expired' | 'none';

interface SubInfo {
  status: SubStatus;
  daysLeft?: number;
  trialEnd?: string;
  renewalDate?: string;
}

export default function SubscriptionStatusBlock() {
  const [info, setInfo] = useState<SubInfo>({ status: 'loading' });

  useEffect(() => {
    fetch('/api/subscription/check')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'trialing') {
          const end = new Date(data.trial_end);
          const now = new Date();
          const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setInfo({ status: 'trialing', daysLeft, trialEnd: data.trial_end });
        } else if (data.status === 'active') {
          setInfo({ status: 'active', renewalDate: data.current_period_end });
        } else if (data.status === 'expired' || data.status === 'canceled') {
          setInfo({ status: 'expired' });
        } else {
          setInfo({ status: 'none' });
        }
      })
      .catch(() => setInfo({ status: 'none' }));
  }, []);

  if (info.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Cargando suscripción...</span>
      </div>
    );
  }

  if (info.status === 'active') {
    return (
      <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">Plan Premium activo</p>
            {info.renewalDate && (
              <p className="text-slate-400 text-xs mt-0.5">
                Próxima renovación: {new Date(info.renewalDate).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/dashboard/subscription"
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 shrink-0"
        >
          Gestionar <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  if (info.status === 'trialing') {
    const urgent = (info.daysLeft ?? 0) <= 2;
    return (
      <div className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${
        urgent
          ? 'bg-orange-500/10 border-orange-500/40'
          : 'bg-blue-500/10 border-blue-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 shrink-0 ${urgent ? 'text-orange-400' : 'text-blue-400'}`} />
          <div>
            <p className="text-white font-semibold text-sm">
              Trial Premium — {info.daysLeft === 0 ? 'expira hoy' : `${info.daysLeft} día${info.daysLeft === 1 ? '' : 's'} restantes`}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {urgent ? 'Activa tu plan para no perder el acceso' : 'Acceso completo a todas las funciones Premium'}
            </p>
          </div>
        </div>
        <Link
          href="/premium"
          className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full hover:from-yellow-400 hover:to-orange-400 transition-all"
        >
          Activar plan
        </Link>
      </div>
    );
  }

  if (info.status === 'expired') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">Suscripción cancelada</p>
            <p className="text-slate-400 text-xs mt-0.5">Acceso limitado al plan Gratis</p>
          </div>
        </div>
        <Link
          href="/premium"
          className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          Renovar
        </Link>
      </div>
    );
  }

  // status === 'none' — usuario gratis sin trial
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-slate-400 shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">Plan Gratis</p>
          <p className="text-slate-400 text-xs mt-0.5">Chat IA 5 msg/día · Mapa básico</p>
        </div>
      </div>
      <Link
        href="/free-trial"
        className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full hover:from-yellow-400 hover:to-orange-400 transition-all"
      >
        7 días gratis
      </Link>
    </div>
  );
}
