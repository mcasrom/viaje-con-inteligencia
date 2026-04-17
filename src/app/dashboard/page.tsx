'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Heart, MapPin, AlertTriangle, Trash2, 
  Plus, Mail, LogOut, Crown, Bell, Settings, Loader2,
  Cloud, CheckCircle, XCircle
} from 'lucide-react';
import { paisesData, getLabelRiesgo } from '@/data/paises';
import WeatherWidget from '@/components/WeatherWidget';

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
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    const handleMagicLink = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check URL params
      const token = params.get('token') || params.get('access_token');
      const type = params.get('type') || 'email_confirm';
      
      console.log('URL params:', Object.fromEntries(params));
      console.log('Hash params:', Object.fromEntries(hashParams));
      
      if (token && supabaseClient) {
        try {
          console.log('Exchanging token:', token.substring(0, 20) + '...');
          
          // Try different approaches
          let error = null;
          
          // First try: exchangeCodeForSession (for verification tokens)
          if (params.get('code')) {
            const result = await supabaseClient.auth.exchangeCodeForSession(params.get('code')!);
            error = result.error;
          } else if (token) {
            // For magic links, set session directly
            const result = await supabaseClient.auth.setSession({
              access_token: token,
              refresh_token: params.get('refresh_token') || hashParams.get('refresh_token') || '',
            });
            error = result.error;
          }
          
          if (!error) {
            console.log('Session set successfully!');
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
            checkUser();
          } else {
            console.error('Error setting session:', error);
          }
        } catch (err) {
          console.error('Magic link error:', err);
        }
      }
    };
    
    handleMagicLink();
  }, []);

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch {
      console.log('No authenticated');
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
      console.log('Error loading favorites');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setNotification(null);

    console.log('Enviando login para:', email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode: authMode }),
      });

      const data = await response.json();
      console.log('Respuesta login:', response.status, data);

      if (response.ok) {
        setNotification({ 
          type: 'success', 
          message: 'Revisa tu email para iniciar sesión' 
        });
        setEmail('');
      } else {
        console.error('Error del servidor:', response.status, data);
        setNotification({ type: 'error', message: data.error || 'Error al enviar enlace' });
      }
    } catch (err: any) {
      console.error('Error login:', err);
      setNotification({ type: 'error', message: err.message || 'Error de conexión' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setFavorites([]);
    } catch {
      console.log('Error al cerrar sesión');
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

  if (loading) {
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

        <main className="max-w-md mx-auto px-6 py-12">
          <div className="text-center mb-8">
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
            </div>
          )}

          <form onSubmit={handleAuth} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  authMode === 'login' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  authMode === 'register' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                Registrarse
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

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    {authMode === 'login' ? 'Enviar enlace de acceso' : 'Crear cuenta'}
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            También puedes usar el bot de Telegram para acceder
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-auto">✕</button>
          </div>
        )}

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

        <div className="mt-12 grid md:grid-cols-3 gap-4">
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
