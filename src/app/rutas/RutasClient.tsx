'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight, Star, Mountain, Wine, Landmark, Umbrella, Trees, Share2 } from 'lucide-react';

const ROUTES_DATA = [
  {
    id: 'molinos',
    title: 'Ruta de los Molinos de La Mancha',
    region: 'Castilla-La Mancha',
    days: '4-5',
    km: '450',
    difficulty: 'Fácil',
    bestTime: 'Abril, Mayo, Sept, Oct',
    icon: '🌬️',
    color: 'from-amber-600 to-orange-600',
    Icon: Star,
    desc: 'Itinerario por los molinos de viento más emblemáticos de La Mancha, siguiendo los pasos de Don Quijote a través de pueblos con encanto, gastronomía manchega y paisajes infinitos.',
    details: [
      'Alcalá de Henares - Ciudad cervantina con importante patrimonio histórico',
      'Alcalá de Chivert - Molinos históricos y parajes naturales',
      'Mota del Cuervo - Capital del molinismo con molinos del siglo XVI',
      'Campo de Criptana - Famosos molinos en el cerro de la Cuesta',
      'Consuegra - 12 molinos monumentales sobre el cerro del castillo',
      'Almagro - Ciudad teatral con Corral de Comedias del siglo XVII',
      'Cuenca - Casas Colgadas y catedral gótica',
      'Albacete - Capital de La Mancha con gastronomía local',
    ],
    highlights: 'Patrimonio UNESCO, gastronomía manchega, paisajes cervantinos',
    cost: '80-300€/día',
  },
  {
    id: 'faros',
    title: 'Ruta de los Faros de España',
    region: 'Costa Mediterránea',
    days: '5-7',
    km: '2.100',
    difficulty: 'Moderado',
    bestTime: 'Mayo, Junio, Sept, Oct',
    icon: '🌅',
    color: 'from-cyan-600 to-blue-600',
    Icon: Mountain,
    desc: 'Recorre la costa española de sur a norte visitando los faros más emblemáticos, desde Huelva hasta Gerona, con playas vírgenes, gastronomía costera y atardeceres espectaculares.',
    details: [
      'Faro de Punta Umbría (Huelva) - Faro en el límite de Castilla',
      'Faro de Trafalgar (Cádiz) - Playa de Zahora y torre histórica',
      'Faro de Tarifa - Punto más al sur de la península',
      'Faro de Málaga - Alcazaba, Muelle Uno y Museo Picasso',
      'Faro de Almería - Cabo de Gata y playas vírgenes',
      'Faro de Cabo de Gata - Parque Natural y fauna marina',
      'Faro de Valencia - Ciudad de las Artes y Playa Malvarrosa',
      'Faro de Oropesa - Castillo y Palmeral',
      'Faro de Vinarós - Puerto y gastronomía',
      'Faro de Tarragona - Anfiteatro romano y casco antiguo',
      'Faro de Barcelona - Sagrada Familia y Barrio Gótico',
      'Faro de Cap de Creus - Parque de Cadaqués y museo Dalí',
      'Faro de Begur - Calas y castillo en Costa Brava',
    ],
    highlights: 'Playas vírgenes, atardeceres, patrimonio costero, gastronomía marina',
    cost: '90-400€/día',
  },
  {
    id: 'murcia',
    title: 'Interior de Murcia: Caravaca, Calasparra, Moratalla',
    region: 'Región de Murcia',
    days: '3-4',
    km: '280',
    difficulty: 'Fácil',
    bestTime: 'Marzo, Abril, Mayo, Oct',
    icon: '🏔️',
    color: 'from-emerald-600 to-teal-600',
    Icon: Trees,
    desc: 'Ruta por el interior de la Región de Murcia, descubriendo pueblos monumentales, gastronomía murciana y naturaleza salvaje entre montañas y ríos.',
    details: [
      'Murcia - Catedral, Real Casino y museos',
      'Cartagena - Teatro Romano y Castillo',
      'Caravaca de la Cruz - Ciudad Santa, fiestas de interés turístico internacional',
      'Calasparra - Río Segura, arrozales y zamora monumental',
      'Moratalla - Cruz de Caravaca, naturaleza y gastronomía',
      'Lorca - Ciudad del Sol con castillo y parque arqueológico',
      'Cieza - Tierras de frutales y senderismo',
      'Yecla - Ciudad del vino con museo y bodegas',
    ],
    highlights: 'Patrimonio histórico, naturaleza murciana, gastronomía local, vinos Yecla',
    cost: '70-250€/día',
  },
  {
    id: 'vino',
    title: 'Rutas del Vino de España',
    region: 'Nacional',
    days: '5-7',
    km: '1.200',
    difficulty: 'Fácil',
    bestTime: 'Marzo, Abril, Mayo, Sept, Oct',
    icon: '🍷',
    color: 'from-red-600 to-rose-600',
    Icon: Wine,
    desc: 'Recorre las principales regiones vinícolas de España: Rioja, Ribera del Duero, Rías Baixas, Penedés, Jumilla, Montilla-Moriles, Ronda y Txakoli. Enoturismo premium con catas, bodegas históricas y paisajes de viñedos.',
    details: [
      'La Rioja (Haro, Logroño, Briones) - DOCa Rioja, 60+ bodegas, Museo del Vino',
      'Ribera del Duero (Aranda, Roa, Penafiel) - DO Ribera, Vega Sicilia, Protos',
      'Rías Baixas (Cambados, Sanxenxo) - DO Rías Baixas, Albariño, costa gallega',
      'Penedés (Sant Sadurní, Subirats) - DO Penedés, primera DO 100% ecológica del mundo',
      'Jumilla (Jumilla, Yecla) - DO Jumilla, Monastrell potente, mejor relación precio',
      'Montilla-Moriles (Montilla) - DO Montilla, vinos generosos, Pedro Ximénez',
      'Ronda (Ronda) - DO Ronda, vinos de montaña en ciudad romántica',
      'Txakoli (Getaria) - DO Getariako, vino atlántico único',
    ],
    highlights: '8 regiones vinícolas, catas exclusivas, bodegas históricas, DOs premium',
    cost: '80-350€/día',
  },
  {
    id: 'pirineos',
    title: 'Ruta de Nieve - Pirineos',
    region: 'Pirineos (Aragón, Cataluña, Navarra)',
    days: '5-7',
    km: '350',
    difficulty: 'Moderado',
    bestTime: 'Dic, Ene, Feb, Mar',
    icon: '🏔️',
    color: 'from-blue-600 to-indigo-600',
    Icon: Mountain,
    desc: 'Estaciones de esquí en los Pirineos, pueblos de montaña con encanto, termas y gastronomía pirenaica. Desde Baqueira Beret hasta Formigal, la mejor nieve de España.',
    details: [
      'Baqueira Beret (Lleida) - Estación premium con nieve garantizada',
      'Boí Taüll (Lleida) - Esquí + patrimonio románico UNESCO',
      'Espot Esquí (Lleida) - Parque Nacional de Aigüestortes',
      'Port Ainé (Lleida) - Esquí alpino y trineo',
      'Formigal (Huesca) - 143 km de pistas, una de las más grandes',
      'Panticosa (Huesca) - Termas históricas + esquí',
      'Candanchú (Huesca) - Cuna del esquí español',
      'Astún (Huesca) - Esquí alpino de nivel',
      'Masella/Baqueira (Girona) - Pirineo catalán',
    ],
    highlights: 'Esquí alpino, termas pirenaicas, pueblos medievales, gastronomía de montaña',
    cost: '100-400€/día',
  },
  {
    id: 'costa',
    title: 'Best Beaches - Costa del Sol',
    region: 'Andalucía',
    days: '4-5',
    km: '300',
    difficulty: 'Fácil',
    bestTime: 'Junio, Julio, Ag, Sept',
    icon: '🏖️',
    color: 'from-yellow-500 to-orange-600',
    Icon: Umbrella,
    desc: 'Las mejores playas de la Costa del Sol y Costa de la Luz, desde Marbella hasta Tarifa, con calas escondidas, pueblos blancos y gastronomía andaluza.',
    details: [
      'Marbella - Playas de lujo y Puerto Banús',
      'Nerja - Balcón de Europa y Cueva de Nerja',
      'Mijas Pueblo - Pueblo blanco con vistas al mar',
      'Estepona - Playa larga y casco antiguo',
      'Tarifa - Kitesurf y playas del Estrecho',
      'Zahora/Conil - Playas vírgenes y atardeceres',
      'Benalmádena - Puerto deportivo y marina',
      'Fuengirola - Playa familiar y castillo Sohail',
    ],
    highlights: 'Playas de arena, pueblos blancos, gastronomía andaluza, deportes acuáticos',
    cost: '90-350€/día',
  },
  {
    id: 'norte',
    title: 'Gran Ruta Verde - España Verde',
    region: 'Costa Cantábrica',
    days: '7-10',
    km: '800',
    difficulty: 'Moderado',
    bestTime: 'Mayo, Junio, Sept, Oct',
    icon: '🌲',
    color: 'from-green-600 to-emerald-600',
    Icon: Trees,
    desc: 'Recorre la costa cantábrica desde Galicia hasta el País Vasco, pasando por Asturias y Cantabria. Naturaleza exuberante, sidrerías, quesos artesanales y pueblos pesqueros.',
    details: [
      'Rías Baixas (Galicia) - Albariño, playas y marisqueo',
      'Santiago de Compostela - Catedral y Camino',
      'Costa da Morte - Faro de Finisterre y acantilados',
      'Oviedo/Gijón - Capital asturiana y playa urbana',
      'Picos de Europa - Parque Nacional y Covadonga',
      'Santander - Playa del Sardinero y palacio',
      'San Vicente de la Barquera - Pueblo pesquero',
      'San Sebastián - Playa de la Concha y pintxos',
      'Bilbao - Guggenheim y Casco Viejo',
      'Getaria - Txakoli y Museo Balenciaga',
    ],
    highlights: 'Naturaleza cantábrica, sidra, quesos, pintxos, pueblos pesqueros',
    cost: '80-300€/día',
  },
  {
    id: 'patrimonio',
    title: 'Ciudades Patrimonio de la Humanidad',
    region: 'Centro España',
    days: '5-6',
    km: '600',
    difficulty: 'Fácil',
    bestTime: 'Abril, Mayo, Sept, Oct',
    icon: '🏛️',
    color: 'from-purple-600 to-violet-600',
    Icon: Landmark,
    desc: 'Ruta por las ciudades declaradas Patrimonio de la Humanidad por la UNESCO: Toledo, Ávila, Salamanca, Segovia, Cuenca y más. Historia, arquitectura y gastronomía castellana.',
    details: [
      'Toledo - Ciudad de las Tres Culturas, catedral y Alcázar',
      'Ávila - Murallas medievales completas y catedral',
      'Salamanca - Plaza Mayor y Universidad (1218)',
      'Segovia - Alcázar, catedral y Acueducto Romano',
      'Cuenca - Casas Colgadas y puente de San Pablo',
      'Alcalá de Henares - Universidad y Casa de Cervantes',
      'Cáceres - Casco antiguo medieval',
      'Mérida - Teatro Romano y patrimonio romano',
    ],
    highlights: 'Patrimonio UNESCO, catedrales góticas, gastronomía castellana, historia milenaria',
    cost: '80-250€/día',
  },
];

const ICONS = {
  molinos: Star,
  faros: Mountain,
  murcia: Trees,
  vino: Wine,
  pirineos: Mountain,
  costa: Umbrella,
  norte: Trees,
  patrimonio: Landmark,
};

export default function RutasClient() {
  const searchParams = useSearchParams();
  const route = searchParams.get('route');
  const selectedRoute = route ? ROUTES_DATA.find(r => r.id === route) : null;

  if (selectedRoute) {
    return <RouteDetail route={selectedRoute} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🛣️ Rutas Temáticas de España</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Itinerarios diseñados con IA para descubrir España. Rutas culturales, costeras, de montaña, enoturismo y más.
          </p>
        </div>

        {/* Grid de todas las rutas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROUTES_DATA.map((r, idx) => (
            <Link key={r.id} href={`/rutas?route=${r.id}`}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${r.color} h-72 cursor-pointer hover:scale-[1.02] transition-all duration-300 group`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                      <span className="text-2xl">{r.icon}</span>
                    </div>
                    {idx === 0 && (
                      <span className="text-xs bg-emerald-500/90 text-white px-2 py-1 rounded-full font-medium backdrop-blur">
                        ⭐ Top
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-sm text-white/70 mb-1">{r.region}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{r.title}</h3>
                    <p className="text-slate-200 text-sm mb-3 line-clamp-2">{r.desc}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.km} km</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.days} días</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        <span>Ver ruta completa</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const url = encodeURIComponent(`https://www.viajeinteligencia.com/rutas?route=${r.id}`);
                          const text = encodeURIComponent(`🛣️ ${r.title} - ${r.desc}\n\n`);
                          window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                        title="Compartir ruta"
                      >
                        <Share2 className="w-4 h-4 text-white/80" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">8</div>
            <div className="text-slate-400 text-sm">Rutas temáticas</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">60+</div>
            <div className="text-slate-400 text-sm">Destinos</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">4.500</div>
            <div className="text-slate-400 text-sm">Km totales</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-rose-400">ML</div>
            <div className="text-slate-400 text-sm">Optimización IA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteDetail({ route }: { route: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/rutas" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver a rutas
        </Link>

        {/* Hero */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${route.color} h-64 mb-8`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{route.icon}</span>
              <div className="text-sm text-white/70">{route.region}</div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{route.title}</h1>
            <p className="text-slate-200 text-lg">{route.desc}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{route.km}</div>
            <div className="text-slate-400 text-sm">km</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{route.days}</div>
            <div className="text-slate-400 text-sm">días</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{route.difficulty}</div>
            <div className="text-slate-400 text-sm">dificultad</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{route.cost}</div>
            <div className="text-slate-400 text-sm">€/día</div>
          </div>
        </div>

        {/* Best time + highlights */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">📅 Mejor época</h3>
          <p className="text-slate-300 mb-4">{route.bestTime}</p>
          <h3 className="text-lg font-bold text-white mb-3">✨ Highlights</h3>
          <p className="text-slate-300">{route.highlights}</p>
        </div>

        {/* Share buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(`🛣️ ${route.title}\n\n${route.desc}\n\nDescúbrelo en Viaje con Inteligencia:`);
              window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Compartir en Telegram
          </button>
          <button
            onClick={() => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(`🛣️ ${route.title}\n\n${route.desc}\n\nDescúbrelo en Viaje con Inteligencia:`);
              window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
            }}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Compartir en WhatsApp
          </button>
        </div>

        {/* Itinerary */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">📍 Itinerario completo</h3>
          <div className="space-y-4">
            {route.details.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-slate-700/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <p className="text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
