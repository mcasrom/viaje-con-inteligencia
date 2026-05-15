'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DatoPais, getEmergenciasPorPais, type EmergenciasPais } from '@/data/paises';
import { PostMeta } from '@/lib/posts';
import { 
  ArrowLeft, MapPin, Phone, Mail, Clock, FileText, 
  AlertTriangle, DollarSign, Globe, Newspaper, 
  ExternalLink, Building2, CheckCircle2, XCircle, 
  Plane, Info, Flag, Users, Clock3, Zap, Car, MapPinned,
  Heart, Loader2, CheckCircle, RefreshCw, Shield, Wallet, Siren, Download, Bell, BookOpen
} from 'lucide-react';
import Reviews from '@/components/Reviews';
import WeatherWidget from '@/components/WeatherWidget';
import TravelCostIndex from '@/components/TravelCostIndex';
import LoginButton from '@/components/LoginButton';
import OsintAlertsBanner from '@/components/OsintAlertsBanner';
import EventTimeline from '@/components/EventTimeline';
import { useAuth } from '@/contexts/AuthContext';
import ShareButtons from '@/components/ShareButtons';
import AddToRadarButton from '@/components/AddToRadarButton';
import RiskTrendIndicator from '@/components/RiskTrendIndicator';

interface DetallePaisClientProps {
  pais: DatoPais;
  relatedPosts?: PostMeta[];
}

export default function DetallePaisClient({ pais, relatedPosts = [] }: DetallePaisClientProps) {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo as string;
  const { user, loading: authLoading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'legal' | 'saturacion' | 'dinero' | 'emergencia' | 'pois'>('info');
  const [maecData, setMaecData] = useState<any>(null);
  const [maecLoading, setMaecLoading] = useState(false);
  const [usRiskData, setUsRiskData] = useState<{ level: number; label: string; summary: string | null; updatedAt: string } | null>(null);
  const [usRiskLoading, setUsRiskLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [istData, setIstData] = useState<any>(null);
  const [istLoading, setIstLoading] = useState(false);
  const [poisData, setPoisData] = useState<any[]>([]);
  const [poisLoading, setPoisLoading] = useState(false);
  const [poisType, setPoisType] = useState<string>('tourist');
  const [poisError, setPoisError] = useState<string | null>(null);
  const [travelerProfile, setTravelerProfile] = useState<string>('mochilero');
  const [profileOpen, setProfileOpen] = useState(false);
  const [alternatives, setAlternatives] = useState<any[] | null>(null);
  const [altLoading, setAltLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      checkFavorite();
    } else if (!authLoading && !user) {
      setIsFavorite(false);
    }
  }, [codigo, user, authLoading]);

  useEffect(() => {
    if (activeTab === 'legal' && !maecData) {
      setMaecLoading(true);
      fetch(`/api/maec?country=${codigo}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error && data.nivelRiesgo && data.nivelRiesgo !== 'desconocido') setMaecData(data);
        })
        .catch(console.error)
        .finally(() => setMaecLoading(false));
    }
  }, [activeTab, codigo, maecData]);

  useEffect(() => {
    if (!usRiskData && !usRiskLoading) {
      setUsRiskLoading(true);
      fetch(`/api/us-risk/${codigo}`)
        .then(res => res.json())
        .then(data => {
          if (data.risk) setUsRiskData(data.risk);
        })
        .catch(() => {})
        .finally(() => setUsRiskLoading(false));
    }
  }, [codigo, usRiskData, usRiskLoading]);

  useEffect(() => {
    if (activeTab === 'pois') {
      setPoisLoading(true);
      setPoisError(null);
      fetch(`/api/pois?country=${codigo.toLowerCase()}&type=${poisType}&limit=30&profile=${travelerProfile}`)
        .then(res => res.json())
        .then(data => {
          if (data.pois?.length > 0) setPoisData(data.pois);
          else setPoisError(data.error || 'Error al cargar POIs');
        })
        .catch(() => setPoisError('Error de conexión'))
        .finally(() => setPoisLoading(false));
    }
  }, [activeTab, codigo, poisType, travelerProfile, poisLoading]);

  useEffect(() => {
    if (activeTab === 'pois' && poisType === 'disruption' && alternatives === null) {
      setAltLoading(true);
      fetch(`/api/alternatives?country=${codigo.toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
          if (data.alternatives) setAlternatives(data.alternatives);
        })
        .catch(() => {})
        .finally(() => setAltLoading(false));
    }
  }, [activeTab, codigo, poisType]);

  useEffect(() => {
    if (!authLoading && user) {
      fetch('/api/user/preferences')
        .then(res => res.json())
        .then(data => {
          if (data.preferences?.traveler_type) {
            setTravelerProfile(data.preferences.traveler_type);
          }
        })
        .catch(() => {});
    }
  }, [user, authLoading]);

  const saveProfile = async (profile: string) => {
    setTravelerProfile(profile);
    setPoisData([]);
    if (user) {
      try {
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traveler_type: profile }),
        });
      } catch {}
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const favRes = await fetch('/api/auth/favorites');
          const favData = await favRes.json();
          setIsFavorite(favData.favorites?.some((f: any) => f.country_code === codigo) || false);
        }
      }
    } catch {}
  };

  const toggleFavorite = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await fetch(`/api/auth/favorites?countryCode=${codigo}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch('/api/auth/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ countryCode: codigo }),
        });
        setIsFavorite(true);
      }
    } catch {} finally {
      setFavLoading(false);
    }
  };

  const riesgoConfig = {
    'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', label: 'Sin riesgo', description: 'No existen riesgos específicos. Puede viajarse con normalidad.' },
    'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', label: 'Riesgo bajo', description: 'Riesgo bajo. Se recomienda tomar precauciones normales.' },
    'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', label: 'Riesgo medio', description: 'Riesgo moderado. Se recomienda extremar precauciones.' },
    'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', label: 'Riesgo alto', description: 'Riesgo alto. Se desaconsejan los viajes no esenciales.' },
    'muy-alto': { bg: 'bg-red-900', text: 'text-red-400', border: 'border-red-900', label: 'Riesgo muy alto', description: 'Riesgo muy alto. Se desaconsejan todos los viajes.' }
  };

  const config = riesgoConfig[pais.nivelRiesgo];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShareButtons title={`Viajar a ${pais.nombre} — Riesgo, Visado y Consejos | Viaje con Inteligencia`} description={`Guía de ${pais.nombre}: nivel de riesgo MAEC, requisitos de entrada, embajadas y consejos de viaje.`} size="sm" />
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
              }`}
            >
              {favLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isFavorite ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>En favoritos</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Añadir a favoritos</span>
                </>
              )}
            </button>
            <AddToRadarButton countryCode={pais.codigo} countryName={pais.nombre} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className={`bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl p-8 mb-8 border-2 ${config.border}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-7xl">{pais.bandera}</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">{pais.nombre}</h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Capital: {pais.capital} • {pais.continente}
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl ${config.bg} text-white font-bold text-lg`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span>{config.label}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              {config.description}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">
                Datos MAEC: {pais.ultimoInforme}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">
                Actualizado: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {usRiskData ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 rounded-full border border-blue-800/50">
              <span className="text-blue-300 font-medium text-sm">
                US State Dept: {usRiskData.label}
              </span>
            </div>
          </div>
        ) : !usRiskLoading && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full">
              <span className="text-slate-500 text-sm">
                US State Dept: No disponible
              </span>
            </div>
          </div>
        )}

        <OsintAlertsBanner countryName={pais.nombre} />

        <div className="mb-8">
          <EventTimeline country={pais.codigo} days={60} limit={8} title="Próximos eventos" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-blue-400" />
              Información General
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Flag className="w-4 h-4" />Idioma</span>
                <span className="text-white">{pais.idioma}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Users className="w-4 h-4" />Población</span>
                <span className="text-white">{pais.poblacion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4" />PIB</span>
                <span className="text-white">{pais.pib}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Economía
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Moneda</span>
                <span className="text-white">{pais.moneda}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tipo cambio</span>
                <span className="text-white">{pais.tipoCambio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IPC</span>
                <span className="text-white">{pais.indicadores.ipc}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Índice precios</span>
                <span className="text-white">{pais.indicadores.indicePrecios}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Localización
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Clock3 className="w-4 h-4" />Zona horaria</span>
                <span className="text-white">{pais.zonaHoraria}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Prefijo</span>
                <span className="text-white">{pais.prefijoTelefono}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Car className="w-4 h-4" />Conducción</span>
                <span className="text-white">{pais.conduccion === 'derecha' ? '↱ Derecha' : '↰ Izquierda'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Zap className="w-4 h-4" />Voltaje</span>
                <span className="text-white">{pais.voltaje}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'info', label: 'Info', icon: <Info className="w-4 h-4" /> },
            { id: 'legal', label: 'MAEC', icon: <Shield className="w-4 h-4" /> },
            { id: 'saturacion', label: 'IST', icon: <Users className="w-4 h-4" /> },
            { id: 'dinero', label: 'Dinero', icon: <Wallet className="w-4 h-4" /> },
            { id: 'pois', label: 'POIs', icon: <MapPinned className="w-4 h-4" /> },
            { id: 'emergencia', label: 'Emerg.', icon: <Siren className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'saturacion' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Índice de Saturación Turística (IST)
            </h3>
            
            {!istData && !istLoading && (
              <div className="text-center py-8">
                <button
                  onClick={async () => {
                    setIstLoading(true);
                    try {
                      const cityMap: Record<string, string> = {
                        'ES': 'madrid', 'FR': 'paris', 'IT': 'roma', 
                        'PT': 'lisboa', 'NL': 'amsterdam', 'DE': 'munich'
                      };
                      const city = cityMap[pais.codigo] || 'barcelona';
                      const res = await fetch(`/api/ist?city=${city}`);
                      const data = await res.json();
                      setIstData(data);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIstLoading(false);
                    }
                  }}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                >
                  Consultar IST
                </button>
              </div>
            )}
            
            {istLoading && (
              <div className="flex items-center gap-2 text-slate-400 justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calculando índice...</span>
              </div>
            )}
            
            {istData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-5xl font-bold text-white">{istData.ist}</span>
                    <span className="text-slate-400 text-lg">/100</span>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-lg font-medium ${
                    istData.level === 'muy_baja' ? 'bg-green-500/20 text-green-400' :
                    istData.level === 'baja' ? 'bg-lime-500/20 text-lime-400' :
                    istData.level === 'moderada' ? 'bg-yellow-500/20 text-yellow-400' :
                    istData.level === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {istData.level === 'muy_baja' ? '🟢 Muy Baja' :
                     istData.level === 'baja' ? '🟢 Baja' :
                     istData.level === 'moderada' ? '🟡 Moderada' :
                     istData.level === 'alta' ? '🟠 Alta' : '🔴 Extrema'}
                  </div>
                </div>
                
                <p className="text-slate-300 bg-slate-700/50 p-4 rounded-lg">
                  {istData.recommendation}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-cyan-400">{istData.factors?.season || 0}</div>
                    <div className="text-xs text-slate-400">Temporada</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{istData.factors?.price || 0}</div>
                    <div className="text-xs text-slate-400">Precios</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{istData.factors?.events || 0}</div>
                    <div className="text-xs text-slate-400">Eventos</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-400">{istData.factors?.weekday || 0}</div>
                    <div className="text-xs text-slate-400">Día</div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 text-center">
                  IST basado en patrones históricos. No sustituye datos en tiempo real.
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Datos Oficiales MAEC
            </h3>
            
            {maecLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando última actualización MAEC...</span>
              </div>
            ) : maecData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">Nivel de riesgo</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    maecData.nivelRiesgo === 'muy-alto' ? 'bg-red-900/40 text-red-400 border border-red-800' :
                    maecData.nivelRiesgo === 'alto' ? 'bg-red-500/20 text-red-400' :
                    maecData.nivelRiesgo === 'medio' ? 'bg-orange-500/20 text-orange-400' :
                    maecData.nivelRiesgo === 'bajo' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {maecData.nivelRiesgo === 'muy-alto' ? '🔴 Muy alto' :
                     maecData.nivelRiesgo === 'alto' ? '🔴 Alto' :
                     maecData.nivelRiesgo === 'medio' ? '🟠 Medio' :
                     maecData.nivelRiesgo === 'bajo' ? '🟡 Bajo' :
                     maecData.nivelRiesgo === 'sin-riesgo' ? '🟢 Sin riesgo' :
                     '⚠️ Sin datos MAEC'}
                  </span>
                  <RiskTrendIndicator countryCode={codigo} />
                </div>
                
                {maecData.fechaActualizacion && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Actualizado: {maecData.fechaActualizacion}</span>
                  </div>
                )}

                {maecData.alertas && maecData.alertas.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-400" />
                      Alertas activas
                    </h4>
                    <ul className="space-y-2">
                      {maecData.alertas.map((alerta: string, i: number) => (
                        <li key={i} className="text-slate-300 text-sm bg-orange-500/10 p-2 rounded">
                          {alerta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <a
                    href={maecData.enlaces?.fichaPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Descargar Ficha PDF</span>
                  </a>
                  <a
                    href={maecData.enlaces?.recomendaciones}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Recomendaciones MAEC</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300">Nivel de riesgo</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pais.nivelRiesgo === 'muy-alto' ? 'bg-red-900/40 text-red-400 border border-red-800' :
                    pais.nivelRiesgo === 'alto' ? 'bg-red-500/20 text-red-400' :
                    pais.nivelRiesgo === 'medio' ? 'bg-orange-500/20 text-orange-400' :
                    pais.nivelRiesgo === 'bajo' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {pais.nivelRiesgo === 'muy-alto' ? '🔴 Muy alto' :
                     pais.nivelRiesgo === 'alto' ? '🔴 Alto' :
                     pais.nivelRiesgo === 'medio' ? '🟠 Medio' :
                     pais.nivelRiesgo === 'bajo' ? '🟡 Bajo' :
                     '🟢 Sin riesgo'}
                    <span className="ml-1 text-xs opacity-70">(fuente MAEC)</span>
                  </span>
                  <RiskTrendIndicator countryCode={codigo} />
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Último informe: {pais.ultimoInforme}</span>
                </div>

                <p className="text-slate-400 text-sm">
                  📋 Información oficial del Ministerio de Asuntos Exteriores y Cooperación. 
                  Datos actualizados según la última ficha publicada por el MAEC.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=${encodeURIComponent(pais.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Ver recomendaciones MAEC</span>
                  </a>
                  <a
                    href={`https://www.exteriores.gob.es/Documents/FichasPais/${pais.nombre.toUpperCase()}_FICHA%20PAIS.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Ficha País PDF</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dinero' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              Normas y Divisas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Moneda</span>
                <span className="text-white">{pais.moneda}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tipo cambio</span>
                <span className="text-white">{pais.tipoCambio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Límite efectivo</span>
                <span className="text-white">10.000€ (declaración obligatoria)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Propina habitual</span>
                <span className="text-white">5-10%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pois' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPinned className="w-5 h-5 text-purple-400" />
              Puntos de Interés
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => { setPoisType('tourist'); setPoisData([]); setPoisLoading(false); setPoisError(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  poisType === 'tourist'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                🎯 Turísticos
              </button>
              <button
                onClick={() => { setPoisType('disruption'); setPoisData([]); setPoisLoading(false); setPoisError(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  poisType === 'disruption'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                ⚠️ Disrupción
              </button>
              {[
                { type: 'museum', label: 'Museos', icon: '🏛️' },
                { type: 'heritage', label: 'Patrimonio', icon: '🏰' },
                { type: 'beach', label: 'Playas', icon: '🏖️' },
                { type: 'lighthouse', label: 'Faros', icon: '🗼' },
                { type: 'viewpoint', label: 'Miradores', icon: '👁️' },
                { type: 'castle', label: 'Castillos', icon: '🏯' },
                { type: 'airport', label: 'Aeropuertos', icon: '✈️' },
                { type: 'border', label: 'Fronteras', icon: '🛂' },
                { type: 'police', label: 'Comisaría', icon: '👮' },
                { type: 'hospital', label: 'Hospital', icon: '🏥' },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => { setPoisType(type); setPoisData([]); setPoisLoading(false); setPoisError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    poisType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500">Perfil:</span>
              {[
                { id: 'mochilero', label: '🎒 Mochilero' },
                { id: 'lujo', label: '💎 Lujo' },
                { id: 'familiar', label: '👨‍👩‍👧‍👦 Familiar' },
                { id: 'aventura', label: '🏔️ Aventura' },
                { id: 'negocios', label: '💼 Negocios' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => saveProfile(p.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    travelerProfile === p.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {poisLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                <p className="text-slate-400 text-sm mt-2">Cargando POIs desde OpenStreetMap...</p>
              </div>
            ) : poisError ? (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm">{poisError}</p>
              </div>
            ) : poisData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {poisData.map((poi: any, idx: number) => (
                  <a
                    key={poi.id || idx}
                    href={poi.website || `https://www.openstreetmap.org/${poi.type === 'node' ? 'node' : 'way'}/${poi.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{poi.icon || '📍'}</span>
                      <p className="text-white font-medium text-sm">{poi.name}</p>
                      {poi.relevance != null && (
                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          poi.relevance >= 80 ? 'bg-green-500/20 text-green-400' :
                          poi.relevance >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-600 text-slate-400'
                        }`}>
                          {poi.relevance}%
                        </span>
                      )}
                    </div>
                    {poi.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{poi.description}</p>
                    )}
                    {poi.typeName && (
                      <span className="inline-block px-1.5 py-0.5 bg-slate-600 rounded text-[10px] text-slate-300 mt-1">
                        {poi.typeName}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-slate-500 text-xs">{poi.lat?.toFixed(4)}, {poi.lon?.toFixed(4)}</p>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No se encontraron POIs para este tipo en OpenStreetMap</p>
              </div>
            )}

            {poisType === 'disruption' && alternatives && alternatives.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-green-400" />
                  Alternativas más seguras
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Destinos con perfil similar pero menor nivel de disrupción:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {alternatives.map((alt: any) => (
                    <Link
                      key={alt.code}
                      href={`/pais/${alt.code}`}
                      className="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700 rounded-lg p-3 transition-colors border border-slate-600/30"
                    >
                      <span className="text-xl">{alt.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{alt.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            alt.risk === 'sin-riesgo' ? 'bg-green-500' :
                            alt.risk === 'bajo' ? 'bg-emerald-500' :
                            alt.risk === 'medio' ? 'bg-orange-500' : 'bg-red-500'
                          }`} />
                          <span>{alt.risk}</span>
                          <span className="text-green-400">{alt.score}% compatible</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {poisType === 'disruption' && altLoading && (
              <div className="mt-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin text-green-400 mx-auto" />
                <p className="text-slate-500 text-xs mt-1">Buscando alternativas...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergencia' && (() => {
          const emergencias = getEmergenciasPorPais(pais.codigo);
          return (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-400" />
              Teléfonos de Emergencia
            </h3>
            <div className="space-y-3">
              {emergencias ? (
                <>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <span className="text-white font-medium">Emergencias</span>
                <span className="text-red-400 font-bold">{emergencias.general}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Policía</span>
                <span className="text-white">{emergencias.policia}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Bomberos</span>
                <span className="text-white">{emergencias.bomberos}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Ambulancia</span>
                <span className="text-white">{emergencias.ambulancia}</span>
              </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">Consulta los números locales de emergencia en el consulado.</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-white font-medium mb-2">Consulado de España</h4>
              {pais.contactos[0] ? (
                <div className="space-y-2 text-sm">
                  <p className="text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {pais.contactos[0].direccion}
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {pais.contactos[0].telefono}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Consultar consular.maec.es</p>
              )}
            </div>
          </div>
          );
        })()}

        <WeatherWidget 
          lat={pais.mapaCoordenadas[0]} 
          lon={pais.mapaCoordenadas[1]} 
          countryName={pais.nombre}
        />

        <div className="grid lg:grid-cols-2 gap-8 mb-8 mt-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-400" />
              Embajadas y Consulados de España
            </h2>
            <div className="space-y-4">
              {pais.contactos.map((contacto, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                      {contacto.tipo}
                    </span>
                    <h4 className="text-white font-medium">{contacto.nombre}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {contacto.direccion}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a href={`tel:${contacto.telefono}`} className="hover:text-blue-400 transition-colors">
                        {contacto.telefono}
                      </a>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <a href={`mailto:${contacto.email}`} className="hover:text-blue-400 transition-colors">
                        {contacto.email}
                      </a>
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {contacto.horario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              Requisitos de Entrada
            </h2>
            <div className="space-y-4">
              {pais.requerimientos.map((req, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <span className="text-xl">{req.icon}</span>
                    {req.categoria}
                  </h4>
                  <ul className="space-y-2">
                    {req.items.map((item, i) => (
                      <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-900/20 rounded-xl p-6 border border-green-800/30">
            <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Qué Hacer
            </h2>
            <ul className="space-y-3">
              {pais.queHacer.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-900/20 rounded-xl p-6 border border-red-800/30">
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              Qué NO Hacer
            </h2>
            <ul className="space-y-3">
              {pais.queNoHacer.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-orange-400" />
              Diarios de Mayor Difusión
            </h2>
            <div className="space-y-3">
              {pais.diarios.map((diario, index) => (
                <a
                  key={index}
                  href={diario.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-slate-300">{diario.nombre}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-cyan-400" />
              Enlaces Útiles
            </h2>
            <div className="space-y-3">
              {pais.urlsUtiles.map((url, index) => (
                <a
                  key={index}
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-slate-300">{url.nombre}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Recomendación Final
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Antes de viajar a <strong className="text-white">{pais.nombre}</strong>, asegúrese de verificar los 
            requisitos actualizados en la página oficial del MAEC. Los niveles de riesgo pueden cambiar según 
            la situación geopolítica y sanitaria del momento. Se recomienda contratar un seguro de viaje con 
            cobertura médica completa y revisar las recomendaciones de viaje del Ministerio de Asuntos Exteriores.
          </p>
          <Link
            href={`/coste/seguros?destino=${codigo.toUpperCase()}`}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Shield className="w-4 h-4" />
            Comparar seguros para {pais.nombre}
          </Link>
        </div>

        <TravelCostIndex countryCode={codigo} />

        <Reviews countryCode={codigo} countryName={pais.nombre} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Place',
              name: pais.nombre,
              description: `Guía de viaje para ${pais.nombre}: requisitos de entrada, nivel de riesgo ${pais.nivelRiesgo}, embajadas, moneda y consejos.`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: pais.capital,
                addressCountry: pais.codigo.toUpperCase(),
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: pais.mapaCoordenadas[0],
                longitude: pais.mapaCoordenadas[1],
              },
              containedInPlace: {
                '@type': 'Continent',
                name: pais.continente,
              },
              additionalProperty: [
                {
                  '@type': 'PropertyValue',
                  name: 'Nivel de riesgo',
                  value: pais.nivelRiesgo,
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Idioma',
                  value: pais.idioma,
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Moneda',
                  value: pais.moneda,
                },
              ],
            }),
          }}
        />
      </main>

      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Artículos relacionados
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <h3 className="text-white font-medium text-sm line-clamp-2">{post.title}</h3>
                <p className="text-slate-400 text-xs mt-2">{post.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Mapa Mundial
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            © {new Date().getFullYear()} <a href="mailto:info@viajeinteligencia.com" className="text-slate-400 hover:text-blue-400">M.Castillo</a> - 
            Información basada en datos oficiales del MAEC español
          </p>
        </div>
      </footer>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Guarda {pais.nombre} en favoritos</h2>
              <p className="text-slate-400 mb-6">
                Inicia sesión para guardar países y acceder a ellos desde cualquier dispositivo.
              </p>
              <div className="flex flex-col gap-3">
                <LoginButton showEmail={false} size="lg" />
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}