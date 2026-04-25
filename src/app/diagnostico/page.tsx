'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Mail, ExternalLink, User, CreditCard, Shield, Clock } from 'lucide-react';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export default function DiagnosticoPage() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  const runChecks = async () => {
    setLoading(true);
    const results: CheckResult[] = [];

    results.push({
      name: 'Configuración Supabase',
      status: 'pending',
      message: 'Verificando...',
    });

    results.push({
      name: 'Autenticación',
      status: 'pending',
      message: 'Verificando...',
    });

    results.push({
      name: 'Suscripción Premium',
      status: 'pending',
      message: 'Verificando...',
    });

    results.push({
      name: 'Stripe',
      status: 'pending',
      message: 'Verificando...',
    });

    results.push({
      name: 'Base de datos profiles',
      status: 'pending',
      message: 'Verificando...',
    });

    results.push({
      name: 'Webhook configurado',
      status: 'pending',
      message: 'Verificando...',
    });

    setChecks(results);

    await new Promise(r => setTimeout(r, 500));

    try {
      const [supabaseRes, subRes, stripeRes] = await Promise.all([
        fetch('/api/subscription/check').catch(() => null),
        fetch('/api/subscription').catch(() => null),
        fetch('/api/health').catch(() => null),
      ]);

      const newResults = [...results];

      const supabaseOk = supabaseRes?.ok && supabaseRes.status !== 500;
      newResults[0] = {
        name: 'Configuración Supabase',
        status: supabaseOk ? 'pass' : 'fail',
        message: supabaseOk ? 'Supabase configurado correctamente' : 'Error de conexión',
        details: supabaseOk ? 'URL y clave configuradas' : 'Verificar variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
      };

      if (supabaseRes) {
        const subData = await supabaseRes.json();
        if (subData.status === 'no_session') {
          newResults[1] = {
            name: 'Autenticación',
            status: 'warning',
            message: 'No hay sesión activa',
            details: 'Inicia sesión para verificar tu suscripción',
          };
        } else if (subData.status === 'no_configured') {
          newResults[1] = {
            name: 'Autenticación',
            status: 'fail',
            message: 'Sistema no configurado',
            details: 'Supabase no está configurado correctamente',
          };
        } else {
          newResults[1] = {
            name: 'Autenticación',
            status: 'pass',
            message: 'Sesión verificada',
            details: subData.email || 'Usuario activo',
          };
        }

        if (subData.premium) {
          newResults[2] = {
            name: 'Suscripción Premium',
            status: 'pass',
            message: 'Acceso Premium ACTIVO',
            details: `Estado: ${subData.status}`,
          };
        } else {
          newResults[2] = {
            name: 'Suscripción Premium',
            status: 'warning',
            message: subData.message || 'No tienes acceso Premium',
            details: 'Suscríbete para desbloquear todas las funciones',
          };
        }
      }

      if (stripeRes?.ok) {
        const stripeData = await stripeRes.json();
        newResults[3] = {
          name: 'Stripe',
          status: stripeData.stripe_configured ? 'pass' : 'warning',
          message: stripeData.stripe_configured ? 'Stripe configurado' : 'Stripe no disponible',
          details: stripeData.stripe_configured ? 'Pagos habilitados' : 'Verificar STRIPE_SECRET_KEY',
        };
      }

      setChecks(newResults);
      setLastCheck(new Date().toLocaleString('es-ES'));
    } catch (error) {
      console.error('Check error:', error);
      setChecks(prev => prev.map((r, i) => i < 4 ? { ...r, status: 'fail' as const, message: 'Error en verificación' } : r));
    }

    setLoading(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />;
    }
  };

  const statusCounts = checks.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-blue-400 text-sm">Diagnóstico del sistema</p>
              </div>
            </Link>
            <Link href="/premium" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors">
              Premium
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            <Shield className="w-8 h-8 inline mr-2 text-blue-400" />
            Diagnóstico del Sistema
          </h2>
          <p className="text-slate-400">
            Verifica el estado de tu suscripción y configuración
          </p>
          {lastCheck && (
            <p className="text-slate-500 text-sm mt-2">
              Última verificación: {lastCheck}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{statusCounts.pass || 0}</div>
            <div className="text-green-300 text-sm">Correctos</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{statusCounts.warning || 0}</div>
            <div className="text-yellow-300 text-sm">Advertencias</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{statusCounts.fail || 0}</div>
            <div className="text-red-300 text-sm">Errores</div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className={`flex items-start gap-4 p-4 rounded-xl ${
                check.status === 'pass' ? 'bg-green-500/5 border border-green-500/20' :
                check.status === 'fail' ? 'bg-red-500/5 border border-red-500/20' :
                check.status === 'warning' ? 'bg-yellow-500/5 border border-yellow-500/20' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{check.name}</h4>
                  <p className="text-slate-400 text-sm">{check.message}</p>
                  {check.details && (
                    <p className="text-slate-500 text-xs mt-1">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={runChecks}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Verificar de nuevo
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            ¿Necesitas ayuda?
          </h3>
          <p className="text-slate-400 mb-4">
            Si tienes problemas con tu suscripción o acceso, contacta con nuestro equipo:
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="mailto:info@viajeinteligencia.com?subject=Problema%20de%20acceso%20Premium&body=Nombre:%20%0D%0AEmail:%20%0D%0AProblema:%20"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@viajeinteligencia.com
            </a>
            <Link 
              href="/premium"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Ver planes Premium
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}