'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Music, Flag, Star, Search, Sparkles } from 'lucide-react';

interface GlobalEvent {
  name: string;
  country: string;
  flag: string;
  code: string;
  month: number;
  type: 'festival' | 'national' | 'cultural' | 'sports' | 'religious';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const EVENTS: GlobalEvent[] = [
  { name: 'Año Nuevo', country: 'España', flag: '🇪🇸', code: 'es', month: 1, type: 'national', description: '12 uvas en Puerta del Sol, Madrid', impact: 'high' },
  { name: 'Festival de Nieve de Sapporo', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 2, type: 'cultural', description: 'Esculturas de hielo y nieve gigantes', impact: 'high' },
  { name: 'Carnaval de Río', country: 'Brasil', flag: '🇧🇷', code: 'br', month: 2, type: 'festival', description: 'El mayor carnaval del mundo', impact: 'high' },
  { name: 'Songkran (Año Nuevo Tailandés)', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 4, type: 'cultural', description: 'Festival del agua en todo el país', impact: 'high' },
  { name: 'Semana Santa', country: 'España', flag: '🇪🇸', code: 'es', month: 4, type: 'religious', description: 'Procesiones en Sevilla, Málaga, Valladolid', impact: 'high' },
  { name: 'Cherry Blossom (Sakura)', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 4, type: 'cultural', description: 'Floración del cerezo — hanami', impact: 'high' },
  { name: 'Día de la Constitución', country: 'Noruega', flag: '🇳🇴', code: 'no', month: 5, type: 'national', description: 'Syttende Mai — desfiles y celebración', impact: 'high' },
  { name: 'Festival de Cannes', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 5, type: 'cultural', description: 'Festival Internacional de Cine', impact: 'medium' },
  { name: 'Glastonbury Festival', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 6, type: 'festival', description: 'Mayor festival de música del mundo', impact: 'high' },
  { name: 'San Fermín', country: 'España', flag: '🇪🇸', code: 'es', month: 7, type: 'festival', description: 'Encierros de toros en Pamplona', impact: 'high' },
  { name: 'Tour de France', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 7, type: 'sports', description: 'La carrera ciclista más famosa', impact: 'medium' },
  { name: 'Obon', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 8, type: 'cultural', description: 'Festival de los ancestros', impact: 'medium' },
  { name: 'La Tomatina', country: 'España', flag: '🇪🇸', code: 'es', month: 8, type: 'festival', description: 'Batalla de tomates en Buñol', impact: 'high' },
  { name: 'Oktoberfest', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 9, type: 'festival', description: 'Festival de la cerveza en Múnich', impact: 'high' },
  { name: 'Día de Muertos', country: 'México', flag: '🇲🇽', code: 'mx', month: 11, type: 'cultural', description: 'Ofrendas y celebración de difuntos', impact: 'high' },
  { name: 'Diwali', country: 'India', flag: '🇮🇳', code: 'in', month: 11, type: 'religious', description: 'Festival de las luces', impact: 'high' },
  { name: 'Mercados Navideños', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 12, type: 'cultural', description: 'Christkindlmarkt en Núremberg, Berlín', impact: 'high' },
  { name: 'Feria de Abril', country: 'España', flag: '🇪🇸', code: 'es', month: 4, type: 'festival', description: 'Casetas, flamenco y sevillanas en Sevilla', impact: 'high' },
  { name: 'Holi', country: 'India', flag: '🇮🇳', code: 'in', month: 3, type: 'cultural', description: 'Festival de los colores', impact: 'high' },
  { name: 'Ramadán', country: 'Varios', flag: '🌍', code: 'sa', month: 3, type: 'religious', description: 'Mes sagrado — impacto en horarios y turismo', impact: 'high' },
  { name: 'Mardi Gras', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 2, type: 'festival', description: 'Desfiles y celebración en Nueva Orleans', impact: 'high' },
  { name: 'Fallas de Valencia', country: 'España', flag: '🇪🇸', code: 'es', month: 3, type: 'festival', description: 'Monumentos de cartón y fuego', impact: 'high' },
  { name: 'Inti Raymi', country: 'Perú', flag: '🇵🇪', code: 'pe', month: 6, type: 'cultural', description: 'Festival del Sol inca en Cusco', impact: 'medium' },
  { name: 'Carnaval de Venecia', country: 'Italia', flag: '🇮🇹', code: 'it', month: 2, type: 'cultural', description: 'Máscaras y trajes históricos', impact: 'high' },
  { name: 'Running of the Bulls', country: 'España', flag: '🇪🇸', code: 'es', month: 7, type: 'festival', description: 'San Fermín — encierros matutinos', impact: 'high' },
  { name: 'Edinburgh Fringe', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 8, type: 'cultural', description: 'Mayor festival de artes del mundo', impact: 'medium' },
  { name: 'Burning Man', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 9, type: 'festival', description: 'Festival de arte y cultura en Black Rock City', impact: 'medium' },
  { name: 'Songkran', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 4, type: 'cultural', description: 'Guerra de agua por todo el país', impact: 'high' },
  { name: 'Loi Krathong', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 11, type: 'cultural', description: 'Festival de las linternas flotantes', impact: 'medium' },
  { name: 'Carnaval de Barranquilla', country: 'Colombia', flag: '🇨🇴', code: 'co', month: 2, type: 'festival', description: 'Patrimonio UNESCO — cumbia y comparsas', impact: 'high' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  festival: { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Festival' },
  national: { icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Nacional' },
  cultural: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Cultural' },
  sports: { icon: Sparkles, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Deportivo' },
  religious: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Religioso' },
};

export default function EventosClient() {
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = EVENTS.filter(e => {
    const matchMonth = filterMonth === -1 || e.month === filterMonth;
    const matchType = filterType === 'all' || e.type === filterType;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.country.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchType && matchSearch;
  });

  const grouped = filtered.reduce((acc, e) => {
    const month = MONTHS[e.month - 1];
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {} as Record<string, GlobalEvent[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-amber-400" />Eventos Globales
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Festivales, fiestas nacionales y eventos culturales por mes. Planifica tu viaje en las mejores fechas.
          </p>
        </div>

        {/* Filters */}
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

        {/* Events */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sin eventos</h3>
            <p className="text-slate-400">No hay eventos para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, events]) => (
              <div key={month}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  {month}
                  <span className="text-slate-500 text-sm font-normal">({events.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map((event, i) => {
                    const tc = TYPE_CONFIG[event.type];
                    const Icon = tc.icon;
                    return (
                      <div key={`${event.name}-${i}`} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{event.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold text-sm truncate">{event.name}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${tc.bg} ${tc.color} border-current`}>
                                <Icon className="w-3 h-3 inline mr-0.5" />{tc.label}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs">{event.description}</p>
                            {event.impact === 'high' && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="text-red-400 text-[10px]">Alto impacto turístico</span>
                              </div>
                            )}
                          </div>
                          <Link href={`/pais/${event.code}`} className="text-blue-400 hover:text-blue-300 text-xs flex-shrink-0">
                            Ver país →
                          </Link>
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
