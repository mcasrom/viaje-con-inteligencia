'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { paisesData, getTodosLosPaises, getLabelRiesgo, NivelRiesgo, DatoPais } from '@/data/paises';
import { travelAttributes as clusteringAttrs, ineTourismData as ineData } from '@/data/clustering';
import { AlertTriangle, Plane, Shield, MapPin, Calendar, ArrowRight, CheckCircle, AlertCircle, Download, Star, FileText, MessageSquare, Globe, DollarSign, Zap, Clock, Phone, BookOpen, Utensils, Heart, Briefcase, TrendingUp, Users, ThermometerSun, Sun, CloudRain, Wind } from 'lucide-react';

const allPaises = getTodosLosPaises();

const riesgoColors: Record<NivelRiesgo, { bg: string; text: string; border: string; light: string }> = {
  'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', light: 'bg-green-500/10' },
  'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', light: 'bg-yellow-500/10' },
  'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', light: 'bg-orange-500/10' },
  'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', light: 'bg-red-500/10' },
  'muy-alto': { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900', light: 'bg-red-900/10' },
};

function generateItinerary(pais: DatoPais, days: number, preferencia: string): { day: number; title: string; activities: string[]; tip: string }[] {
  const attrs = clusteringAttrs[pais.codigo];
  const it: { day: number; title: string; activities: string[]; tip: string }[] = [];
  const highlights = pais.queHacer.length > 0 ? pais.queHacer : ['Explorar la capital', 'Gastronomía local'];

  for (let d = 1; d <= Math.min(days, 14); d++) {
    let title: string;
    let activities: string[] = [];
    let tip = '';

    if (d === 1) {
      title = `Llegada a ${pais.capital}`;
      activities = [
        'Instalarse en el alojamiento',
        'Primer paseo por el centro',
        'Cena de bienvenida con comida típica',
        'Orientación en la zona',
      ];
      tip = 'Cambia algo de moneda en el aeropuerto, compra una SIM local y descarga mapas offline.';
    } else if (d === 2) {
      title = `${pais.capital} - Monumentos principales`;
      activities = [
        attrs?.cultural && attrs.cultural >= 8 ? 'Visitar los museos y monumentos más emblemáticos' : 'Explorar el casco histórico',
        'Almuerzo en restaurante local recomendado',
        attrs?.cultural && attrs.cultural >= 8 ? 'Visita a galerías o mercados tradicionales' : 'Paseo por zonas comerciales',
        'Atardecer en un mirador conocido',
      ];
      tip = 'Compra entradas online para evitar colas. Empieza temprano (8:00) para evitar multitudes.';
    } else if (d === 3) {
      title = `${pais.capital} - Cultura y vida local`;
      activities = [
        'Visitar un barrio auténtico fuera de rutas turísticas',
        attrs?.cultural && attrs.cultural >= 7 ? 'Tour gastronómico o visita a mercados' : 'Actividad cultural local',
        'Tar libre para explorar a tu ritmo',
        'Cena en zona menos turística',
      ];
      tip = 'Pregunta a locales por sus restaurantes favoritos. Evita zonas con menús en 5+ idiomas.';
    } else if (d <= 5 && attrs?.playa && attrs.playa >= 7) {
      title = 'Día de playa o costa';
      activities = [
        'Excursión a la playa o zona costera más cercana',
        'Deportes acuáticos o snorkel',
        'Almuerzo con pescado fresco',
        'Relax al atardecer',
      ];
      tip = 'Lleva protector solar reef-safe. Consulta mareas y condiciones antes de salir.';
    } else if (d <= 5 && attrs?.naturaleza && attrs.naturaleza >= 7) {
      title = 'Naturaleza y aventura';
      activities = [
        'Excursión a parque natural o reserva',
        'Senderismo o actividad al aire libre',
        'Picnic con productos locales',
        'Fotografía de paisajes',
      ];
      tip = 'Lleva agua, botiquín y avisa a alguien de tu ruta. Descarga mapas offline.';
    } else if (d <= 7) {
      title = `Excursión desde ${pais.capital}`;
      activities = [
        `Visita a una ciudad o pueblo cercano (1-2 horas de ${pais.capital})`,
        'Explorar mercados o festivales locales',
        'Almuerzo típico regional',
        'Regreso a ${pais.capital} por la tarde',
      ];
      tip = 'Tren o bus local es más económico y auténtico que un tour organizado.';
    } else if (d <= 10) {
      title = highlights[d % highlights.length] || `Exploración libre - Día ${d}`;
      activities = [
        `Actividad pendiente: ${highlights[(d + 1) % highlights.length] || 'explorar más a fondo'}`,
        'Zona que no has visitado aún',
        'Compras de souvenirs o artesanía',
        'Cena de despedida en restaurante especial',
      ];
      tip = 'Reserva restaurantes populares con antelación. Pide recomendaciones a tu alojamiento.';
    } else {
      title = `Día ${d} - Exploración libre`;
      activities = [
        'Repetir actividad favorita o descubrir algo nuevo',
        'Día libre sin planificación estricta',
      ];
      tip = 'Los mejores momentos de viaje suelen ser los no planificados.';
    }

    it.push({ day: d, title, activities, tip });
  }

  return it;
}

function getBudgetEstimate(pais: DatoPais, days: number, presupuesto: string): { alojamiento: string; comidas: string; transporte: string; actividades: string; total: string; nota: string } {
  const ipc = parseFloat(pais.indicadores.ipc.replace('%', '')) || 50;
  const isLow = presupuesto === 'bajo';
  const isHigh = presupuesto === 'alto';

  const mult = isLow ? 0.6 : isHigh ? 2.0 : 1.0;
  const baseAloj = ipc < 30 ? 30 : ipc < 60 ? 60 : ipc < 90 ? 100 : 150;
  const baseComida = ipc < 30 ? 15 : ipc < 60 ? 30 : ipc < 90 ? 50 : 80;
  const baseTransp = ipc < 30 ? 10 : ipc < 60 ? 20 : ipc < 90 ? 35 : 60;
  const baseActiv = ipc < 30 ? 10 : ipc < 60 ? 20 : ipc < 90 ? 40 : 70;

  return {
    alojamiento: `${Math.round(baseAloj * mult * days)}€`,
    comidas: `${Math.round(baseComida * mult * days)}€`,
    transporte: `${Math.round(baseTransp * days)}€`,
    actividades: `${Math.round(baseActiv * days)}€`,
    total: `${Math.round((baseAloj + baseComida + baseTransp + baseActiv) * mult * days)}€`,
    nota: isLow ? 'Mochilero: hostales, comida callejera, transporte público' : isHigh ? 'Premium: hoteles 4-5★, restaurantes, tours privados' : 'Estándar: hoteles 3★, mezcla restaurantes y casual',
  };
}

function AnalisisInner() {
  const searchParams = useSearchParams();
  const [destino, setDestino] = useState(searchParams.get('destino') || '');
  const [fecha, setFecha] = useState(searchParams.get('fecha') || 'flexible');
  const [preferencia, setPreferencia] = useState('cultural');
  const [duracion, setDuracion] = useState('7');
  const [presupuesto, setPresupuesto] = useState('medio');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const paisSeleccionado = allPaises.find(p => p.codigo.toLowerCase() === destino.toLowerCase());

  const handleAnalizar = () => {
    if (!destino) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 800);
  };

  if (!paisSeleccionado || !analyzed) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-2">✈️ Ficha de Viaje Completa</h3>
          <p className="text-slate-400 mb-6">Selecciona destino y preferencias para generar tu ficha con itinerario, presupuesto y recomendaciones</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Destino
              </label>
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar destino...</option>
                {allPaises.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.bandera} {p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                <Calendar className="w-4 h-4 inline mr-1" /> Época del viaje
              </label>
              <select
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="flexible">📅 Fechas flexibles</option>
                {['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'].map(m => (
                  <option key={m} value={m}>{new Date(2026, ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'].indexOf(m)).toLocaleString('es-ES', { month: 'long' })}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Tipo de viaje</label>
              <select value={preferencia} onChange={(e) => setPreferencia(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white">
                <option value="cultural">🏛️ Cultural</option>
                <option value="playa">🏖️ Playa</option>
                <option value="naturaleza">🏔️ Naturaleza</option>
                <option value="familiar">👨‍👩‍👧‍👦 Familiar</option>
                <option value="gastronomia">🍽️ Gastronomía</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Duración</label>
              <select value={duracion} onChange={(e) => setDuracion(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white">
                {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} días</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Presupuesto</label>
              <select value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white">
                <option value="bajo">💰 Económico</option>
                <option value="medio">💰💰 Estándar</option>
                <option value="alto">💎 Premium</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAnalizar}
                disabled={!destino || loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar ficha'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nivel = paisSeleccionado.nivelRiesgo;
  const colors = riesgoColors[nivel];
  const itinerary = generateItinerary(paisSeleccionado, parseInt(duracion), preferencia);
  const budget = getBudgetEstimate(paisSeleccionado, parseInt(duracion), presupuesto);
  const attrs = clusteringAttrs[paisSeleccionado.codigo];
  const tourism = ineData[paisSeleccionado.codigo];

  return (
    <div className="space-y-6">
      {/* HERO - Ficha del País */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="text-center">
            <span className="text-7xl">{paisSeleccionado.bandera}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{paisSeleccionado.nombre}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} text-white`}>
                {getLabelRiesgo(nivel)}
              </span>
            </div>
            <p className="text-slate-400 text-lg mb-4">{paisSeleccionado.capital} • {paisSeleccionado.continente}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Globe className="w-3 h-3" /> Idioma</div>
                <div className="text-white font-medium text-sm">{paisSeleccionado.idioma}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><DollarSign className="w-3 h-3" /> Moneda</div>
                <div className="text-white font-medium text-sm">{paisSeleccionado.moneda}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Clock className="w-3 h-3" /> Zona horaria</div>
                <div className="text-white font-medium text-sm">{paisSeleccionado.zonaHoraria}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Zap className="w-3 h-3" /> Electricidad</div>
                <div className="text-white font-medium text-sm">{paisSeleccionado.voltaje}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 border ${colors.border} ${colors.light}`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-5 h-5 ${colors.text}`} />
            <span className={`text-sm font-medium ${colors.text}`}>Seguridad</span>
          </div>
          <p className="text-white font-bold text-lg">{getLabelRiesgo(nivel)}</p>
          <p className="text-slate-400 text-xs mt-1">Fuente: MAEC</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Población</span>
          </div>
          <p className="text-white font-bold text-lg">{paisSeleccionado.poblacion}</p>
          <p className="text-slate-400 text-xs mt-1">{paisSeleccionado.pib} PIB</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">Turismo</span>
          </div>
          <p className="text-white font-bold text-lg">{tourism ? `${(tourism.arrivals / 1000000).toFixed(1)}M` : 'N/A'}</p>
          <p className="text-slate-400 text-xs mt-1">{tourism ? `Estancia media: ${tourism.estanciaMedia} días` : 'Datos no disponibles'}</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">IPC</span>
          </div>
          <p className="text-white font-bold text-lg">{paisSeleccionado.indicadores.ipc}</p>
          <p className="text-slate-400 text-xs mt-1">{paisSeleccionado.indicadores.indicePrecios} vs España</p>
        </div>
      </div>

      {/* PRESUPUESTO ESTIMADO */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Presupuesto estimado ({duracion} días - {presupuesto})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-slate-400 text-xs mb-1">🏨 Alojamiento</div>
            <div className="text-white font-bold text-lg">{budget.alojamiento}</div>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-slate-400 text-xs mb-1">🍽️ Comidas</div>
            <div className="text-white font-bold text-lg">{budget.comidas}</div>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-slate-400 text-xs mb-1">🚌 Transporte</div>
            <div className="text-white font-bold text-lg">{budget.transporte}</div>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-slate-400 text-xs mb-1">🎭 Actividades</div>
            <div className="text-white font-bold text-lg">{budget.actividades}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 text-center border border-green-500/30">
            <div className="text-green-400 text-xs mb-1 font-medium">TOTAL</div>
            <div className="text-white font-bold text-2xl">{budget.total}</div>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-3">{budget.nota}</p>
      </div>

      {/* REQUISITOS DE VIAJE */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Documentación
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.requerimientos
              .filter(r => r.categoria === 'Documentación')
              .flatMap(r => r.items)
              .map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            {paisSeleccionado.requerimientos.filter(r => r.categoria === 'Documentación').length === 0 && (
              <>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />Pasaporte válido 6 meses</li>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />Verificar visado según nacionalidad</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Sanidad
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.requerimientos
              .filter(r => r.categoria === 'Sanitario')
              .flatMap(r => r.items)
              .map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            {paisSeleccionado.requerimientos.filter(r => r.categoria === 'Sanitario').length === 0 && (
              <>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />Seguro médico de viaje</li>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />Vacunas al día</li>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />Botiquín básico</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Seguridad
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.requerimientos
              .filter(r => r.categoria === 'Seguridad')
              .flatMap(r => r.items)
              .map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            {paisSeleccionado.requerimientos.filter(r => r.categoria === 'Seguridad').length === 0 && (
              <>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />Registrar viaje en consular</li>
                <li className="flex items-start gap-2 text-slate-300 text-sm"><AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />Copias digitales de documentos</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* QUÉ HACER / QUÉ NO HACER */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Qué hacer
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.queHacer.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 border border-red-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Qué NO hacer
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.queNoHacer.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-red-400 mt-0.5">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PERFIL DE VIAJE (attrs del clustering) */}
      {attrs && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Perfil del destino
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Playa', value: attrs.playa, icon: '🏖️' },
              { label: 'Cultural', value: attrs.cultural, icon: '🏛️' },
              { label: 'Naturaleza', value: attrs.naturaleza, icon: '🏔️' },
              { label: 'Familiar', value: attrs.familiar, icon: '👨‍👩‍👧‍👦' },
              { label: 'Mejor época', value: attrs.mejorEpoca.join(', '), icon: '📅', isBar: false },
            ].map((item: any, i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-slate-400 text-xs">{item.label}</div>
                {item.isBar !== false ? (
                  <div className="mt-2">
                    <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full" style={{ width: `${item.value * 10}%` }} />
                    </div>
                    <div className="text-white font-bold text-sm mt-1">{item.value}/10</div>
                  </div>
                ) : (
                  <div className="text-white font-medium text-sm mt-1">{item.value}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-slate-400 text-sm">
            <span className="text-white font-medium">Duración óptima:</span> {attrs.duracionOptima} días
          </div>
        </div>
      )}

      {/* ITINERARIO DÍA A DÍA */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-400" />
          Itinerario sugerido — {duracion} días en {paisSeleccionado.nombre}
        </h3>
        <p className="text-slate-400 text-sm mb-6">Basado en tu perfil: {preferencia} • {presupuesto} • {paisSeleccionado.capital}</p>

        <div className="space-y-4">
          {itinerary.map((day, idx) => (
            <div key={day.day} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {day.day}
                </div>
                {idx < itinerary.length - 1 && <div className="w-0.5 h-full bg-slate-700 mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="text-white font-semibold text-lg">{day.title}</h4>
                <ul className="mt-2 space-y-1">
                  {day.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-purple-400 mt-0.5">•</span>
                      {act}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 p-2 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-400 text-xs">
                    <span className="text-yellow-400">💡 Tip:</span> {day.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMBASSY / CONTACTS */}
      {paisSeleccionado.contactos.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-cyan-400" />
            Contactos oficiales
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {paisSeleccionado.contactos.map((c, i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-white font-medium mb-1">{c.tipo}: {c.nombre}</div>
                <div className="text-slate-400 text-sm">{c.direccion}</div>
                <div className="text-slate-400 text-sm mt-1">📞 {c.telefono}</div>
                <div className="text-slate-400 text-sm">✉️ {c.email}</div>
                <div className="text-slate-500 text-xs mt-1">🕐 {c.horario}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENLACES ÚTILES */}
      <div className="grid md:grid-cols-2 gap-6">
        {paisSeleccionado.diarios.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Prensa local
            </h3>
            <ul className="space-y-2">
              {paisSeleccionado.diarios.map((d, i) => (
                <li key={i}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> {d.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Enlaces útiles
          </h3>
          <ul className="space-y-2">
            {paisSeleccionado.urlsUtiles.map((u, i) => (
              <li key={i}>
                <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> {u.nombre}
                </a>
              </li>
            ))}
            <li>
              <Link href={`/pais/${paisSeleccionado.codigo}`} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Ficha completa del país →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ALERTA RIESGO */}
      {(nivel === 'alto' || nivel === 'muy-alto') && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-10 h-10 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ Riesgo {nivel === 'muy-alto' ? 'MUY ALTO' : 'ALTO'} — Precaución extrema</h3>
              <ul className="space-y-2 text-red-200">
                <li>• {nivel === 'muy-alto' ? 'NO se recomienda viajar bajo ninguna circunstancia' : 'Viajar SOLO si es estrictamente necesario'}</li>
                <li>• Registrar viaje en el consulado OBLIGATORIO</li>
                <li>• Contratar seguro premium con evacuación médica</li>
                <li>• Mantener contacto regular con familia</li>
                <li>• Tener plan de salida de emergencia preparado</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/lead-magnet" className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" /> Descargar checklist PDF
        </Link>
        <Link href="/premium" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Chat IA para más detalles
        </Link>
        <Link href={`/pais/${paisSeleccionado.codigo}`} className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Ficha completa
        </Link>
      </div>
    </div>
  );
}

export default function AnalisisContent() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Cargando...</div>}>
      <AnalisisInner />
    </Suspense>
  );
}
