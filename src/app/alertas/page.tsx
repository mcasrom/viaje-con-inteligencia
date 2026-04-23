'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, BellOff, Plus, Trash2, Globe, Mail, Smartphone, AlertTriangle, CheckCircle, Loader2, Plane } from 'lucide-react';

interface AlertPreference {
  country_code: string;
  country_name: string;
  nivel_riesgo: string;
  methods: string[];
}

const ALL_COUNTRIES = [
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: 'EG', name: 'Egipto', flag: '🇪🇬' },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦' },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'KH', name: 'Camboya', flag: '🇰🇭' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'RO', name: 'Rumania', flag: '🇷🇴' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'BZ', name: 'Belice', flag: '🇧🇿' },
  { code: 'FJ', name: 'Fiyi', flag: '🇫🇯' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts/subscribe?userId=demo');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async () => {
    if (!selectedCountry) return;
    
    try {
      setAdding(true);
      const country = ALL_COUNTRIES.find(c => c.code === selectedCountry);
      
      const newAlert: AlertPreference = {
        country_code: country!.code,
        country_name: country!.name,
        nivel_riesgo: 'bajo',
        methods: ['telegram']
      };
      
      setAlerts([...alerts, newAlert]);
      setSelectedCountry('');
      setNotification({ type: 'success', message: `Alerta añadida para ${country!.name}` });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setNotification({ type: 'error', message: 'Error al añadir alerta' });
    } finally {
      setAdding(false);
    }
  };

  const removeAlert = (code: string) => {
    setAlerts(alerts.filter(a => a.country_code !== code));
    setNotification({ type: 'success', message: 'Alerta eliminada' });
    setTimeout(() => setNotification(null), 3000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'sin-riesgo': return 'text-green-400 bg-green-500/20';
      case 'bajo': return 'text-yellow-400 bg-yellow-500/20';
      case 'medio': return 'text-orange-400 bg-orange-500/20';
      case 'alto': return 'text-red-400 bg-red-500/20';
      case 'muy-alto': return 'text-red-600 bg-red-700/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            ← Volver
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            <Bell className="w-4 h-4" />
            Alertas Personalizadas
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🔔 Configura tus Alertas
          </h1>
          <p className="text-slate-400">
            Recibe notificaciones cuando cambie el nivel de riesgo de tus países favoritos
          </p>
          <p className="text-slate-500 text-sm mt-2">
            💡 <strong>Complemento alBot:</strong> Aquí configuras alertas de <em>riesgo país</em> (MAEC). En el Bot usa <code>/alertasviaje</code> para <em>retrasos de vuelos, trenes y clima</em>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <a 
            href="https://t.me/ViajeConInteligenciaBot" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <Plane className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-white font-medium">🤖 Bot de Alertas</p>
              <p className="text-slate-400 text-sm">/alertasviaje para机场, trenes, clima</p>
            </div>
          </a>
          <a 
            href="https://t.me/ViajeConInteligencia" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-white font-medium">📢 Canal de Alertas</p>
              <p className="text-slate-400 text-sm">Resumen diario automático</p>
            </div>
          </a>
        </div>

        {notification && (
          <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
            notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Añadir Alerta
          </h2>
          
          <div className="flex gap-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecciona un país...</option>
              {ALL_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={addAlert}
              disabled={!selectedCountry || adding}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-slate-400 mt-4">Cargando alertas...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <BellOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sin alertas configuradas</h3>
            <p className="text-slate-400 mb-6">
              Añade países para recibir alertas cuando cambie el nivel de riesgo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.country_code}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {ALL_COUNTRIES.find(c => c.code === alert.country_code)?.flag}
                  </span>
                  <div>
                    <h3 className="text-white font-medium">{alert.country_name}</h3>
                    <p className="text-slate-400 text-sm">Código: {alert.country_code}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(alert.nivel_riesgo)}`}>
                    {alert.nivel_riesgo}
                  </span>
                  
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg" title="Telegram">
                      <Smartphone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg" title="Email">
                      <Mail className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => removeAlert(alert.country_code)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg" 
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            🔔 ¿Por qué configurar alertas?
          </h3>
          <p className="text-white/80 text-sm mb-4">
            El MAEC actualiza los niveles de riesgo. Recibe notificaciones inmediatas.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <Smartphone className="w-4 h-4" /> Telegram
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Mail className="w-4 h-4" /> Email
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
            <p className="mb-1"><strong>Nota:</strong> Esta página es para <em>alertas de riesgo país</em>.</p>
            <p>Usa el Bot <code>@ViajeConInteligenciaBot</code> para <em>alertas de viajes</em> (vuelos, trenes, clima).</p>
          </div>
        </div>
      </div>
    </div>
  );
}