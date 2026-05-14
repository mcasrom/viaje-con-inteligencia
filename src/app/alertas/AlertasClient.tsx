'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, BellOff, Plus, Trash2, Globe, AlertTriangle, CheckCircle, Loader2, Plane, ExternalLink, ChevronDown, Shield, MapPin, Clock, Link as LinkIcon, Check } from 'lucide-react';

interface MAECAlert {
  pais: string;
  codigo: string;
  nivelRiesgo: string;
  url: string;
  bandera: string;
}

interface AlertPreference {
  country_code: string;
  country_name: string;
  nivel_riesgo: string;
  methods: string[];
}

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  'muy-alto': { label: 'Muy alto', color: 'text-red-300', bg: 'bg-red-900/40 border-red-800/50', icon: '🔴', desc: 'No viajar. Riesgo extremo para la vida.' },
  'alto': { label: 'Alto', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: '🔴', desc: 'Evitar viajes no esenciales.' },
  'medio': { label: 'Medio', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', icon: '🟠', desc: 'Precaución reforzada. Posibles incidentes.' },
  'bajo': { label: 'Bajo', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', icon: '🟡', desc: 'Riesgo menor. Precauciones habituales.' },
  'sin-riesgo': { label: 'Sin riesgo', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', icon: '🟢', desc: 'Destino seguro. Precauciones normales.' },
};

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
  { code: 'UA', name: 'Ucrania', flag: '🇺🇦' },
  { code: 'RU', name: 'Rusia', flag: '🇷🇺' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'PS', name: 'Palestina', flag: '🇵🇸' },
  { code: 'SY', name: 'Siria', flag: '🇸🇾' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶' },
  { code: 'AF', name: 'Afganistán', flag: '🇦🇫' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'LY', name: 'Libia', flag: '🇱🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'HT', name: 'Haití', flag: '🇭🇹' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'RO', name: 'Rumania', flag: '🇷🇴' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
];

function getFlag(code: string): string {
  return ALL_COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase())?.flag || '🌍';
}

interface AlertCounts {
  muyAlto: number;
  alto: number;
  medio: number;
}

interface AlertasClientProps {
  initialAlerts: {
    pais: string;
    codigo: string;
    nivelRiesgo: string;
    url: string;
    bandera: string;
  }[];
  initialCounts: AlertCounts;
}

export default function AlertasClient({ initialAlerts, initialCounts }: AlertasClientProps) {
  const [globalAlerts, setGlobalAlerts] = useState<MAECAlert[]>(initialAlerts);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showPersonal, setShowPersonal] = useState(false);
  const [alerts, setAlerts] = useState<AlertPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const [filter, setFilter] = useState<'todas' | 'medio' | 'alto'>('alto');
  const [vincularCode, setVincularCode] = useState('');
  const [vincularLoading, setVincularLoading] = useState(false);
  const [vincularStatus, setVincularStatus] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const [vinculado, setVinculado] = useState(false);

  const [alertCount, setAlertCount] = useState(initialCounts);

  useEffect(() => {
    fetchGlobalAlerts();
  }, []);

  const fetchGlobalAlerts = async () => {
    try {
      const fallback = buildFallbackAlerts();
      const res = await fetch('/api/maec?alerts=true');
      const data = await res.json();
      const rawAlerts = data.alerts || [];
      if (res.ok && rawAlerts.length > 0 && !data.error) {
        const apiAlerts: MAECAlert[] = rawAlerts.map((a: any) => ({
          pais: a.pais,
          codigo: a.codigo || '',
          nivelRiesgo: a.nivelRiesgo,
          url: a.url,
          bandera: getFlag(a.codigo || a.pais.substring(0, 2).toLowerCase()),
        }));
        const apiCodes = new Set(apiAlerts.map(a => a.codigo));
        const merged = [...apiAlerts, ...fallback.filter(f => !apiCodes.has(f.codigo))];
        setGlobalAlerts(merged);
        setAlertCount({
          muyAlto: merged.filter(a => a.nivelRiesgo === 'muy-alto').length,
          alto: merged.filter(a => a.nivelRiesgo === 'alto').length,
          medio: merged.filter(a => a.nivelRiesgo === 'medio').length,
        });
      } else {
        setGlobalAlerts(fallback);
      }
    } catch {
      setGlobalAlerts(buildFallbackAlerts());
    } finally {
      setGlobalLoading(false);
    }
  };

  const buildFallbackAlerts = (): MAECAlert[] => {
    const knownAlerts = [
      { pais: 'Ucrania', codigo: 'ua', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Rusia', codigo: 'ru', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Israel', codigo: 'il', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Afganistán', codigo: 'af', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Siria', codigo: 'sy', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Yemen', codigo: 'ye', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Irak', codigo: 'iq', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Somalia', codigo: 'so', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Libia', codigo: 'ly', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Venezuela', codigo: 've', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Myanmar', codigo: 'mm', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Haití', codigo: 'ht', nivelRiesgo: 'alto', url: 'https://www.exteriores.gob.es' },
      { pais: 'Irán', codigo: 'ir', nivelRiesgo: 'muy-alto', url: 'https://www.exteriores.gob.es' },
    ];
    return knownAlerts.map(a => ({
      ...a,
      bandera: getFlag(a.codigo),
    }));
  };

  const fetchOpts: RequestInit = { credentials: 'include' };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts/subscribe', fetchOpts);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || data.subscriptions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async () => {
    if (!selectedCountry) return;
    setAdding(true);
    const country = ALL_COUNTRIES.find(c => c.code === selectedCountry);
    if (!country) { setAdding(false); return; }
    const optimistic = [...alerts, {
      country_code: country.code, country_name: country.name, nivel_riesgo: 'bajo' as const, methods: ['telegram'] as string[]
    }];
    setAlerts(optimistic);
    setSelectedCountry('');
    try {
      const res = await fetch('/api/alerts/subscribe', {
        ...fetchOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: country.code, method: 'telegram' }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotification({ type: 'success', message: `Alerta añadida para ${country.name}` });
      } else {
        setAlerts(alerts);
        setNotification({ type: 'error', message: resData.error || `Error ${res.status}` });
      }
    } catch {
      setAlerts(alerts);
      setNotification({ type: 'error', message: 'Error de conexión' });
    } finally {
      setAdding(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const removeAlert = async (code: string) => {
    const previous = [...alerts];
    setAlerts(alerts.filter(a => a.country_code !== code));
    try {
      const res = await fetch(`/api/alerts/subscribe?countryCode=${code}`, { ...fetchOpts, method: 'DELETE' });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotification({ type: 'success', message: 'Alerta eliminada' });
      } else {
        setAlerts(previous);
        setNotification({ type: 'error', message: resData.error || `Error ${res.status}` });
      }
    } catch {
      setAlerts(previous);
      setNotification({ type: 'error', message: 'Error de conexión' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVerifyCode = async () => {
    if (vincularCode.length < 4) return;
    setVincularLoading(true);
    setVincularStatus(null);
    try {
      const res = await fetch('/api/user/verify-vincular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: vincularCode }),
      });
      const data = await res.json();
      if (data.ok) {
        setVinculado(true);
        setVincularStatus({ type: 'success', message: '✅ Cuenta vinculada correctamente. Tus alertas de Telegram ya aparecen en el dashboard.' });
        setVincularCode('');
      } else if (res.status === 401) {
        setVincularStatus({ type: 'error', message: 'Debes iniciar sesión primero.' });
      } else {
        setVincularStatus({ type: 'error', message: data.error || 'Error al vincular' });
      }
    } catch {
      setVincularStatus({ type: 'error', message: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setVincularLoading(false);
      setTimeout(() => setVincularStatus(null), 8000);
    }
  };

  const filteredAlerts = filter === 'todas'
    ? globalAlerts
    : filter === 'alto'
      ? globalAlerts.filter(a => a.nivelRiesgo === 'muy-alto' || a.nivelRiesgo === 'alto')
      : globalAlerts.filter(a => a.nivelRiesgo === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" />Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Bell className="w-8 h-8 text-red-400" />Alertas MAEC en Vivo
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Todas las alertas activas del Ministerio de Asuntos Exteriores. Riesgos por conflicto, inestabilidad política, terrorismo y desastres naturales.
          </p>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{alertCount.muyAlto}</div>
            <div className="text-red-300/70 text-xs mt-1">Riesgo Muy Alto</div>
          </div>
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{alertCount.alto}</div>
            <div className="text-orange-300/70 text-xs mt-1">Riesgo Alto</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{alertCount.medio}</div>
            <div className="text-yellow-300/70 text-xs mt-1">Riesgo Medio</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50">
          <button
            onClick={() => setFilter('alto')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'alto' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🔴 Riesgo Alto+
          </button>
          <button
            onClick={() => setFilter('medio')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'medio' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🟠 Riesgo Medio+
          </button>
          <button
            onClick={() => setFilter('todas')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'todas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Todas
          </button>
        </div>

        {/* Alert Feed */}
        {globalLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Cargando alertas del MAEC...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sin alertas de riesgo alto</h3>
            <p className="text-slate-400">No hay alertas activas para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {filteredAlerts.map((alert, idx) => {
              const risk = RISK_CONFIG[alert.nivelRiesgo] || RISK_CONFIG['bajo'];
              return (
                <div
                  key={`${alert.codigo}-${idx}`}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{alert.bandera}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold text-lg">{alert.pais}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${risk.bg} ${risk.color}`}>
                          {risk.icon} {risk.label}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{risk.desc}</p>
                    </div>
                    <a
                      href={`https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=${encodeURIComponent(alert.pais)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Ver ficha MAEC"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Personal Alerts Section */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <button
            onClick={() => {
              setShowPersonal(!showPersonal);
              if (!showPersonal && alerts.length === 0) loadAlerts();
            }}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-bold text-lg">Alertas Personalizadas</h2>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{alerts.length}</span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showPersonal ? 'rotate-180' : ''}`} />
          </button>

          {showPersonal && (
            <div className="p-5 border-t border-slate-700/50 space-y-4">
              <p className="text-slate-400 text-sm">
                Configura alertas para tus países favoritos. Te notificaremos cuando cambie el nivel de riesgo MAEC.
              </p>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://t.me/ViajeConInteligenciaBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                >
                  <Plane className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">🤖 Bot Telegram</p>
                    <p className="text-slate-500 text-xs">Vuelos, trenes, clima</p>
                  </div>
                </a>
                <a
                  href="https://t.me/ViajeConInteligencia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white text-sm font-medium">📢 Canal Telegram</p>
                    <p className="text-slate-500 text-xs">Resumen diario</p>
                  </div>
                </a>
              </div>

              {/* Vincular sección */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-600/30">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-400" />Vincular cuenta web
                </h3>
                {vinculado ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Check className="w-4 h-4" />Cuenta vinculada correctamente
                  </div>
                ) : (
                  <>
                    <p className="text-slate-400 text-sm mb-4">
                      Conecta tu cuenta web con el bot de Telegram para gestionar tus alertas desde cualquier lugar. Así tus suscripciones del bot aparecerán en el dashboard y podrás cancelarlas desde la web.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="text-white text-sm font-medium">Abre el bot</p>
                          <p className="text-slate-400 text-xs">
                            Abre <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@ViajeConInteligenciaBot</a> en Telegram
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="text-white text-sm font-medium">Envia <code className="text-blue-300">/vincular</code></p>
                          <p className="text-slate-400 text-xs">Escribe el comando <code className="text-blue-300">/vincular</code> en el chat. El bot te responderá con un código de 6 caracteres.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="text-white text-sm font-medium">Introduce el código</p>
                          <p className="text-slate-400 text-xs">Pega aquí el código que te dio el bot para vincular tu cuenta web con Telegram.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={vincularCode}
                        onChange={(e) => setVincularCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        placeholder="Ej: A3B2C1"
                        className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono text-center tracking-widest uppercase focus:outline-none focus:border-blue-500"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={vincularCode.length < 4 || vincularLoading}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                      >
                        {vincularLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                        Vincular
                      </button>
                    </div>
                    {vincularStatus && (
                      <p className={`mt-2 text-xs ${vincularStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {vincularStatus.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Add Alert Form */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Añadir Alerta
                </h3>
                <div className="flex gap-3">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona un país...</option>
                    {ALL_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addAlert}
                    disabled={!selectedCountry || adding}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Añadir
                  </button>
                </div>
              </div>

              {/* Saved Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.country_code} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ALL_COUNTRIES.find(c => c.code === alert.country_code)?.flag}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{alert.country_name}</p>
                          <p className="text-slate-500 text-xs">Alertar por Telegram</p>
                        </div>
                      </div>
                      <button onClick={() => removeAlert(alert.country_code)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
