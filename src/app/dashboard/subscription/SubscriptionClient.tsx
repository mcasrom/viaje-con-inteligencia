'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, CreditCard, Calendar, Download, ExternalLink, Settings, Loader2, AlertTriangle, CheckCircle, XCircle, Clock, Shield, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string;
  period_start: string | null;
  period_end: string | null;
}

interface Subscription {
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: {
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
  } | null;
}

interface BillingData {
  invoices: Invoice[];
  subscription: Subscription | null;
  profile_status: string | null;
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  active: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'Activa', icon: <CheckCircle className="w-4 h-4" /> },
  trialing: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', label: 'Trial', icon: <Clock className="w-4 h-4" /> },
  canceled: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Cancelada', icon: <XCircle className="w-4 h-4" /> },
  past_due: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Pago pendiente', icon: <AlertTriangle className="w-4 h-4" /> },
  none: { color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600/30', label: 'Sin suscripción', icon: <Shield className="w-4 h-4" /> },
};

export default function SubscriptionClient() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BillingData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscription/history');
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error al cargar datos');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setNotification({ type: 'error', message: json.error || 'No se pudo abrir el portal' });
        setPortalLoading(false);
      }
    } catch {
      setNotification({ type: 'error', message: 'Error de conexión' });
      setPortalLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Seguro que quieres cancelar? Perderás acceso Premium al final del periodo actual.')) return;
    setCancelLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'Suscripción cancelada. Acceso hasta fin del periodo.' });
        loadBillingData();
      } else {
        setNotification({ type: 'error', message: json.error || 'Error al cancelar' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error de conexión' });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al dashboard</span>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Inicia sesión para ver tu suscripción.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
            Iniciar sesión
          </Link>
        </main>
      </div>
    );
  }

  const subStatus = data?.profile_status || 'none';
  const status = statusConfig[subStatus] || statusConfig.none;
  const subscription = data?.subscription;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al dashboard</span>
          </Link>
          <span className="text-slate-400 text-sm">{authUser.email}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Crown className="w-7 h-7 text-yellow-400" />
          Gestión de Suscripción
        </h1>
        <p className="text-slate-400 mb-8">Plan actual, facturas y configuración</p>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Status Card */}
        <div className={`rounded-xl border p-6 mb-6 ${status.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status.icon}
              <div>
                <p className={`font-semibold ${status.color}`}>
                  {subStatus === 'active' ? 'Premium Activo' :
                   subStatus === 'trialing' ? 'Prueba Gratuita Activa' :
                   subStatus === 'canceled' ? 'Suscripción Cancelada' :
                   subStatus === 'past_due' ? 'Pago Pendiente' : 'Sin Suscripción'}
                </p>
                {subscription && (
                  <p className="text-slate-400 text-sm">
                    {subscription.cancel_at_period_end ? 'Acceso hasta el ' : 'Renovación el '}
                    {new Date(subscription.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} ${status.bg}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Plan Details */}
        {subscription && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Detalles del Plan
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-xs mb-1">Precio</p>
                <p className="text-white font-bold text-lg">
                  {subscription.plan ? `${(subscription.plan.amount / 100).toFixed(2)}€` : '—'}
                </p>
                <p className="text-slate-500 text-xs">
                  /{subscription.plan?.interval === 'year' ? 'año' : 'mes'}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-xs mb-1">Inicio periodo</p>
                <p className="text-white font-semibold text-sm">
                  {new Date(subscription.current_period_start).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-xs mb-1">Fin periodo</p>
                <p className="text-white font-semibold text-sm">
                  {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {data?.subscription && !data.subscription.cancel_at_period_end && (
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-900/30 border border-red-800/50 text-red-400 rounded-xl hover:bg-red-900/50 transition-colors disabled:opacity-50 font-medium"
            >
              {cancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
              Cancelar suscripción
            </button>
          )}
          {data?.subscription ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 font-medium"
            >
              {portalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
              Gestionar en Stripe
            </button>
          ) : (
            <Link
              href="/premium"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all font-bold"
            >
              <Crown className="w-5 h-5" />
              Activar Premium
            </Link>
          )}
        </div>

        {/* Invoices */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Historial de Facturas
            </h2>
          </div>

          {error && (
            <div className="p-6 text-center text-red-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <button onClick={loadBillingData} className="mt-2 text-blue-400 text-sm underline">Reintentar</button>
            </div>
          )}

          {!error && data?.invoices.length === 0 && (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No hay facturas todavía</p>
              <p className="text-slate-500 text-xs mt-1">Aparecerán aquí cuando se realice un pago</p>
            </div>
          )}

          {!error && data && data.invoices.length > 0 && (
            <div className="divide-y divide-slate-700">
              {data.invoices.map(inv => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                      inv.status === 'open' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{inv.description}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(inv.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {inv.period_end && (
                          <span>
                            · {new Date(inv.period_start!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            {' - '}
                            {new Date(inv.period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">{inv.amount.toFixed(2)}€</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                      inv.status === 'open' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {inv.status === 'paid' ? 'Pagada' : inv.status === 'open' ? 'Pendiente' : inv.status}
                    </span>
                    {inv.hosted_invoice_url && (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        title="Ver factura"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {inv.invoice_pdf && (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
