'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Heart, MapPin, AlertTriangle, Trash2, 
  Plus, Mail, LogOut, Crown, Bell, Settings, Loader2,
  Cloud, CheckCircle, XCircle, Star, Sparkles, Activity,
  Key, Lock, User, Eye, EyeOff, KeyRound
} from 'lucide-react';
import TrialStatusBanner from '@/components/TrialStatusBanner';
import RecommendationsList from '@/components/RecommendationsList';
import { UserLevelBadge, trackActivity } from '@/components/UserLevel';
import { paisesData, getLabelRiesgo } from '@/data/paises';
import WeatherWidget from '@/components/WeatherWidget';
import { useAuth } from '@/contexts/AuthContext';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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
  const { user: authUser, loading: authLoading, signInWithPassword: authSignInPassword, signUpWithPassword, resetPassword, signOut: authSignOut } = useAuth();
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

  useEffect(() => {
    if (authUser) {
      setUser(authUser as User);
      setLoading(false);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    const handleMagicLink = async () => {
      const url = new URL(window.location.href);
      
      const success = url.searchParams.get('success');
      if (success === 'true') {
        setNotification({
          type: 'success',
          message: '¡Operación completada!'
        });
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.pathname);
      }
      
      const canceled = url.searchParams.get('canceled');
      if (canceled === 'true') {
        setNotification({
          type: 'error',
          message: 'Operación cancelada'
        });
        url.searchParams.delete('canceled');
        window.history.replaceState({}, '', url.pathname);
      }

      const reset = url.searchParams.get('reset');
      if (reset === 'true') {
        setShowChangePassword(true);
        url.searchParams.delete('reset');
        window.history.replaceState({}, '', url.pathname);
      }
      
      const telegramLogin = url.searchParams.get('telegram_login');
      if (telegramLogin && supabaseClient) {
        try {
          setNotification({
            type: 'success',
            message: '¡Sesión de Telegram iniciada! Ya puedes usar el dashboard.'
          });
          url.searchParams.delete('telegram_login');
          window.history.replaceState({}, '', url.pathname);
        } catch (err) {
          console.error('Telegram login error:', err);
          setNotification({
            type: 'error',
            message: 'Error al iniciar sesión con Telegram'
          });
        }
      }
      
      const error = url.searchParams.get('error');
      if (error) {
        setNotification({
          type: 'error',
          message: error
        });
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.pathname);
      }
      
      const hashParams = new URLSearchParams(url.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && supabaseClient) {
        try {
          const { error: sessionError } = await supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setNotification({
              type: 'error',
              message: 'Error al establecer sesión'
            });
          } else {
            setNotification({
              type: 'success',
              message: '¡Sesión iniciada correctamente!'
            });
          }
          window.history.replaceState({}, '', url.pathname);
        } catch (err) {
          console.error('Magic link error:', err);
          setNotification({
            type: 'error',
            message: 'Error al iniciar sesión'
          });
        }
      }
    };
    
    handleMagicLink();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/auth/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch {
      console.log('Error loading favorites');
    }
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

  const addFavorite = async (countryCode: string) => {
    try {
      const response = await fetch('/api/auth/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode }),
      });

      if (response.ok) {
        await loadFavorites();
        setShowAddCountry(false);
        setSearchCountry('');
        setNotification({ type: 'success', message: 'País añadido a favoritos' });
        trackActivity('add_favorite', { country: countryCode });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error al añadir favorito' });
    }
  };

  const removeFavorite = async (countryCode: string) => {
    try {
      const response = await fetch(`/api/auth/favorites?countryCode=${countryCode}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFavorites();
        setNotification({ type: 'success', message: 'País eliminado de favoritos' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error al eliminar favorito' });
    }
  };

  const filteredCountries = Object.values(paisesData).filter(p =>
    p.nombre.toLowerCase().includes(searchCountry.toLowerCase()) ||
    p.capital.toLowerCase().includes(searchCountry.toLowerCase())
  ).slice(0, 8);

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
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                    authMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔑 Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('magic')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                    authMode === 'magic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔗 Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
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
                      onChange={(e) => setEmail(e.target.value)}
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

                <button
                  type="submit"
                  disabled={loading}
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
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
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

        {favorites.length === 0 ? (
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
            {favorites.map((fav) => {
              const pais = paisesData[fav.country_code];
              if (!pais) return null;
              
              const riesgo = riesgoConfig[pais.nivelRiesgo];
              
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
          <Link href="/premium" className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-center hover:opacity-90 transition-opacity">
            <Crown className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="font-bold text-white">Hazte Premium</h3>
            <p className="text-white/70 text-sm">Alertas IA y más</p>
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
