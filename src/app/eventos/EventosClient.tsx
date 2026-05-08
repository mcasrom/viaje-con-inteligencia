'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Music, Flag, Star, Search, Sparkles, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  festival: { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Festival' },
  sports: { icon: Sparkles, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Deportivo' },
  protest: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Protesta' },
  conference: { icon: MapPin, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Congreso' },
  cultural: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Cultural' },
  holiday: { icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Feriado' },
  commemoration: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Conmemoración' },
  other: { icon: Calendar, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Otro' },
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/15 border-red-500/30',
  medium: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  low: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
  positive: 'text-green-400 bg-green-500/15 border-green-500/30',
};

export default function EventosClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<number>(-1);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/events?limit=200&upcoming=true&days=365')
      .then(res => res.json())
      .then(data => {
        if (data.events) setEvents(data.events);
        else if (Array.isArray(data)) setEvents(data);
        else setEvents([]);
      })
      .catch(() => setError('Error al cargar eventos'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    let month: number;
    if (e.start_date) {
      month = new Date(e.start_date).getMonth() + 1;
    } else if (e.month) {
      month = e.month;
    } else {
      month = new Date().getMonth() + 1;
    }
    const matchMonth = filterMonth === -1 || month === filterMonth;
    const matchType = filterType === 'all' || e.category === filterType;
    const matchSearch = !search ||
      (e.title || e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.country || '').toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchType && matchSearch;
  });

  const grouped = filtered.reduce((acc: Record<string, any[]>, e) => {
    const month = MONTHS[e.start_date ? new Date(e.start_date).getMonth() : 0];
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Cargando eventos desde fuentes OSINT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-amber-400" />Eventos que Afectan tu Viaje
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Eventos en tiempo real desde Wikidata + GDELT + alertas OSINT. Festivales, protestas, congresos y más.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar evento o país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={-1}>Todos los meses</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sin eventos</h3>
            <p className="text-slate-400">No hay eventos para este filtro. Los datos se actualizan con cada ejecución del cron.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  {month}
                  <span className="text-slate-500 text-sm font-normal">({monthEvents.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {monthEvents.slice(0, 20).map((event: any, i: number) => {
                    const tc = TYPE_CONFIG[event.category] || TYPE_CONFIG.other;
                    const Icon = tc.icon;
                    const ic = IMPACT_COLORS[event.impact_traveler] || IMPACT_COLORS.low;
                    return (
                      <div key={event.id || i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-white font-bold text-sm">{event.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${tc.bg} ${tc.color} border-current`}>
                                <Icon className="w-3 h-3 inline mr-0.5" />{tc.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${ic}`}>
                                {event.impact_traveler === 'high' ? 'Alto impacto' : event.impact_traveler === 'medium' ? 'Impacto medio' : event.impact_traveler === 'positive' ? 'Positivo' : 'Bajo impacto'}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-slate-400 text-xs mb-2 line-clamp-2">{event.description}</p>
                            )}
                            {event.impact_note && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-medium mb-2 w-fit">
                                <ShieldAlert className="w-3 h-3" /> {event.impact_note}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                              {event.start_date && <span>{new Date(event.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                              {event.city && <span>📍 {event.city}</span>}
                              {event.source && <span>Fuente: {event.source}</span>}
                            </div>
                          </div>
                          {event.country && (
                            <Link href={`/pais/${event.country.toLowerCase()}`} className="text-blue-400 hover:text-blue-300 text-xs flex-shrink-0">
                              Ver país →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
