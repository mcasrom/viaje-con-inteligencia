'use client';

import { useState, useEffect } from 'react';
import { Bell, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface AlertSub {
  id: number;
  country_code: string;
  country_name: string;
  country_emoji: string;
  nivel_riesgo: string | null;
  alert_types: string[];
  severity_min: string;
  source?: string;
  created_at: string;
}

const RIESGO_COLOR: Record<string, string> = {
  'sin-riesgo': 'bg-green-500/20 text-green-400',
  bajo: 'bg-yellow-500/20 text-yellow-400',
  medio: 'bg-orange-500/20 text-orange-400',
  alto: 'bg-red-500/20 text-red-400',
  'muy-alto': 'bg-red-700/20 text-red-500',
};

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Leve', medium: 'Moderada', high: 'Alta', critical: 'Crítica',
};

export default function AlertasDashboard() {
  const [subscriptions, setSubscriptions] = useState<AlertSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOpts: RequestInit = { credentials: 'include' };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts/subscribe', fetchOpts);
      const data = await res.json();
      console.log('AlertasDashboard GET response:', data);
      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
      } else if (data.alerts) {
        setSubscriptions(data.alerts);
      }
    } catch {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (countryCode: string) => {
    try {
      const res = await fetch(`/api/alerts/subscribe?countryCode=${countryCode}`, {
        ...fetchOpts,
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(prev => prev.filter(s => s.country_code !== countryCode));
      }
    } catch {
      setError('Error al cancelar');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando alertas...</span>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-white">Alertas personalizadas</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          No tienes alertas activas. Suscríbete desde Telegram con <code className="text-blue-300">/suscribir AU</code>.
        </p>
        <a
          href="https://t.me/ViajeConInteligenciaBot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir @ViajeConInteligenciaBot
        </a>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-white">Alertas activas ({subscriptions.length})</h3>
      </div>
      <div className="space-y-3">
        {subscriptions.map(sub => {
          const riesgoColor = RIESGO_COLOR[sub.nivel_riesgo || ''] || 'bg-slate-600 text-slate-300';
          return (
            <div key={sub.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{sub.country_emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{sub.country_name}</span>
                    {sub.nivel_riesgo && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${riesgoColor}`}>
                        {sub.nivel_riesgo}
                      </span>
                    )}
                  </div>
                    <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      Min: {SEVERITY_LABEL[sub.severity_min] || sub.severity_min}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">
                      {sub.alert_types?.join(', ') || 'todos'}
                    </span>
                    {sub.source === 'telegram' && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Telegram</span>
                    )}
                    {sub.source === 'telegram-no-vinculado' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Telegram ⚠️</span>
                    )}
                  </div>
                </div>
              </div>
              {sub.source !== 'telegram-no-vinculado' ? (
                <button
                  onClick={() => handleUnsubscribe(sub.country_code)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Cancelar alerta"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href="https://t.me/ViajeConInteligenciaBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                  title="Gestionar desde Telegram"
                >
                  Gestionar en TG
                </a>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700">
        <a
          href="https://t.me/ViajeConInteligenciaBot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Gestionar alertas desde Telegram
        </a>
      </div>
    </div>
  );
}
