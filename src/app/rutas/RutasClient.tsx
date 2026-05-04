'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight, Star, Mountain, Wine, Landmark, Umbrella, Trees, Share2, TrendingUp, TrendingDown, Users } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

// Monthly prediction data per route (price index 1-100, crowd level 1-100)
const ROUTE_PREDICTIONS: Record<string, { month: string; price: number; crowd: number; weather: number }[]> = {
  vino: [
    { month: 'Ene', price: 55, crowd: 20, weather: 35 },
    { month: 'Feb', price: 50, crowd: 25, weather: 40 },
    { month: 'Mar', price: 60, crowd: 35, weather: 55 },
    { month: 'Abr', price: 70, crowd: 45, weather: 70 },
    { month: 'May', price: 75, crowd: 50, weather: 80 },
    { month: 'Jun', price: 80, crowd: 60, weather: 90 },
    { month: 'Jul', price: 85, crowd: 65, weather: 95 },
    { month: 'Ago', price: 90, crowd: 70, weather: 90 },
    { month: 'Sep', price: 75, crowd: 55, weather: 85 },
    { month: 'Oct', price: 65, crowd: 40, weather: 70 },
    { month: 'Nov', price: 55, crowd: 25, weather: 50 },
    { month: 'Dic', price: 50, crowd: 30, weather: 35 },
  ],
  pirineos: [
    { month: 'Ene', price: 70, crowd: 60, weather: 30 },
    { month: 'Feb', price: 65, crowd: 55, weather: 35 },
    { month: 'Mar', price: 75, crowd: 50, weather: 45 },
    { month: 'Abr', price: 80, crowd: 65, weather: 55 },
    { month: 'May', price: 85, crowd: 70, weather: 70 },
    { month: 'Jun', price: 90, crowd: 80, weather: 85 },
    { month: 'Jul', price: 95, crowd: 90, weather: 95 },
    { month: 'Ago', price: 95, crowd: 95, weather: 90 },
    { month: 'Sep', price: 80, crowd: 60, weather: 80 },
    { month: 'Oct', price: 70, crowd: 45, weather: 60 },
    { month: 'Nov', price: 60, crowd: 30, weather: 40 },
    { month: 'Dic', price: 75, crowd: 65, weather: 25 },
  ],
  faros: [
    { month: 'Ene', price: 50, crowd: 20, weather: 35 },
    { month: 'Feb', price: 45, crowd: 15, weather: 40 },
    { month: 'Mar', price: 55, crowd: 25, weather: 50 },
    { month: 'Abr', price: 65, crowd: 40, weather: 65 },
    { month: 'May', price: 75, crowd: 55, weather: 80 },
    { month: 'Jun', price: 85, crowd: 70, weather: 90 },
    { month: 'Jul', price: 95, crowd: 90, weather: 95 },
    { month: 'Ago', price: 95, crowd: 95, weather: 95 },
    { month: 'Sep', price: 80, crowd: 60, weather: 85 },
    { month: 'Oct', price: 65, crowd: 35, weather: 70 },
    { month: 'Nov', price: 50, crowd: 20, weather: 50 },
    { month: 'Dic', price: 45, crowd: 15, weather: 35 },
  ],
  costa: [
    { month: 'Ene', price: 45, crowd: 15, weather: 35 },
    { month: 'Feb', price: 40, crowd: 10, weather: 40 },
    { month: 'Mar', price: 50, crowd: 20, weather: 55 },
    { month: 'Abr', price: 60, crowd: 35, weather: 70 },
    { month: 'May', price: 75, crowd: 50, weather: 85 },
    { month: 'Jun', price: 90, crowd: 75, weather: 95 },
    { month: 'Jul', price: 100, crowd: 100, weather: 100 },
    { month: 'Ago', price: 100, crowd: 100, weather: 95 },
    { month: 'Sep', price: 85, crowd: 60, weather: 90 },
    { month: 'Oct', price: 65, crowd: 35, weather: 75 },
    { month: 'Nov', price: 50, crowd: 20, weather: 55 },
    { month: 'Dic', price: 45, crowd: 15, weather: 40 },
  ],
  norte: [
    { month: 'Ene', price: 50, crowd: 20, weather: 30 },
    { month: 'Feb', price: 45, crowd: 15, weather: 35 },
    { month: 'Mar', price: 55, crowd: 25, weather: 45 },
    { month: 'Abr', price: 65, crowd: 40, weather: 60 },
    { month: 'May', price: 75, crowd: 50, weather: 75 },
    { month: 'Jun', price: 85, crowd: 65, weather: 85 },
    { month: 'Jul', price: 90, crowd: 75, weather: 90 },
    { month: 'Ago', price: 95, crowd: 85, weather: 85 },
    { month: 'Sep', price: 80, crowd: 55, weather: 80 },
    { month: 'Oct', price: 65, crowd: 40, weather: 65 },
    { month: 'Nov', price: 55, crowd: 25, weather: 45 },
    { month: 'Dic', price: 50, crowd: 20, weather: 30 },
  ],
  molinos: [
    { month: 'Ene', price: 50, crowd: 20, weather: 30 },
    { month: 'Feb', price: 45, crowd: 15, weather: 35 },
    { month: 'Mar', price: 55, crowd: 30, weather: 50 },
    { month: 'Abr', price: 65, crowd: 45, weather: 70 },
    { month: 'May', price: 70, crowd: 50, weather: 80 },
    { month: 'Jun', price: 75, crowd: 55, weather: 95 },
    { month: 'Jul', price: 80, crowd: 60, weather: 100 },
    { month: 'Ago', price: 85, crowd: 65, weather: 95 },
    { month: 'Sep', price: 70, crowd: 45, weather: 85 },
    { month: 'Oct', price: 60, crowd: 35, weather: 70 },
    { month: 'Nov', price: 50, crowd: 25, weather: 50 },
    { month: 'Dic', price: 45, crowd: 20, weather: 35 },
  ],
  patrimonio: [
    { month: 'Ene', price: 55, crowd: 30, weather: 35 },
    { month: 'Feb', price: 50, crowd: 25, weather: 40 },
    { month: 'Mar', price: 60, crowd: 35, weather: 55 },
    { month: 'Abr', price: 75, crowd: 55, weather: 70 },
    { month: 'May', price: 80, crowd: 60, weather: 80 },
    { month: 'Jun', price: 85, crowd: 70, weather: 90 },
    { month: 'Jul', price: 90, crowd: 80, weather: 95 },
    { month: 'Ago', price: 95, crowd: 85, weather: 90 },
    { month: 'Sep', price: 80, crowd: 65, weather: 85 },
    { month: 'Oct', price: 70, crowd: 50, weather: 70 },
    { month: 'Nov', price: 60, crowd: 35, weather: 50 },
    { month: 'Dic', price: 65, crowd: 45, weather: 35 },
  ],
  segovia: [
    { month: 'Ene', price: 40, crowd: 15, weather: 25 },
    { month: 'Feb', price: 35, crowd: 10, weather: 30 },
    { month: 'Mar', price: 45, crowd: 20, weather: 45 },
    { month: 'Abr', price: 60, crowd: 40, weather: 65 },
    { month: 'May', price: 65, crowd: 50, weather: 75 },
    { month: 'Jun', price: 70, crowd: 55, weather: 85 },
    { month: 'Jul', price: 75, crowd: 70, weather: 90 },
    { month: 'Ago', price: 80, crowd: 75, weather: 85 },
    { month: 'Sep', price: 65, crowd: 45, weather: 75 },
    { month: 'Oct', price: 55, crowd: 35, weather: 60 },
    { month: 'Nov', price: 45, crowd: 20, weather: 40 },
    { month: 'Dic', price: 50, crowd: 30, weather: 30 },
  ],
  buceo: [
    { month: 'Ene', price: 45, crowd: 10, weather: 25 },
    { month: 'Feb', price: 40, crowd: 10, weather: 30 },
    { month: 'Mar', price: 50, crowd: 15, weather: 40 },
    { month: 'Abr', price: 60, crowd: 25, weather: 55 },
    { month: 'May', price: 70, crowd: 35, weather: 70 },
    { month: 'Jun', price: 80, crowd: 55, weather: 85 },
    { month: 'Jul', price: 95, crowd: 85, weather: 95 },
    { month: 'Ago', price: 100, crowd: 95, weather: 95 },
    { month: 'Sep', price: 85, crowd: 50, weather: 90 },
    { month: 'Oct', price: 65, crowd: 30, weather: 70 },
    { month: 'Nov', price: 50, crowd: 15, weather: 45 },
    { month: 'Dic', price: 45, crowd: 10, weather: 30 },
  ],
};

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
    image: 'https://images.unsplash.com/photo-1570042754636-079e88583c10?w=1200&q=80',
    desc: 'Itinerario por los molinos de viento más emblemáticos de La Mancha',
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
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    desc: 'Recorre la costa española de sur a norte visitando los faros más emblemáticos',
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
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
    desc: 'Ruta por el interior de la Región de Murcia, descubriendo pueblos monumentales',
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
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80',
    desc: 'Recorre las principales regiones vinícolas de España',
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
    image: 'https://images.unsplash.com/photo-1551524559-8af4e66a2f60?w=1200&q=80',
    desc: 'Estaciones de esquí en los Pirineos, pueblos de montaña con encanto',
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
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    desc: 'Las mejores playas de la Costa del Sol y Costa de la Luz',
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
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
    desc: 'Recorre la costa cantábrica desde Galicia hasta el País Vasco',
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    desc: 'Ruta por las ciudades Patrimonio de la Humanidad por la UNESCO',
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
  {
    id: 'segovia',
    title: 'Segovia Medieval: Pedraza y Puebla de Pedraza',
    region: 'Castilla y León',
    days: '4',
    km: '180',
    difficulty: 'Fácil',
    bestTime: 'Marzo, Abril, Mayo, Sept, Oct',
    icon: '🏰',
    color: 'from-amber-700 to-stone-600',
    Icon: Landmark,
    image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6d54?w=1200&q=80',
    desc: 'Sumérgete en la Castilla medieval: el Alcázar de Segovia, la villa amurallada de Pedraza',
    details: [
      'Segovia - Acueducto Romano (siglo I), Alcázar, Catedral gótica "La Dama", Judería medieval y Mirador de San Marcos al atardecer',
      'Mesón de Cándido - Cochinillo segoviano asado en horno de leña, receta desde 1861, junto al Acueducto',
      'Ermita de San Frutos del Duratón - Joya románica sobre las Hoces del Duratón, reserva natural con buitres leonados',
      'Sepúlveda - Villa medieval declarada Conjunto Histórico-Artístico, sopa castellana y judiones de la zona',
      'Palacio Real de La Granja de San Ildefonso - El "Versalles español", jardines con 14 fuentes monumentales de mitología clásica',
      'Valsaín y Bosque de La Mata - Pinar de silvestre centenario, paseo serrano de nivel fácil',
      'Pedraza - Villa medieval peatonal, Plaza Mayor, Cárcel medieval, Castillo, Museo del Carbón y caminata por el Arroyo de la Hoz',
      'Noches de los Candiles (julio) - Pedraza se ilumina solo con velas, música medieval y teatro al aire libre',
      'Puebla de Pedraza - Pueblo de piedra caliza con 30 habitantes, arquitectura popular del siglo XII sin alteraciones',
      'Iglesia de San Andrés (Puebla) - Románica del siglo XII, ábside semicircular, canecillos decorados, bóvedas de cañón',
      'Mirador de la Sierra (Puebla) - Vistas de Peñalara y Siete Picos, fotografía de paisaje y silencio absoluto',
      'Castro de la Mesa de Miranda (opcional) - Asentamiento celtíbero del siglo V a.C. con tres líneas de muralla',
    ],
    highlights: 'Patrimonio UNESCO (Alcázar + Acueducto), 3 Conjuntos Histórico-Artísticos, cochinillo segoviano, Noches de los Candiles, románico rural',
    cost: '150-200€/día',
  },
  {
    id: 'buceo',
    title: 'Buceo en el Mediterráneo: 5 Zonas en 5 Días',
    region: 'Costa Mediterránea',
    days: '5',
    km: 'Multi-zona',
    difficulty: 'Moderado',
    bestTime: 'Mayo, Junio, Sept, Oct',
    icon: '🤿',
    color: 'from-cyan-700 to-teal-600',
    Icon: Umbrella,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    desc: 'Descubre los fondos marinos más espectaculares del Mediterráneo español',
    details: [
      'Cabo de Palos-Islas Hormigas (Murcia) - Reserva marina con La Losa (monte submarino con gorgonias rojas y meros de 100 kg), El Cavernón (cuevas y túneles submarinos) y El Bajo de Fuera (pelágicos y dentones)',
      'L\'Estartit - Islas Medas (Reserva Marina Integral desde 1990), El Toro (pared vertical de 38m con gorgonias y corales rojos), Las Cuevas (galerías con Pinna nobilis y ostras de roca)',
      'Cabo de Creus (Girona) - La Catedral de Portlligat (arco submarino con coral rojo protegido), Los Ullastres (langosta roja en recuperación), Punta Falconera (pared de 45m con gorgonias centenarias)',
      'Isla de Tabarca (Alicante) - Reserva marina más antigua de España (1986), La Llosa (monte de 32m con morenas y congrios), pecio artificial del Náufrago (2002, colonizado por lubinas y sardinas), praderas de posidonia milenarias',
      'Formentera (Baleares) - Posidonia Patrimonio UNESCO, Bajo de Popop (la mejor inmersión de Baleares, barracudas y rayas águila), Illeta des Cap des Falcó (caballitos de mar frecuentes), pecios del siglo XIX',
      'Cursos disponibles: Todos los centros ofrecen bautismo (sin certificación), Open Water y Advanced. 8 centros en Cabo de Palos, 6 en Medas, 5 en Cadaqués, 3 en Tabarca, 5 en Formentera',
      'Mejor época: Septiembre ofrece agua cálida (22-26°C) y visibilidad máxima (hasta 40m en Formentera). Mayo-Junio ideal para evitar masificación',
      'Conservación: No tocar fauna, no recoger corales, flotabilidad neutra para no dañar posidonia, protector solar sin oxibenzona',
    ],
    highlights: '5 reservas marinas, posidonia UNESCO, meros gigantes, visibilidad 40m, pecios históricos, langosta roja',
    cost: '120-180€/día',
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
  segovia: Landmark,
  buceo: Umbrella,
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
              <div className="relative overflow-hidden rounded-2xl h-72 cursor-pointer hover:scale-[1.02] transition-all duration-300 group">
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-30 mix-blend-multiply`} />
                  
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
            <div className="text-3xl font-bold text-emerald-400">10</div>
            <div className="text-slate-400 text-sm">Rutas temáticas</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">75+</div>
            <div className="text-slate-400 text-sm">Destinos</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">5.000</div>
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
        <div className="relative overflow-hidden rounded-2xl h-64 mb-8">
          {route.image && (
            <img
              src={route.image}
              alt={route.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className={`absolute inset-0 bg-gradient-to-br ${route.color} opacity-30 mix-blend-multiply`} />
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

        {/* ML Prediction: Cuándo Ir - Visualización Predictiva */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-lg font-bold text-white">Predicción IA: ¿Cuándo ir?</h3>
              <p className="text-slate-400 text-sm">Análisis de precios, afluencia y clima mes a mes</p>
            </div>
          </div>
          
          {/* AI Recommendation Summary */}
          {(() => {
            const predictions = ROUTE_PREDICTIONS[route.id] || ROUTE_PREDICTIONS['molinos'];
            const bestMonth = predictions.reduce((best, m) => {
              const score = (100 - m.price) * 0.4 + (100 - m.crowd) * 0.35 + m.weather * 0.25;
              const bestScore = (100 - best.price) * 0.4 + (100 - best.crowd) * 0.35 + best.weather * 0.25;
              return score > bestScore ? m : best;
            });
            const worstMonth = predictions.reduce((worst, m) => {
              const score = m.price * 0.4 + m.crowd * 0.35 + (100 - m.weather) * 0.25;
              const worstScore = worst.price * 0.4 + worst.crowd * 0.35 + (100 - worst.weather) * 0.25;
              return score > worstScore ? m : worst;
            });
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>⭐ Mes Ideal</span>
                  </div>
                  <div className="text-white font-bold text-xl">{bestMonth.month}</div>
                  <div className="text-emerald-300/70 text-xs mt-1">Mejor equilibrio clima/precio</div>
                </div>

                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-1">
                    <Users className="w-4 h-4" />
                    <span>👥 Mes más tranquilo</span>
                  </div>
                  <div className="text-white font-bold text-xl">
                    {predictions.reduce((min, m) => m.crowd < min.crowd ? m : min).month}
                  </div>
                  <div className="text-amber-300/70 text-xs mt-1">Menos turistas = Mejor experiencia</div>
                </div>

                <div className="bg-rose-500/10 rounded-lg p-4 border border-rose-500/20">
                  <div className="flex items-center gap-2 text-rose-400 text-sm font-bold mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>⚠️ Evitar</span>
                  </div>
                  <div className="text-white font-bold text-xl">{worstMonth.month}</div>
                  <div className="text-rose-300/70 text-xs mt-1">Más caro y masificado</div>
                </div>
              </div>
            );
          })()}

          {/* Price + Crowd Chart */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-4">📈 Precio vs Afluencia Mensual</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ROUTE_PREDICTIONS[route.id] || ROUTE_PREDICTIONS['molinos']}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    name="Precio"
                    stroke="#3b82f6"
                    fill="url(#priceGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="crowd"
                    name="Afluencia"
                    stroke="#f59e0b"
                    fill="url(#crowdGradient)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">Precio (índice)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-slate-300">Afluencia turística</span>
              </div>
            </div>
          </div>

          {/* Weather Chart */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-4">🌤️ Clima Mensual (Índice 0-100)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ROUTE_PREDICTIONS[route.id] || ROUTE_PREDICTIONS['molinos']}>
                  <defs>
                    <linearGradient id="weatherGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="weather" name="Clima" fill="url(#weatherGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">✨ Highlights</h3>
          <p className="text-slate-300">{route.highlights}</p>
        </div>

        {/* Smart Share buttons */}
        <div className="flex gap-3 mb-8">
          {(() => {
            const predictions = ROUTE_PREDICTIONS[route.id] || ROUTE_PREDICTIONS['molinos'];
            const bestMonth = predictions.reduce((best, m) => {
              const score = (100 - m.price) * 0.4 + (100 - m.crowd) * 0.35 + m.weather * 0.25;
              const bestScore = (100 - best.price) * 0.4 + (100 - best.crowd) * 0.35 + best.weather * 0.25;
              return score > bestScore ? m : best;
            });
            const insight = `🤖 La IA recomienda ir en ${bestMonth.month} (mejor precio/clima)`;
            const text = encodeURIComponent(`🛣️ ${route.title}\n\n${route.desc}\n\n${insight}\n\nDescúbrelo en Viaje con Inteligencia:`);
            const url = encodeURIComponent(window.location.href);
            
            return (
              <>
                <button
                  onClick={() => window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir en Telegram
                </button>
                <button
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank')}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir en WhatsApp
                </button>
              </>
            );
          })()}
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
