'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, AlertTriangle, ArrowLeft, Filter,
  Plane, Users, Clock, TrendingUp, Shield, Bus,
  Ticket, Music, Trophy, Globe, Info, CalendarDays, Calculator
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  startDate: string;
  endDate: string;
  type: 'deportivo' | 'cultural' | 'internacional' | 'masivo';
  impact: 'alto' | 'medio' | 'bajo';
  risk: number;
  recommendation: 'viajar' | 'precaución' | 'evitar';
  attendees: number;
  priceImpact: 'alto' | 'medio' | 'bajo';
}

const events: Event[] = [
  {
    id: '1',
    name: 'Gran Premio de Fórmula 1',
    country: 'Mónaco',
    countryCode: 'MC',
    city: 'Mónaco',
    startDate: '2026-05-24',
    endDate: '2026-05-26',
    type: 'deportivo',
    impact: 'alto',
    risk: 25,
    recommendation: 'precaución',
    attendees: 300000,
    priceImpact: 'alto'
  },
  {
    id: '2',
    name: 'Copa Mundial de Fútbol',
    country: 'España',
    countryCode: 'ES',
    city: 'Madrid',
    startDate: '2027-06-01',
    endDate: '2027-07-15',
    type: 'masivo',
    impact: 'alto',
    risk: 40,
    recommendation: 'evitar',
    attendees: 5000000,
    priceImpact: 'alto'
  },
  {
    id: '3',
    name: 'Festival de Cannes',
    country: 'Francia',
    countryCode: 'FR',
    city: 'Cannes',
    startDate: '2026-05-13',
    endDate: '2026-05-24',
    type: 'cultural',
    impact: 'medio',
    risk: 15,
    recommendation: 'viajar',
    attendees: 50000,
    priceImpact: 'medio'
  },
  {
    id: '4',
    name: 'Maratón de Berlín',
    country: 'Alemania',
    countryCode: 'DE',
    city: 'Berlín',
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    type: 'deportivo',
    impact: 'medio',
    risk: 10,
    recommendation: 'viajar',
    attendees: 45000,
    priceImpact: 'bajo'
  },
  {
    id: '5',
    name: 'Cumbre G20',
    country: 'Brasil',
    countryCode: 'BR',
    city: 'Río de Janeiro',
    startDate: '2026-11-15',
    endDate: '2026-11-18',
    type: 'internacional',
    impact: 'alto',
    risk: 35,
    recommendation: 'precaución',
    attendees: 25000,
    priceImpact: 'alto'
  },
  {
    id: '6',
    name: 'Carnaval de Río',
    country: 'Brasil',
    countryCode: 'BR',
    city: 'Río de Janeiro',
    startDate: '2027-02-13',
    endDate: '2027-02-18',
    type: 'masivo',
    impact: 'alto',
    risk: 30,
    recommendation: 'precaución',
    attendees: 1000000,
    priceImpact: 'alto'
  },
  {
    id: '7',
    name: 'Tomorrowland',
    country: 'Bélgica',
    countryCode: 'BE',
    city: 'Boom',
    startDate: '2026-07-17',
    endDate: '2026-07-27',
    type: 'cultural',
    impact: 'medio',
    risk: 12,
    recommendation: 'viajar',
    attendees: 400000,
    priceImpact: 'medio'
  },
  {
    id: '8',
    name: 'Copa América',
    country: 'Estados Unidos',
    countryCode: 'US',
    city: 'Miami',
    startDate: '2026-06-11',
    endDate: '2026-07-04',
    type: 'deportivo',
    impact: 'alto',
    risk: 28,
    recommendation: 'precaución',
    attendees: 800000,
    priceImpact: 'alto'
  },
];

const typeIcons = {
  deportivo: Trophy,
  cultural: Music,
  internacional: Globe,
  masivo: Users,
};

const typeColors = {
  deportivo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  internacional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  masivo: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const impactColors = {
  alto: 'bg-red-500/20 text-red-400 border-red-500/30',
  medio: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  bajo: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function EventosPage() {
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterImpact, setFilterImpact] = useState<string>('todos');
  const [istCountry, setIstCountry] = useState('ES');
  const [istDate, setIstDate] = useState(new Date().toISOString().split('T')[0]);
  const [istData, setIstData] = useState<any>(null);
  const [istLoading, setIstLoading] = useState(false);

  const calculateIST = async () => {
    setIstLoading(true);
    try {
      const res = await fetch(`/api/ist?country=${istCountry}&date=${istDate}`);
      const data = await res.json();
      setIstData(data);
    } catch (e) {
      console.error('IST Error:', e);
    }
    setIstLoading(false);
  };

  useEffect(() => {
    calculateIST();
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => {
        const endDate = new Date(e.endDate);
        if (endDate < now) return false;
        if (filterType !== 'todos' && e.type !== filterType) return false;
        if (filterImpact !== 'todos' && e.impact !== filterImpact) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [filterType, filterImpact]);

  const getRecommendation = (rec: string) => {
    switch (rec) {
      case 'viajar': return { color: 'text-green-400', bg: 'bg-green-500/20', label: '✅ Recomendado' };
      case 'precaución': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: '⚠️ Precaución' };
      case 'evitar': return { color: 'text-red-400', bg: 'bg-red-500/20', label: '❌ Evitar' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/20', label: '?' };
    }
  };

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now >= start && now <= end) {
      return { label: '🔴 EN CURSO', color: 'bg-red-500 text-white' };
    }
    if (start > now && start.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return { label: '🟡 PRÓXIMO', color: 'bg-yellow-500 text-slate-900' };
    }
    return null;
  };

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
          <h1 className="text-xl font-bold text-white">🎫 Eventos Globales</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 mb-8 border border-purple-700/30">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-2">🎫 Eventos Globales con Impacto en Viajes</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Eventos que afectan movilidad, seguridad y costes. 
              Nuestro sistema OSINT analiza el impacto para que puedas decidir mejor.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-slate-300 text-sm">Evento → Impacto → Riesgo → Decisión</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-400">Bajo impacto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-400">Medio impacto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-400">Alto impacto</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Filtrar:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="deportivo">Deportivos</option>
              <option value="cultural">Culturales</option>
              <option value="internacional">Internacionales</option>
              <option value="masivo">Masivos</option>
            </select>
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="todos">Todo el impacto</option>
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
            </select>
            <span className="text-slate-500 text-sm ml-auto">
              {filteredEvents.length} eventos encontrados
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 mb-8 border border-purple-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            Índice de Saturación Turística (IST)
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            Calcula el IST de cualquier destino para planificar tu viaje避开 la masificación.
          </p>
          
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">País</label>
              <select
                value={istCountry}
                onChange={(e) => setIstCountry(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ES">España</option>
                <option value="FR">Francia</option>
                <option value="IT">Italia</option>
                <option value="PT">Portugal</option>
                <option value="DE">Alemania</option>
                <option value="GB">Reino Unido</option>
                <option value="US">EE.UU.</option>
                <option value="JP">Japón</option>
                <option value="MX">México</option>
                <option value="BR">Brasil</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Fecha viaje</label>
              <input
                type="date"
                value={istDate}
                onChange={(e) => setIstDate(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={calculateIST}
              disabled={istLoading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {istLoading ? 'Calculando...' : 'Calcular'}
            </button>
          </div>

          {istData && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-5 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-3 ${
                  istData.recommendationColor === 'green' ? 'bg-green-500/20 text-green-400' :
                  istData.recommendationColor === 'lime' ? 'bg-lime-500/20 text-lime-400' :
                  istData.recommendationColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                  istData.recommendationColor === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  <span>{istData.recommendationIcon}</span>
                  <span>{istData.recommendation}</span>
                </div>
                <div className="text-5xl font-bold text-white mb-2">{istData.ist}</div>
                <div className="text-slate-400 text-sm">IST para {istData.country}</div>
                <div className="text-slate-500 text-xs mt-1">{new Date(istData.generatedAt).toLocaleString('es-ES')}</div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm mb-2">Desglose:</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-24">Eventos</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${istData.breakdown?.eventos?.score || 0}%` }}></div>
                  </div>
                  <span className="text-white w-8">{istData.breakdown?.eventos?.score || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-24">Riesgo</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${istData.breakdown?.riesgo?.score || 0}%` }}></div>
                  </div>
                  <span className="text-white w-8">{istData.breakdown?.riesgo?.score || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-24">Temporal</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.abs(istData.breakdown?.estacionalidad?.score || 0)}%` }}></div>
                  </div>
                  <span className="text-white w-8">{istData.breakdown?.estacionalidad?.score || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-24">Precios</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${istData.breakdown?.precios?.score || 0}%` }}></div>
                  </div>
                  <span className="text-white w-8">{istData.breakdown?.precios?.score || 0}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-700">
                  <p className="text-slate-500 text-xs">
                    Fórmula: 0.35×Eventos + 0.30×Riesgo + 0.20×Temporal + 0.15×Precios
                  </p>
                  {istData.breakdown?.eventos?.details?.length > 0 ? (
                    <p className="text-slate-400 text-xs mt-1">
                      Eventos: {istData.breakdown.eventos.details.join(', ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            ¿Cómo funciona el IST?
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            El <strong className="text-white">Índice de Saturación Turística (IST)</strong> es un indicador de 0 a 100 que mide la presión turística prevista en un destino. Se calcula con datos reales y predictivos.
          </p>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">📅 35% - Eventos</h4>
              <p className="text-slate-400 text-xs">
                Festivales, F1, Mundiales y otros eventos programados que afectan movilidad y precios.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">🛡️ 30% - Riesgo</h4>
              <p className="text-slate-400 text-xs">
                Nivel de riesgo país (MAEC). Mayor riesgo = mayor presión turística en zonas seguras.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-2">📆 20% - Temporal</h4>
              <p className="text-slate-400 text-xs">
                Temporada alta (julio-agosto) vs baja (noviembre). Julio puede duplicar el IST.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">💰 15% - Precios</h4>
              <p className="text-slate-400 text-xs">
                IPC local y coste de vida. Afecta accesibilidad y experiencia.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-800/50">
            <p className="text-slate-400 text-xs">
              <strong className="text-white">Interpretación:</strong> IST &lt; 20 = Ideal | 21-40 = Bueno | 41-60 = Moderado | 61-80 = Alto | &gt; 80 = Crítico
            </p>
            <p className="text-slate-500 text-xs mt-1">
              El IST es predictivo, basado en datos programados y históricos. No garantiza situaciones imprevistas como huelgas o weather.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredEvents.map((event) => {
            const Icon = typeIcons[event.type];
            const rec = getRecommendation(event.recommendation);
            const status = getEventStatus(event.startDate, event.endDate);
            
            return (
              <div
                key={event.id}
                className="bg-slate-800/70 rounded-xl p-5 border border-slate-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {status && (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[event.type]}`}>
                        <Icon className="w-3 h-3 inline mr-1" />
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${impactColors[event.impact]}`}>
                        Impacto {event.impact}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${rec.bg} ${rec.color}`}>
                        {rec.label}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.city}, {event.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        {event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees.toLocaleString('es-ES')} asistentes
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">Riesgo:</span>
                      <div className={`w-16 h-2 rounded-full ${
                        event.risk < 20 ? 'bg-green-500' : event.risk < 35 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        <div 
                          className="h-full bg-white/30 rounded-full" 
                          style={{ width: `${100 - event.risk}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        event.risk < 20 ? 'text-green-400' : event.risk < 35 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {100 - event.risk}/100
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">Precio:</span>
                      <div className="flex gap-1">
                        {['bajo', 'medio', 'alto'].map((level) => (
                          <div 
                            key={level}
                            className={`w-2 h-4 rounded-sm ${
                              event.priceImpact === level 
                                ? (level === 'bajo' ? 'bg-green-500' : level === 'medio' ? 'bg-yellow-500' : 'bg-red-500')
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 capitalize">{event.priceImpact}</span>
                    </div>

                    <Link
                      href={`/pais/${event.countryCode}`}
                      className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                    >
                      Ver país
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-400 mb-2">No se encontraron eventos</h3>
            <p className="text-slate-500">Intenta ajustar los filtros</p>
          </div>
        )}

        <div className="mt-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            ¿Cómo analizamos el impacto?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">📊 I = 0.4A + 0.3M + 0.3S</h4>
              <p className="text-slate-400">
                Fórmula de impacto: Afluencia (A), Movilidad (M), Seguridad (S)
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">🔍 Fuentes OSINT</h4>
              <p className="text-slate-400">
                APIs, scraping web, RSS noticias y señales emergentes
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">🤖 Scoring IA</h4>
              <p className="text-slate-400">
                Clasificación automática y evaluación de riesgo dinámico
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Mapa Mundial
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            © {new Date().getFullYear()} Viaje con Inteligencia - Módulo OSINT de Eventos
          </p>
        </div>
      </footer>
    </div>
  );
}