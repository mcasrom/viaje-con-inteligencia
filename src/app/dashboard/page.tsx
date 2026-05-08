'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowserClient as supabaseClient } from '@/lib/supabase-browser';
import { 
  ArrowLeft, Heart, MapPin, AlertTriangle, Trash2, 
  Plus, Mail, LogOut, Crown, Bell, Loader2, Calendar,
  CheckCircle, XCircle, Star, Activity,
  Key, Lock, User, Eye, EyeOff, KeyRound
} from 'lucide-react';
import dynamic from 'next/dynamic';
import TrialStatusBanner from '@/components/TrialStatusBanner';
import RecommendationsList from '@/components/RecommendationsList';
import { UserLevelBadge, trackActivity } from '@/components/UserLevel';
import { paisesData, getLabelRiesgo } from '@/data/paises';
import WeatherWidget from '@/components/WeatherWidget';
import EventTimeline from '@/components/EventTimeline';
import { useAuth } from '@/contexts/AuthContext';

const Turnstile = dynamic(() => import('@marsidev/react-turnstile').then(m => m.Turnstile), { ssr: false });

interface User {
  id: string;
  email?: string;
  telegram_id?: string;
  username?: string;
}

interface Favorite {
  id: string;
  country_code: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user: authUser, loading: authLoading, signInWithPassword: authSignInPassword, signUpWithPassword, resetPassword, signOut: authSignOut, signInWithEmail, emailVerified, resendVerificationEmail } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'magic'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [favError, setFavError] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent'>('idle');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleResendVerification = async () => {
    setResendLoading(true);
    const result = await resendVerificationEmail();
    if (!result?.error) setResendStatus('sent');
    setResendLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const body: Record<string, string> = { email };

      if (authMode === 'login' && password) {
        body.password = password;
        body.mode = 'password';
      } else if (authMode === 'register' && password) {
        body.password = password;
        body.mode = 'register';
        body.turnstileToken = turnstileToken;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (authMode === 'login' && password) {
          setNotification({ type: 'success', message: data.message });
          setUser({ email, id: '' });
        } else {
          setNotification({ type: 'success', message: data.message });
        }
        setEmail('');
        setPassword('');
      } else if (data.needsVerification) {
        setNotification({
          type: 'error',
          message: 'Email no verificado. Revisa tu bandeja de entrada o solicita un nuevo enlace.',
        });
        setPendingVerificationEmail(data.email);
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al autenticar' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authSignOut();
    setUser(null);
    setFavorites([]);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, action: 'reset' }),
      });
      const data = await response.json();

      if (response.ok) {
        setNotification({ type: 'success', message: data.message });
        setShowResetPassword(false);
        setResetEmail('');
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al enviar enlace' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setNotification({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    setLoading(true);
    setNotification(null);

    try {
      if (!supabaseClient) throw new Error('Supabase no configurado');
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        setNotification({ type: 'error', message: error.message });
      } else {
        setNotification({ type: 'success', message: '✅ Contraseña actualizada correctamente' });
        setShowChangePassword(false);
        setNewPassword('');
      }
    } catch {
      setNotification({ type: 'error', message: 'Error al actualizar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/auth/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  const addFavorite = async (countryCode: string) => {
    try {
      const response = await fetch('/api/auth/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadFavorites();
        setShowAddCountry(false);
        setSearchCountry('');
        setNotification({ type: 'success', message: 'País añadido a favoritos' });
        trackActivity('add_favorite', { country: countryCode });
      } else {
        setNotification({ 
          type: 'error', 
          message: data.error || `Error (${response.status}) al añadir favorito` 
        });
      }
    } catch (err) {
      console.error('Add favorite error:', err);
      setNotification({ type: 'error', message: 'Error al añadir favorito' });
    }
  };

  const removeFavorite = async (countryCode: string) => {
    try {
      
      const response = await fetch(`/api/auth/favorites?countryCode=${countryCode}`, {
        method: 'DELETE',
        
      });

      const data = await response.json();

      if (response.ok) {
        await loadFavorites();
        setNotification({ type: 'success', message: 'País eliminado de favoritos' });
      } else {
        setNotification({ 
          type: 'error', 
          message: data.error || `Error (${response.status}) al eliminar favorito` 
        });
      }
    } catch (err) {
      console.error('Remove favorite error:', err);
      setNotification({ type: 'error', message: 'Error al eliminar favorito' });
    }
  };

  const filteredCountries = searchCountry
    ? Object.values(paisesData).filter(p =>
        p.codigo !== 'cu' &&
        (p.nombre.toLowerCase().includes(searchCountry.toLowerCase()) ||
        p.capital.toLowerCase().includes(searchCountry.toLowerCase()))
      )
    : Object.values(paisesData).filter(p => p.codigo !== 'cu').slice(0, 50);

  const riesgoConfig: Record<string, { color: string; bg: string }> = {
    'sin-riesgo': { color: 'text-green-400', bg: 'bg-green-500' },
    'bajo': { color: 'text-yellow-400', bg: 'bg-yellow-500' },
    'medio': { color: 'text-orange-400', bg: 'bg-orange-500' },
    'alto': { color: 'text-red-400', bg: 'bg-red-500' },
    'muy-alto': { color: 'text-red-600', bg: 'bg-red-900' },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-md mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto px-6 py-8">
          {/* Login Status Indicator */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-medium text-sm">No has iniciado sesión</p>
              <p className="text-amber-200/60 text-xs">Inicia sesión para acceder a tus favoritos y viajes</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Tu Panel Personal</h1>
            <p className="text-slate-400">Guarda países favoritos y recibe alertas</p>
          </div>

          {notification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {notification.message}
              <button onClick={() => setNotification(null)} className="ml-auto">✕</button>
            </div>
          )}

          {/* Reset Password Form */}
          {showResetPassword ? (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Recuperar contraseña</h2>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Email de la cuenta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                    Enviar enlace
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              {/* Auth Mode Tabs */}
              <div className="flex gap-1 mb-6 bg-slate-700/50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setPendingVerificationEmail(null); }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                    authMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔑 Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('magic'); setPendingVerificationEmail(null); }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                    authMode === 'magic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔗 Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setPendingVerificationEmail(null); }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                    authMode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📝 Registro
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setPendingVerificationEmail(null); }}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Password field for login/register */}
                {(authMode === 'login' || authMode === 'register') && (
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {authMode === 'register' && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={setTurnstileToken}
                    options={{ theme: 'dark' }}
                  />
                )}

                <button
                  type="submit"
                  disabled={loading || (authMode === 'register' && !turnstileToken && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {authMode === 'login' ? (
                        <><Key className="w-5 h-5" />Iniciar sesión</>
                      ) : authMode === 'register' ? (
                        <><User className="w-5 h-5" />Crear cuenta</>
                      ) : (
                        <><Mail className="w-5 h-5" />Enviar enlace mágico</>
                      )}
                    </>
                  )}
                </button>

                {/* Forgot password link */}
                {authMode === 'login' && !pendingVerificationEmail && (
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

                {/* Resend verification email */}
                {pendingVerificationEmail && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-300 text-sm font-medium mb-2">Email no verificado</p>
                    <p className="text-amber-200/60 text-xs mb-3">Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de verificación.</p>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch('/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: pendingVerificationEmail }),
                        });
                        const data = await res.json();
                        setNotification({ type: res.ok ? 'success' : 'error', message: data.message || data.error });
                      }}
                      className="text-blue-400 text-xs hover:text-blue-300 underline"
                    >
                      Reenviar email de verificación
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            También puedes usar el bot de Telegram para acceder
          </p>
          
          <a 
            href="https://t.me/ViajeConInteligenciaBot?start=login"
            className="block mt-4 text-center py-3 bg-[#0088cc] text-white rounded-lg font-bold hover:bg-[#0077b3] transition-colors"
          >
            Iniciar sesión con Telegram
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al mapa</span>
            </Link>
            <div className="flex items-center gap-3">
              {/* Login Status Indicator */}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-xs font-medium hidden sm:block">Conectado</span>
                <span className="text-slate-300 text-xs font-medium">{user.email}</span>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Cambiar contraseña"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Email Verification Banner */}
        {!emailVerified && user && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 font-medium text-sm">Verifica tu email</p>
              <p className="text-amber-200/60 text-xs mt-1">Revisa tu bandeja de entrada (y spam) para confirmar tu cuenta.</p>
              {resendStatus === 'sent' ? (
                <p className="text-emerald-400 text-xs mt-2">✓ Email reenviado</p>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-blue-400 text-xs mt-2 hover:text-blue-300 underline disabled:opacity-50"
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar email de verificación'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowChangePassword(false)}>
            <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Cambiar contraseña</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* TRIAL STATUS */}
        <TrialStatusBanner />

        {/* USER LEVEL / GAMIFICATION */}
        <UserLevelBadge />

        {/* Banner KPIs destacado */}
        <Link href="/dashboard/kpis" className="block mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-white" />
              <div>
                <span className="text-blue-200 text-xs font-medium">NUEVO</span>
                <h3 className="text-white font-bold">📊 Dashboard de KPIs de Seguridad</h3>
                <p className="text-blue-200 text-sm">Riesgo político, aéreo, restricciones y recomendaciones IA</p>
              </div>
            </div>
            <span className="text-white font-bold">→</span>
          </div>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Heart className="w-7 h-7 text-red-500" />
              Mis Favoritos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {favorites.length} país{favorites.length !== 1 ? 'es' : ''} guardado{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAddCountry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Añadir país</span>
          </button>
        </div>

        {showAddCountry && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Buscar país</h3>
              <button onClick={() => { setShowAddCountry(false); setSearchCountry(''); }} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <input
              type="text"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              placeholder="Escribe el nombre del país..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCountries.map((pais) => {
                const isFavorite = favorites.some(f => f.country_code === pais.codigo);
                return (
                  <div
                    key={pais.codigo}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pais.bandera}</span>
                      <div>
                        <p className="text-white font-medium">{pais.nombre}</p>
                        <p className="text-slate-400 text-sm">{pais.capital}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isFavorite && addFavorite(pais.codigo)}
                      disabled={isFavorite}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite 
                          ? 'bg-green-600/20 text-green-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFavorite ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {favError ? (
          <div className="bg-red-900/20 rounded-xl p-12 border border-red-800 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error al cargar favoritos</h3>
            <p className="text-slate-400 mb-6">
              No se pudo conectar con la base de datos. Verifica tu sesión o intenta más tarde.
            </p>
            <button
              onClick={loadFavorites}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sin favoritos aún</h3>
            <p className="text-slate-400 mb-6">
              Guarda países para ver su información, clima y recibir alertas personalizadas.
            </p>
            <button
              onClick={() => setShowAddCountry(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Añadir tu primer país
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.filter(f => f.country_code !== 'cu').map((fav) => {
              const pais = paisesData[fav.country_code];
              if (!pais) return null;
              
              const riesgo = riesgoConfig[pais.nivelRiesgo] || { color: 'text-slate-400', bg: 'bg-slate-500' };
              
              return (
                <div key={fav.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <Link href={`/pais/${pais.codigo}`} className="flex items-center gap-4 flex-1 group">
                      <span className="text-4xl">{pais.bandera}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {pais.nombre}
                        </h3>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {pais.capital}
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${riesgo.bg} text-white`}>
                            {getLabelRiesgo(pais.nivelRiesgo)}
                          </span>
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pais/${pais.codigo}`}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                      >
                        Ver detalles
                      </Link>
                      <button
                        onClick={() => removeFavorite(pais.codigo)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar de favoritos"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <WeatherWidget 
                      lat={pais.mapaCoordenadas[0]} 
                      lon={pais.mapaCoordenadas[1]} 
                      countryName={pais.nombre}
                      compact
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Próximos eventos en tus favoritos
            </h2>
            <div className="space-y-6">
              {favorites.map(fav => {
                const pais = paisesData[fav.country_code];
                if (!pais) return null;
                return (
                  <EventTimeline
                    key={fav.id}
                    country={pais.nombre}
                    days={60}
                    limit={5}
                    title={pais.nombre}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Recomendaciones para ti
          </h2>
          <RecommendationsList favorites={favorites.map(f => f.country_code)} />
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <Link href="/dashboard/kpis" className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-center hover:opacity-90 transition-opacity">
            <Activity className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="font-bold text-white">KPIs de Riesgo</h3>
            <p className="text-white/70 text-sm">Dashboard en vivo</p>
          </Link>
          <Link href="/dashboard/subscription" className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl p-6 text-center hover:opacity-90 transition-opacity">
            <Crown className="w-8 h-8 text-slate-900 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900">Mi Suscripción</h3>
            <p className="text-slate-800/70 text-sm">Plan, facturas y gestión</p>
          </Link>
          <Link href="/checklist" className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center hover:border-slate-600 transition-colors">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-bold text-white">Checklist</h3>
            <p className="text-slate-400 text-sm">+80 items para tu viaje</p>
          </Link>
          <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" 
             className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center hover:border-slate-600 transition-colors">
            <Bell className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-bold text-white">Bot Telegram</h3>
            <p className="text-slate-400 text-sm">Alertas en tu móvil</p>
          </a>
        </div>
      </main>
    </div>
  );
}
