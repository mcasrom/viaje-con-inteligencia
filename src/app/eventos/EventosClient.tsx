'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Music, Flag, Star, Search, Sparkles, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

interface GlobalEvent {
  name: string;
  country: string;
  flag: string;
  code: string;
  month: number;
  type: 'festival' | 'national' | 'cultural' | 'sports' | 'religious' | 'conference' | 'mega-event';
  description: string;
  impact: 'high' | 'medium' | 'low';
  priceImpact?: 'extreme' | 'high' | 'medium' | 'none';
  safetyNote?: string;
}

const EVENTS: GlobalEvent[] = [
  // --- ENERO ---
  { name: 'Davos (Foro Económico Mundial)', country: 'Suiza', flag: '🇨🇭', code: 'ch', month: 1, type: 'conference', description: 'Cumbre global de líderes. Seguridad extrema en la ciudad.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Cierres de calles y zonas restringidas.' },
  { name: 'Año Nuevo Chino (Lunar)', country: 'China / Varios', flag: '🇨🇳', code: 'cn', month: 1, type: 'cultural', description: 'La mayor migración humana del mundo (Chunyun).', impact: 'high', priceImpact: 'high', safetyNote: 'Transporte colapsado. Reserva con meses de antelación.' },

  // --- FEBRERO ---
  { name: 'Carnaval de Río', country: 'Brasil', flag: '🇧🇷', code: 'br', month: 2, type: 'festival', description: 'El mayor carnaval del mundo.', impact: 'high', priceImpact: 'high', safetyNote: 'Extrema precaución con robos y carteristas.' },
  { name: 'Carnaval de Venecia', country: 'Italia', flag: '🇮🇹', code: 'it', month: 2, type: 'cultural', description: 'Máscaras y trajes históricos.', impact: 'high', priceImpact: 'high' },
  { name: 'MWC Barcelona (Mobile World Congress)', country: 'España', flag: '🇪🇸', code: 'es', month: 2, type: 'conference', description: 'El mayor evento tecnológico del mundo.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Hoteles al 200% de precio y llenos.' },
  { name: 'Mardi Gras', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 2, type: 'festival', description: 'Desfiles masivos en Nueva Orleans.', impact: 'high', priceImpact: 'high' },
  { name: 'Olimpiadas de Invierno 2026', country: 'Italia', flag: '🇮🇹', code: 'it', month: 2, type: 'mega-event', description: 'Milán-Cortina. Evento global.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Seguridad reforzada. Precios de vuelos y hoteles disparados.' },

  // --- MARZO ---
  { name: 'Holi (Festival de los Colores)', country: 'India', flag: '🇮🇳', code: 'in', month: 3, type: 'cultural', description: 'Festival vibrante en todo el país.', impact: 'high', priceImpact: 'medium' },
  { name: 'Ramadán (Inicio aprox.)', country: 'Mundo Árabe', flag: '🌍', code: 'sa', month: 3, type: 'religious', description: 'Mes sagrado. Horarios comerciales cambian radicalmente.', impact: 'high', priceImpact: 'high', safetyNote: 'No comer/beber en público durante el día en muchos países.' },
  { name: 'Fallas de Valencia', country: 'España', flag: '🇪🇸', code: 'es', month: 3, type: 'festival', description: 'Fuego, música y monumentos.', impact: 'high', priceImpact: 'high' },
  { name: 'St. Patrick\'s Day', country: 'Irlanda', flag: '🇮🇪', code: 'ie', month: 3, type: 'national', description: 'Celebración masiva en Dublín y global.', impact: 'high', priceImpact: 'high' },

  // --- ABRIL ---
  { name: 'Songkran (Año Nuevo Tailandés)', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 4, type: 'cultural', description: 'Festival del agua masivo.', impact: 'high', priceImpact: 'high', safetyNote: 'Alto índice de accidentes de tráfico estos días.' },
  { name: 'Semana Santa', country: 'España / Latam', flag: '🇪🇸', code: 'es', month: 4, type: 'religious', description: 'Procesiones y vacaciones masivas.', impact: 'high', priceImpact: 'high' },
  { name: 'Cherry Blossom (Sakura)', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 4, type: 'cultural', description: 'Floración del cerezo.', impact: 'high', priceImpact: 'high' },

  // --- MAYO ---
  { name: 'Gran Premio de Mónaco (F1)', country: 'Mónaco', flag: '🇲🇨', code: 'mc', month: 5, type: 'sports', description: 'El evento más exclusivo del calendario F1.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Precios de hotel x10. Reserva con 6-9 meses.' },
  { name: 'Festival de Cannes', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 5, type: 'cultural', description: 'Festival Internacional de Cine.', impact: 'medium', priceImpact: 'high' },

  // --- JUNIO ---
  { name: 'Mundial de Fútbol 2026', country: 'USA / México / Canadá', flag: '🌎', code: 'us', month: 6, type: 'mega-event', description: 'El mayor evento deportivo del mundo.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Ciudades anfitrionas saturadas. Riesgo de estafas con entradas.' },
  { name: 'Glastonbury Festival', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 6, type: 'festival', description: 'El festival de música más famoso.', impact: 'high', priceImpact: 'high' },
  { name: 'Inti Raymi', country: 'Perú', flag: '🇵🇪', code: 'pe', month: 6, type: 'cultural', description: 'Festival del Sol en Cusco.', impact: 'medium', priceImpact: 'high' },

  // --- JULIO ---
  { name: 'San Fermín', country: 'España', flag: '🇪🇸', code: 'es', month: 7, type: 'festival', description: 'Encierros de Pamplona.', impact: 'high', priceImpact: 'high', safetyNote: 'Riesgo físico en los encierros y consumo excesivo de alcohol.' },
  { name: 'Gran Premio de Gran Bretaña (F1)', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 7, type: 'sports', description: 'Silverstone. Cientos de miles de fans.', impact: 'high', priceImpact: 'high' },
  { name: 'Tour de France', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 7, type: 'sports', description: 'Cierre de carreteras en etapas de montaña.', impact: 'medium', priceImpact: 'medium', safetyNote: 'Carreteras cortadas. Planifica rutas alternativas.' },

  // --- AGOSTO ---
  { name: 'La Tomatina', country: 'España', flag: '🇪🇸', code: 'es', month: 8, type: 'festival', description: 'Batalla de tomates (Entradas limitadas).', impact: 'high', priceImpact: 'medium' },
  { name: 'Obon', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 8, type: 'cultural', description: 'Festival de los ancestros.', impact: 'medium', priceImpact: 'high' },
  { name: 'Edinburgh Fringe', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 8, type: 'cultural', description: 'Mayor festival de artes del mundo.', impact: 'medium', priceImpact: 'high' },

  // --- SEPTIEMBRE ---
  { name: 'Oktoberfest', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 9, type: 'festival', description: 'Festival de la cerveza en Múnich.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Reserva alojamiento con 6 meses de antelación.' },
  { name: 'Gran Premio de Italia (F1)', country: 'Italia', flag: '🇮🇹', code: 'it', month: 9, type: 'sports', description: 'Monza. La "Tifosi" invade el circuito.', impact: 'high', priceImpact: 'high' },
  { name: 'Burning Man', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 9, type: 'festival', description: 'Festival en el desierto de Nevada.', impact: 'medium', priceImpact: 'high', safetyNote: 'Condiciones extremas (calor, polvo). Auto-suficiencia obligatoria.' },

  // --- OCTUBRE ---
  { name: 'Web Summit', country: 'Portugal', flag: '🇵🇹', code: 'pt', month: 10, type: 'conference', description: 'Gran evento tecnológico en Lisboa.', impact: 'high', priceImpact: 'high' },
  { name: 'Gran Premio de México (F1)', country: 'México', flag: '🇲🇽', code: 'mx', month: 10, type: 'sports', description: 'Autódromo Hermanos Rodríguez.', impact: 'high', priceImpact: 'high' },
  { name: 'Día de Muertos', country: 'México', flag: '🇲🇽', code: 'mx', month: 10, type: 'cultural', description: 'Ofrendas y celebración de difuntos.', impact: 'high', priceImpact: 'medium' },

  // --- NOVIEMBRE ---
  { name: 'Diwali', country: 'India', flag: '🇮🇳', code: 'in', month: 11, type: 'religious', description: 'Festival de las luces.', impact: 'high', priceImpact: 'medium' },
  { name: 'Loi Krathong', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 11, type: 'cultural', description: 'Festival de las linternas.', impact: 'medium', priceImpact: 'medium' },
  { name: 'Gran Premio de Abu Dabi (F1)', country: 'Emiratos Árabes', flag: '🇦🇪', code: 'ae', month: 11, type: 'sports', description: 'Cierre de temporada bajo las luces.', impact: 'high', priceImpact: 'extreme' },

  // --- DICIEMBRE ---
  { name: 'Mercados Navideños', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 12, type: 'cultural', description: 'Christkindlmarkt en Núremberg, Berlín.', impact: 'high', priceImpact: 'high' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  festival: { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Festival' },
  national: { icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Nacional' },
  cultural: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Cultural' },
  sports: { icon: Sparkles, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Deportivo' },
  religious: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Religioso' },
  conference: { icon: MapPin, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Congreso' },
  'mega-event': { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Mega-Evento' },
};

export default function EventosClient() {
  const [filterMonth, setFilterMonth] = useState<number>(-1);
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
            <Calendar className="w-8 h-8 text-amber-400" />Eventos que Afectan tu Viaje
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Grandes eventos, F1, congresos y festivales que disparan precios y cambian la logística. Planifica con inteligencia.
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
                            <p className="text-slate-400 text-xs mb-2">{event.description}</p>
                            
                            {/* Impact Badges */}
                            <div className="flex flex-wrap gap-2">
                              {event.priceImpact === 'extreme' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded text-[10px] font-medium">
                                  <TrendingUp className="w-3 h-3" /> Precios x10
                                </div>
                              )}
                              {event.priceImpact === 'high' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded text-[10px] font-medium">
                                  <TrendingUp className="w-3 h-3" /> Precios altos
                                </div>
                              )}
                              {event.safetyNote && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-medium">
                                  <ShieldAlert className="w-3 h-3" /> Nota: {event.safetyNote}
                                </div>
                              )}
                            </div>
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
