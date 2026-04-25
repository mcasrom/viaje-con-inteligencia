'use client';

import Link from 'next/link';
import { AlertCircle, Mail, RefreshCw, CheckCircle, Clock, CreditCard, User, ExternalLink } from 'lucide-react';

interface AccessStatusProps {
  status: 'no_configured' | 'no_session' | 'invalid_session' | 'no_profile' | 'error' | 'not_premium';
  message?: string;
  showHelp?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG = {
  'no_configured': {
    title: 'Sistema de suscripciones no disponible',
    description: 'El sistema de suscripciones no está configurado en este momento.',
    icon: AlertCircle,
    color: 'yellow',
    action: 'contact',
  },
  'no_session': {
    title: 'Inicia sesión para continuar',
    description: 'Debes iniciar sesión con tu cuenta para acceder al contenido premium.',
    icon: User,
    color: 'blue',
    action: 'login',
  },
  'invalid_session': {
    title: 'Sesión expirada',
    description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
    icon: RefreshCw,
    color: 'yellow',
    action: 'login',
  },
  'no_profile': {
    title: 'Perfil no encontrado',
    description: 'No pudimos encontrar tu perfil. Por favor, contacta con soporte.',
    icon: User,
    color: 'yellow',
    action: 'contact',
  },
  'not_premium': {
    title: 'Suscripción Premium requerida',
    description: 'Esta función está disponible para usuarios Premium. Suscríbete para acceder.',
    icon: CreditCard,
    color: 'purple',
    action: 'upgrade',
  },
  'error': {
    title: 'Error al verificar suscripción',
    description: 'Ocurrió un error al verificar tu estado de suscripción.',
    icon: AlertCircle,
    color: 'red',
    action: 'contact',
  },
};

const colorClasses = {
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    title: 'text-yellow-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    title: 'text-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    title: 'text-purple-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-400',
  },
};

export default function AccessStatus({ status, message, showHelp = true, compact = false }: AccessStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['error'];
  const colors = colorClasses[config.color as keyof typeof colorClasses] || colorClasses.yellow;
  const Icon = config.icon;

  const content = (
    <div className={`${colors.bg} ${colors.border} rounded-xl p-4 border`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${colors.title} mb-1`}>{config.title}</h4>
          <p className="text-slate-400 text-sm">{message || config.description}</p>
        </div>
      </div>
      
      {showHelp && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm mb-3">
            ¿Necesitas ayuda? Escríbenos a:
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <a 
              href="mailto:info@viajeinteligencia.com?subject=Problema%20de%20acceso%20Premium"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@viajeinteligencia.com
            </a>
          </div>
        </div>
      )}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <div className="space-y-4">
      {content}
      
      {config.action === 'login' && (
        <div className="flex gap-2">
          <Link 
            href="/auth/login"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link 
            href="/premium"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Ver planes Premium
          </Link>
        </div>
      )}
      
      {config.action === 'upgrade' && (
        <Link 
          href="/premium"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25"
        >
          <CreditCard className="w-5 h-5" />
          Suscribirme a Premium
        </Link>
      )}
    </div>
  );
}

interface SubscriptionStatusProps {
  isPremium: boolean;
  subscriptionStatus?: string;
  trialEnd?: string;
  showDetails?: boolean;
}

export function SubscriptionBadge({ isPremium, subscriptionStatus, trialEnd, showDetails = false }: SubscriptionStatusProps) {
  if (isPremium) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
        <CheckCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-sm font-medium">Premium</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full">
      <Clock className="w-4 h-4 text-slate-400" />
      <span className="text-slate-400 text-sm">Free</span>
      {showDetails && subscriptionStatus && (
        <span className="text-slate-500 text-xs">({subscriptionStatus})</span>
      )}
    </div>
  );
}