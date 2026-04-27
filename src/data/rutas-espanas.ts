export type ThemeRoute = 'molinos' | 'faros' | 'murcia';

export type DurationOption = 3 | 4 | 5;

export interface Location {
  name: string;
  province: string;
  region: string;
  coordinates: [number, number];
  description: string;
  highlights: string[];
  visitTime: number;
}

export interface RouteSegment {
  id: number;
  name: string;
  from: string;
  to: string;
  distance: number;
  drivingTime: number;
  locations: string[];
}

export interface ThematicRoute {
  id: ThemeRoute;
  name: string;
  shortName: string;
  description: string;
  image: string;
  category: 'cultural' | 'costero' | 'interior';
  region: 'nacional';
  totalDistance: number;
  totalDrivingTime: number;
  segments: RouteSegment[];
  locations: Location[];
  bestSeason: string[];
  difficulty: 'facil' | 'moderado' | 'dificil';
  roadType: 'autovia' | 'carretera_nacional' | 'mixto';
  avgDailyCost: {
    bajo: number;
    medio: number;
    alto: number;
  };
  mlFeatures: {
    popularityScore: number;
    safetyScore: number;
    valueScore: number;
  };
}

export const molinosLocations: Location[] = [
  {
    name: 'Alcala de Henares',
    province: 'Madrid',
    region: 'Comunidad de Madrid',
    coordinates: [40.4828, -3.3644],
    description: 'Ciudad cervantina con importante patrimonio histórico',
    highlights: ['Casa de Cervantes', 'Centro histórico', 'Universidad'],
    visitTime: 2,
  },
  {
    name: 'Alcala de Chivert',
    province: 'Albacete',
    region: 'Castilla-La Mancha',
    coordinates: [39.2667, -1.8833],
    description: 'Municipio de La Mancha con molinos históricos',
    highlights: ['Molinos de viento', 'Paraje natural', 'Vistas panorámicas'],
    visitTime: 3,
  },
  {
    name: 'Mota del Cuervo',
    province: 'Cuenca',
    region: 'Castilla-La Mancha',
    coordinates: [39.5833, -2.8667],
    description: 'Capital del molecismo con molinos del siglo XVI',
    highlights: ['Molinos de La Manchuela', 'Museo del Molino', 'Bodegas'],
    visitTime: 4,
  },
  {
    name: 'Campo de Criptana',
    province: 'Ciudad Real',
    region: 'Castilla-La Mancha',
    coordinates: [39.4081, -3.1247],
    description: 'Famoso por sus molinos en crestón bergensant',
    highlights: ['Molinos de Campo de Criptana', 'Teatro Cervantes', 'Bodegas'],
    visitTime: 4,
  },
  {
    name: 'Consuegra',
    province: 'Toledo',
    region: 'Castilla-La Mancha',
    coordinates: [39.4597, -3.6097],
    description: 'Molinos monumentales en colline delcastle',
    highlights: ['12 Molinos de Consuegra', 'Castillo', 'Lavanda'],
    visitTime: 5,
  },
  {
    name: 'Almagro',
    province: 'Ciudad Real',
    region: 'Castilla-La Mancha',
    coordinates: [38.8786, -3.2108],
    description: 'Ciudad teatral y Corral de Comedias',
    highlights: ['Corral de Comedias', 'Teatro Nacional', 'Museo del Encaje'],
    visitTime: 4,
  },
  {
    name: 'Cuenca',
    province: 'Cuenca',
    region: 'Castilla-La Mancha',
    coordinates: [40.0789, -2.1356],
    description: 'Ciudades collp s suspendidas',
    highlights: ['Casas Colgadas', 'Catedral', 'Senderismo'],
    visitTime: 6,
  },
  {
    name: 'Albacete',
    province: 'Albacete',
    region: 'Castilla-La Mancha',
    coordinates: [38.9942, -1.8589],
    description: 'Capital de La Mancha',
    highlights: ['Museo de la Cuchilleria', 'Parque Abelardo Sanchez', 'Gastronomia'],
    visitTime: 3,
  },
];

export const farosLocations: Location[] = [
  {
    name: 'Faro de Puntaumbria',
    province: 'Huelva',
    region: 'Andalucia',
    coordinates: [37.2227, -6.9284],
    description: 'Faro en el limite de Castilla',
    highlights: ['Playa Puntaumbria', 'Paraje natural', 'Atardeceres'],
    visitTime: 2,
  },
  {
    name: 'Faro de Trafalgar',
    province: 'Cadiz',
    region: 'Andalucia',
    coordinates: [36.1858, -6.0346],
    description: 'Faro cerca de la batalla de Trafalgar',
    highlights: ['Playa de Zahora', 'Torre de Trafalgar', 'Gastronomía'],
    visitTime: 2,
  },
  {
    name: 'Faro de Tarifa',
    province: 'Cadiz',
    region: 'Andalucia',
    coordinates: [36.0142, -5.6061],
    description: 'Punto mas al sur de peninsula',
    highlights: ['Mirador del Estrecho', 'Kitesurf', 'Isla de las Palomas'],
    visitTime: 4,
  },
  {
    name: 'Faro de Malaga',
    province: 'Malaga',
    region: 'Andalucia',
    coordinates: [36.6893, -4.4266],
    description: 'Faro en la ciudad de Malaga',
    highlights: ['Alcazaba', 'Muelle Uno', 'Museo Picasso'],
    visitTime: 3,
  },
  {
    name: 'Faro de Almeria',
    province: 'Almeria',
    region: 'Andalucia',
    coordinates: [36.8343, -2.4633],
    description: 'Faro en el Cabo de Gata',
    highlights: ['Cabo de Gata', 'Playa de los Muertos', 'Desierto'],
    visitTime: 3,
  },
  {
    name: 'Faro de Cabo de Gata',
    province: 'Almeria',
    region: 'Andalucia',
    coordinates: [36.7208, -2.1138],
    description: 'Faro en elparque natural',
    highlights: ['Parque Natural', 'Playas virgenes', 'Fauna marina'],
    visitTime: 4,
  },
  {
    name: 'Faro de Valencia',
    province: 'Valencia',
    region: 'Comunidad Valenciana',
    coordinates: [39.4438, -0.3133],
    description: 'Faro en la ciudad de Valencia',
    highlights: ['Ciudad de las Artes', 'Playa de la Malvarrosa', 'Historic center'],
    visitTime: 3,
  },
  {
    name: 'Faro de Oropesa',
    province: 'Castellon',
    region: 'Comunidad Valenciana',
    coordinates: [40.0921, 0.1313],
    description: 'Faro en la Costa de Azahar',
    highlights: ['Playa de Oropesa', 'Castillo', 'Palmeral'],
    visitTime: 2,
  },
  {
    name: 'Faro de Vinaros',
    province: 'Castellon',
    region: 'Comunidad Valenciana',
    coordinates: [40.4706, 0.4751],
    description: 'Faro en el limite con Tarragona',
    highlights: ['Puerto', 'Playa del Fortin', 'Gastronomia'],
    visitTime: 2,
  },
  {
    name: 'Faro de Tarragona',
    province: 'Tarragona',
    region: 'Cataluna',
    coordinates: [41.1147, 1.2589],
    description: 'Faro en la ciudad romana',
    highlights: ['Anfiteatro', 'Catedral', 'Casco antiguo'],
    visitTime: 3,
  },
  {
    name: 'Faro de Barcelona',
    province: 'Barcelona',
    region: 'Cataluna',
    coordinates: [41.3687, 2.1949],
    description: 'Faro en Montjuic',
    highlights: ['Sagrada Familia', 'Park Guell', 'Barrio Gotico'],
    visitTime: 4,
  },
  {
    name: 'Faro de Cap de Creus',
    province: 'Girona',
    region: 'Cataluna',
    coordinates: [42.3257, 3.3032],
    description: 'Punto mas al este de peninsula',
    highlights: ['Paraje de Cadaques', 'Dali museum', 'Cala'],
    visitTime: 4,
  },
  {
    name: 'Faro de Begur',
    province: 'Costa Brava',
    region: 'Cataluna',
    coordinates: [41.9547, 3.2078],
    description: 'Faro en la Costa Brava',
    highlights: ['Calas', 'Castillo', 'Gastronomia'],
    visitTime: 3,
  },
];

export const murciaLocations: Location[] = [
  {
    name: 'Murcia',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [37.9833, -1.1167],
    description: 'Capital del Reino de Murcia',
    highlights: ['Cathedral', 'Real Casino', 'Museo'],
    visitTime: 4,
  },
  {
    name: 'Cartagena',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [37.6000, -0.9833],
    description: 'Ciudad Romana y Naval',
    highlights: ['Teatro Romano', 'Castillo', 'Museo ARQ'],
    visitTime: 5,
  },
  {
    name: 'Caravaca de la Cruz',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [38.1050, -2.1233],
    description: 'Ciudad Santa, fiestas de interes turistico internacional',
    highlights: ['Santuario de la Vera Cruz', 'Castillo', 'Fiestas'],
    visitTime: 5,
  },
  {
    name: 'Calasparra',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [38.2333, -1.8500],
    description: 'Rio y arrozales, замora monumental',
    highlights: ['Castillo', 'Rice fields', 'River canoeing'],
    visitTime: 3,
  },
  {
    name: 'Moratalla',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [38.1833, -2.0333],
    description: 'Cruz de caravaca',
    highlights: ['Castillo', 'Nature', 'Gastronomia'],
    visitTime: 3,
  },
  {
    name: 'Lorca',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [37.6833, -1.7000],
    description: 'Ciudad del Sol',
    highlights: ['Castillo', 'Apostol','Parque'],
    visitTime: 3,
  },
  {
    name: 'Cieza',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [38.2500, -1.4000],
    description: 'Tierras de frutales y naturaleza',
    highlights: ['Eras', 'Senderismo', 'Fruta'],
    visitTime: 2,
  },
  {
    name: 'Yecla',
    province: 'Murcia',
    region: 'Region de Murcia',
    coordinates: [38.6167, -1.1167],
    description: 'Ciudad del vino',
    highlights: ['Museo del vino', 'Yecca city', 'Bodegas'],
    visitTime: 3,
  },
];

export const thematicRoutes: Record<ThemeRoute, ThematicRoute> = {
  molinos: {
    id: 'molinos',
    name: 'Ruta de los Molinos de La Mancha',
    shortName: 'Ruta Molinos',
    description: 'Itinerario por los molinos de viento mas emblematicos de La Mancha, desde Alcala de Henares hasta Albacete',
    image: '/images/rutas/molinos-la-mancha.jpg',
    category: 'cultural',
    region: 'nacional',
    totalDistance: 450,
    totalDrivingTime: 8,
    bestSeason: ['Abril', 'Mayo', 'Septiembre', 'Octubre'],
    difficulty: 'facil',
    roadType: 'mixto',
    avgDailyCost: { bajo: 80, medio: 150, alto: 300 },
    mlFeatures: { popularityScore: 7.5, safetyScore: 9.5, valueScore: 8.5 },
    segments: [
      { id: 1, name: 'Madrid - Mota del Cuervo', from: 'Madrid', to: 'Mota del Cuervo', distance: 180, drivingTime: 2, locations: ['Alcala de Henares', 'Alcala de Chivert', 'Mota del Cuervo'] },
      { id: 2, name: 'Mota del Cuervo - Campo de Criptana', from: 'Mota del Cuervo', to: 'Campo de Criptana', distance: 55, drivingTime: 1, locations: ['Mota del Cuervo', 'Campo de Criptana'] },
      { id: 3, name: 'Campo de Criptana - Consuegra', from: 'Campo de Criptana', to: 'Consuegra', distance: 70, drivingTime: 1.5, locations: ['Campo de Criptana', 'Consuegra'] },
      { id: 4, name: 'Consuegra - Almagro', from: 'Consuegra', to: 'Almagro', distance: 80, drivingTime: 1.5, locations: ['Consuegra', 'Almagro'] },
      { id: 5, name: 'Almagro - Cuenca', from: 'Almagro', to: 'Cuenca', distance: 90, drivingTime: 1.5, locations: ['Almagro', 'Cuenca'] },
      { id: 6, name: 'Cuenca - Albacete', from: 'Cuenca', to: 'Albacete', distance: 120, drivingTime: 2, locations: ['Cuenca', 'Albacete'] },
    ],
    locations: molinosLocations,
  },
  faros: {
    id: 'faros',
    name: 'Ruta de los Faros de España',
    shortName: 'Ruta Faros',
    description: 'Recorre la costa española desur a norte visitando los faros mas emblemáticos, desde Huelva hasta Gerona',
    image: '/images/rutas/faros-espana.jpg',
    category: 'costero',
    region: 'nacional',
    totalDistance: 2100,
    totalDrivingTime: 30,
    bestSeason: ['Mayo', 'Junio', 'Septiembre', 'Octubre'],
    difficulty: 'moderado',
    roadType: 'autovia',
    avgDailyCost: { bajo: 90, medio: 180, alto: 400 },
    mlFeatures: { popularityScore: 8.5, safetyScore: 9.0, valueScore: 7.0 },
    segments: [
      { id: 1, name: 'Huelva - Cadiz', from: 'Huelva', to: 'Cadiz', distance: 240, drivingTime: 3, locations: ['Faro de Puntaumbria'] },
      { id: 2, name: 'Cadiz - Malaga', from: 'Cadiz', to: 'Malaga', distance: 260, drivingTime: 3, locations: ['Faro de Trafalgar', 'Faro de Tarifa'] },
      { id: 3, name: 'Malaga - Almeria', from: 'Malaga', to: 'Almeria', distance: 280, drivingTime: 3, locations: ['Faro de Malaga', 'Faro de Almeria'] },
      { id: 4, name: 'Almeria - Valencia', from: 'Almeria', to: 'Valencia', distance: 450, drivingTime: 5, locations: ['Faro de Cabo de Gata', 'Faro de Valencia'] },
      { id: 5, name: 'Valencia - Castellon', from: 'Valencia', to: 'Castellon', distance: 160, drivingTime: 2, locations: ['Faro de Oropesa', 'Faro de Vinaros'] },
      { id: 6, name: 'Castellon - Tarragona', from: 'Castellon', to: 'Tarragona', distance: 180, drivingTime: 2.5, locations: ['Faro de Vinaros', 'Faro de Tarragona'] },
      { id: 7, name: 'Tarragona - Gerona', from: 'Tarragona', to: 'Gerona', distance: 280, drivingTime: 3.5, locations: ['Faro de Barcelona', 'Faro de Cap de Creus', 'Faro de Begur'] },
    ],
    locations: farosLocations,
  },
  murcia: {
    id: 'murcia',
    name: 'Interior de Murcia: Caravaca, Calasparra, Moratalla',
    shortName: 'Ruta Murcia',
    description: 'Ruta por el interior de la Region de Murcia, descubriendo pueblos monumentales, gastronomía y naturaleza',
    image: '/images/rutas/murcia-interior.jpg',
    category: 'interior',
    region: 'nacional',
    totalDistance: 280,
    totalDrivingTime: 6,
    bestSeason: ['Marzo', 'Abril', 'Mayo', 'Octubre', 'Noviembre'],
    difficulty: 'facil',
    roadType: 'carretera_nacional',
    avgDailyCost: { bajo: 70, medio: 130, alto: 250 },
    mlFeatures: { popularityScore: 6.0, safetyScore: 9.5, valueScore: 9.0 },
    segments: [
      { id: 1, name: 'Murcia - Cartagena', from: 'Murcia', to: 'Cartagena', distance: 70, drivingTime: 1, locations: ['Murcia', 'Cartagena'] },
      { id: 2, name: 'Cartagena - Caravaca', from: 'Cartagena', to: 'Caravaca de la Cruz', distance: 90, drivingTime: 1.5, locations: ['Cartagena', 'Caravaca de la Cruz'] },
      { id: 3, name: 'Caravaca - Calasparra', from: 'Caravaca de la Cruz', to: 'Calasparra', distance: 40, drivingTime: 0.75, locations: ['Caravaca de la Cruz', 'Calasparra'] },
      { id: 4, name: 'Calasparra - Moratalla', from: 'Calasparra', to: 'Moratalla', distance: 35, drivingTime: 0.75, locations: ['Calasparra', 'Moratalla'] },
      { id: 5, name: 'Moratalla - Lorca', from: 'Moratalla', to: 'Lorca', distance: 45, drivingTime: 1, locations: ['Moratalla', 'Lorca'] },
      { id: 6, name: 'Lorca - Murcia', from: 'Lorca', to: 'Murcia', distance: 85, drivingTime: 1.5, locations: ['Lorca', 'Cieza', 'Murcia'] },
    ],
    locations: murciaLocations,
  },
};

export function getRouteById(id: ThemeRoute): ThematicRoute | undefined {
  return thematicRoutes[id];
}

export function getRoutesByDuration(duration: DurationOption): ThemeRoute[] {
  const map: Record<DurationOption, ThemeRoute[]> = {
    3: ['murcia', 'molinos'],
    4: ['murcia', 'molinos', 'faros'],
    5: ['molinos', 'faros'],
  };
  return map[duration];
}

export function generateDayByDay(
  routeId: ThemeRoute,
  days: number
): { day: number; activities: { location: string; time: number; description: string }[] }[] {
  const route = thematicRoutes[routeId];
  if (!route) return [];
  
  const dayLength = Math.ceil(route.locations.length / days);
  const itinerary: { day: number; activities: { location: string; time: number; description: string }[] }[] = [];
  
  for (let d = 0; d < days; d++) {
    const start = d * dayLength;
    const end = Math.min(start + dayLength, route.locations.length);
    const dayLocations = route.locations.slice(start, end);
    
    itinerary.push({
      day: d + 1,
      activities: dayLocations.map(loc => ({
        location: loc.name,
        time: loc.visitTime,
        description: loc.highlights.slice(0, 2).join(', '),
      })),
    });
  }
  
  return itinerary;
}