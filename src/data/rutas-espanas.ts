export type ThemeRoute = 'molinos' | 'faros' | 'murcia' | 'vino';

export type DurationOption = 3 | 4 | 5 | 7;

export interface WineSeason {
  name: string;
  months: string[];
  crowdLevel: 'bajo' | 'medio' | 'alto';
  priceMultiplier: number;
  notes: string;
}

export interface WineRegion {
  name: string;
  do: string;
  province: string;
  coordinates: [number, number];
  description: string;
  wines: string[];
  topWineries: string[];
  visitTime: number;
  avgTastingPrice: number;
  requiresAppointment: boolean;
}

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
];

export const wineSeasons: WineSeason[] = [
  {
    name: 'Vendimia',
    months: ['Septiembre', 'Octubre'],
    crowdLevel: 'alto',
    priceMultiplier: 1.3,
    notes: 'Actividades de vendimia, experiencia autentica'
  },
  {
    name: 'Invierno',
    months: ['Diciembre', 'Enero', 'Febrero'],
    crowdLevel: 'bajo',
    priceMultiplier: 0.8,
    notes: 'Bodegas tranquilas, mejores precios'
  },
  {
    name: 'Primavera',
    months: ['Marzo', 'Abril', 'Mayo'],
    crowdLevel: 'medio',
    priceMultiplier: 1.0,
    notes: 'Tiempo moderado, paisajes verdes'
  },
  {
    name: 'Verano',
    months: ['Junio', 'Julio', 'Agosto'],
    crowdLevel: 'alto',
    priceMultiplier: 1.2,
    notes: 'Catas al aire libre, temperaturas altas'
  },
];

export const riojaLocations: WineRegion[] = [
  {
    name: 'Haro',
    do: 'DOCa Rioja',
    province: 'La Rioja',
    coordinates: [42.5778, -2.9319],
    description: 'Capital del vino Rioja con mas de 60 bodegas',
    wines: ['Rioja Reserva', 'Rioja Gran Reserva'],
    topWineries: ['Bilbao', 'Muga', 'Rodolfo', 'Carchoir'],
    visitTime: 4,
    avgTastingPrice: 25,
    requiresAppointment: false,
  },
  {
    name: 'Logrono',
    do: 'DOCa Rioja',
    province: 'La Rioja',
    coordinates: [42.4687, -2.4456],
    description: 'Ciudad con calle Laurel de tapas y bodegas historicas',
    wines: ['Rioja Crianza', 'Rioja Reserva'],
    topWineries: ['Marques de Riscal', 'Ontaion'],
    visitTime: 3,
    avgTastingPrice: 20,
    requiresAppointment: false,
  },
  {
    name: 'Briones',
    do: 'DOCa Rioja',
    province: 'La Rioja',
    coordinates: [42.5167, -2.7833],
    description: 'Pueblo con Museo del Vino dinamizado',
    wines: ['Rioja Reserva', 'Rioja Blanco'],
    topWineries: ['CVNE', 'Darien'],
    visitTime: 2,
    avgTastingPrice: 18,
    requiresAppointment: false,
  },
  {
    name: 'San Asensio',
    do: 'DOCa Rioja',
    province: 'La Rioja',
    coordinates: [42.4167, -2.7833],
    description: 'Tradicion vinicola desde 1879',
    wines: ['Rioja Reserva', 'Rioja Gran Reserva'],
    topWineries: ['Ontaion', 'Vina Lanciano'],
    visitTime: 2,
    avgTastingPrice: 22,
    requiresAppointment: true,
  },
];

export const riberaDueroLocations: WineRegion[] = [
  {
    name: 'Aranda de Duero',
    do: 'DO Ribera del Duero',
    province: 'Burgos',
    coordinates: [41.6708, -3.6892],
    description: 'Centrovinicola con mas de 100 bodegas',
    wines: ['Ribera del Duero Reserva', 'Ribera del Duero Gran Reserva'],
    topWineries: ['Vega Sicilia', 'Pingus', 'Dominio de Pingus'],
    visitTime: 4,
    avgTastingPrice: 30,
    requiresAppointment: true,
  },
  {
    name: 'Roa de Duero',
    do: 'DO Ribera del Duero',
    province: 'Burgos',
    coordinates: [41.6833, -3.9333],
    description: 'Pueblo medieval con vistas al rio',
    wines: ['Ribera del Duero Reserva'],
    topWineries: ['Aalto', 'Pago de los Capellanes'],
    visitTime: 2,
    avgTastingPrice: 18,
    requiresAppointment: false,
  },
  {
    name: 'Penafiel',
    do: 'DO Ribera del Duero',
    province: 'Valladolid',
    coordinates: [41.5944, -4.1128],
    description: 'Museo del Vino y Castillo',
    wines: ['Ribera del Duero Reserva', 'Rosado'],
    topWineries: ['Protos', 'Arrode'],
    visitTime: 3,
    avgTastingPrice: 15,
    requiresAppointment: false,
  },
  {
    name: 'Soria',
    do: 'DO Ribera del Duero',
    province: 'Soria',
    coordinates: [41.9833, -2.4667],
    description: 'Zona menos mas旅游, vinos unicos',
    wines: ['Ribera del Duero'],
    topWineries: ['Numanthia'],
    visitTime: 3,
    avgTastingPrice: 20,
    requiresAppointment: true,
  },
];

export const riasBaixasLocations: WineRegion[] = [
  {
    name: 'Cambados',
    do: 'DO Rias Baixas',
    province: 'Pontevedra',
    coordinates: [42.5644, -8.8133],
    description: 'Capital del Albariño con Museo del Vino',
    wines: ['Albariño', 'Albariño Espumoso'],
    topWineries: ['Santiago Ruiz', 'Perez Cambados', 'Fillaboa'],
    visitTime: 3,
    avgTastingPrice: 15,
    requiresAppointment: false,
  },
  {
    name: 'Sanxenxo',
    do: 'DO Rias Baixas',
    province: 'Pontevedra',
    coordinates: [42.4000, -8.8000],
    description: 'Zona costera con bodegas cerca del mar',
    wines: ['Albariño', 'Rio'],
    topWineries: ['Galiciauto', 'Adega Valdamor'],
    visitTime: 2,
    avgTastingPrice: 12,
    requiresAppointment: false,
  },
  {
    name: 'Meis',
    do: 'DO Rias Baixas',
    province: 'Pontevedra',
    coordinates: [42.5167, -8.5833],
    description: 'Valle del Salnes, epicentro del Albariño',
    wines: ['Albariño'],
    topWineries: ['Martin Codax', 'Paraje'],
    visitTime: 2,
    avgTastingPrice: 14,
    requiresAppointment: false,
  },
  {
    name: 'Ribadumia',
    do: 'DO Rias Baixas',
    province: 'Pontevedra',
    coordinates: [42.4833, -8.7500],
    description: 'Bodegas centenarios',
    wines: ['Albariño', 'Treixadura'],
    topWineries: ['Lagar de Cervera', 'Vina代数'],
    visitTime: 2,
    avgTastingPrice: 16,
    requiresAppointment: false,
  },
];

export const penedesLocations: WineRegion[] = [
  {
    name: 'Sant Sadurni d',
    do: 'DO Penedes',
    province: 'Barcelona',
    coordinates: [41.4250, -1.7833],
    description: 'Capital del Cava, primera DO 100% ecologica del mundo',
    wines: ['Cava', 'Cava Reserva', 'Cava Gran Reserva'],
    topWineries: ['Freixenet', 'Codorniu', 'Segura'],
    visitTime: 3,
    avgTastingPrice: 18,
    requiresAppointment: false,
  },
  {
    name: 'Subirats',
    do: 'DO Penedes',
    province: 'Barcelona',
    coordinates: [41.4500, -1.9333],
    description: 'Castillos y viñedos',
    wines: ['Cava', 'Vino Blanco'],
    topWineries: ['Juvi & Camps', 'M举杯'],
    visitTime: 2,
    avgTastingPrice: 20,
    requiresAppointment: false,
  },
  {
    name: 'El Pla del Penedes',
    do: 'DO Penedes',
    province: 'Barcelona',
    coordinates: [41.3667, -1.7500],
    description: 'Paisajes de viñedos cerca Barcelona',
    wines: ['Cava Brut', 'Penedes Blanco'],
    topWineries: ['Albet i Noya', 'Miquel Pons'],
    visitTime: 2,
    avgTastingPrice: 15,
    requiresAppointment: false,
  },
];

export const jumillaLocations: WineRegion[] = [
  {
    name: 'Jumilla',
    do: 'DO Jumilla',
    province: 'Murcia',
    coordinates: [38.4833, -1.0833],
    description: 'DO con vinos tintos potentes, clima unico',
    wines: ['Jumilla Monastrell', 'Jumilla Reserva'],
    topWineries: ['Borra', 'Juan Gil', 'Volver'],
    visitTime: 3,
    avgTastingPrice: 12,
    requiresAppointment: false,
  },
  {
    name: 'Yecla',
    do: 'DO Yecla',
    province: 'Murcia',
    coordinates: [38.6167, -1.1167],
    description: 'Vinos tintos con identidad propia',
    wines: ['Yecla Monastrell'],
    topWineries: ['Castillo de Jumilla', 'Barahonda'],
    visitTime: 2,
    avgTastingPrice: 10,
    requiresAppointment: false,
  },
];

export const vinoLocations: Location[] = [
  {
    name: 'La Rioja',
    province: 'La Rioja',
    region: 'Rioja',
    coordinates: [42.4687, -2.4456],
    description: 'Laregion vinicola mas prestigiosa de Espana',
    highlights: ['Bodegas Haro', 'Barrio de la Laurel', 'Museo del Vino'],
    visitTime: 4,
  },
  {
    name: 'Ribera del Duero',
    province: 'Burgos',
    region: 'Castilla y Leon',
    coordinates: [41.6708, -3.6892],
    description: 'Vinos tintos intensos de alta montana',
    highlights: ['Vega Sicilia', 'Aranda de Duero', 'Museo del Vino'],
    visitTime: 4,
  },
  {
    name: 'Rias Baixas',
    province: 'Pontevedra',
    region: 'Galicia',
    coordinates: [42.5644, -8.8133],
    description: 'Albariño, vino blanco rafinado',
    highlights: ['Cambados', 'Albariño', 'Museo del Vino'],
    visitTime: 3,
  },
  {
    name: 'Penedes',
    province: 'Barcelona',
    region: 'Cataluna',
    coordinates: [41.4250, -1.7833],
    description: 'Capital del Cava, DO 100% ecologica',
    highlights: ['Cavas', 'Freixenet', 'Barcelonacerca'],
    visitTime: 3,
  },
  {
    name: 'Jumilla',
    province: 'Murcia',
    region: 'Murcia',
    coordinates: [38.4833, -1.0833],
    description: 'Monastrell potente,mejor precio',
    highlights: ['Borra', 'Juan Gil', 'Bodegasauthenticas'],
    visitTime: 3,
  },
  {
    name: 'Montilla-Moriles',
    province: 'Cordoba',
    region: 'Andalucia',
    coordinates: [37.6000, -4.6333],
    description: 'Vinos generosos uniques',
    highlights: ['Fino', 'Oloroso', 'Pedro Ximenez'],
    visitTime: 3,
  },
  {
    name: 'Ronda',
    province: 'Malaga',
    region: 'Andalucia',
    coordinates: [36.7333, -5.1500],
    description: 'Vinos de montana en ciudad romantica',
    highlights: ['Bodegas Gutierrez', 'Tajo', 'Viñedosmontana'],
    visitTime: 2,
  },
  {
    name: 'Txakoli Pais Vasco',
    province: 'Gipuzkoa',
    region: 'Pais Vasco',
    coordinates: [43.3167, -1.9333],
    description: 'Vino atlantico unico',
    highlights: ['Txakoli', 'Getaria', 'Hondarribia'],
    visitTime: 2,
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
    description: 'Ruta por el interior de la Region de Murcia, descubriendo pueblos monumentales, gastronomia y naturaleza',
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
  vino: {
    id: 'vino',
    name: 'Rutas del Vino de España',
    shortName: 'Ruta Vino',
    description: 'Recorre las principale regions vinicolas de Espana: Rioja, Ribera del Duero, Rias Baixas, Penedes, Jumilla y mas',
    image: '/images/rutas/vino-espana.jpg',
    category: 'cultural',
    region: 'nacional',
    totalDistance: 1200,
    totalDrivingTime: 18,
    bestSeason: ['Marzo', 'Abril', 'Mayo', 'Septiembre', 'Octubre', 'Noviembre'],
    difficulty: 'facil',
    roadType: 'autovia',
    avgDailyCost: { bajo: 80, medio: 150, alto: 350 },
    mlFeatures: { popularityScore: 7.0, safetyScore: 9.5, valueScore: 8.5 },
    segments: [
      { id: 1, name: 'La Rioja - Haro', from: 'Logrono', to: 'Haro', distance: 45, drivingTime: 0.5, locations: ['Logrono', 'Haro', 'Briones'] },
      { id: 2, name: 'Rioja - Ribera del Duero', from: 'Haro', to: 'Aranda de Duero', distance: 180, drivingTime: 2, locations: ['San Asensio', 'Aranda de Duero'] },
      { id: 3, name: 'Ribera del Duero - Rias Baixas', from: 'Aranda de Duero', to: 'Cambados', distance: 450, drivingTime: 5, locations: ['Penafiel', 'Cambados'] },
      { id: 4, name: 'Rias Baixas - Penedes', from: 'Cambados', to: 'Sant Sadurni', distance: 900, drivingTime: 10, locations: ['Sant Sadurni'] },
      { id: 5, name: 'Penedes - Jumilla', from: 'Sant Sadurni', to: 'Jumilla', distance: 550, drivingTime: 6, locations: ['Jumilla'] },
    ],
    locations: vinoLocations,
  },
};

export function getRouteById(id: ThemeRoute): ThematicRoute | undefined {
  return thematicRoutes[id];
}

export function getRoutesByDuration(duration: DurationOption): ThemeRoute[] {
  const map: Record<DurationOption, ThemeRoute[]> = {
    3: ['murcia', 'molinos'],
    4: ['murcia', 'molinos', 'vino'],
    5: ['molinos', 'faros', 'vino'],
    7: ['vino'],
  };
  return map[duration];
}

export function getBestWineSeason(month: string): WineSeason | undefined {
  return wineSeasons.find(s => s.months.includes(month));
}

export function getWineRouteRecommendation(
  regions: string[],
  month: string,
  budget: 'bajo' | 'medio' | 'alto'
): { region: string; score: number; reason: string }[] {
  const season = getBestWineSeason(month);
  const crowdPenalty = season ? (season.crowdLevel === 'alto' ? -10 : season.crowdLevel === 'bajo' ? 10 : 0) : 0;
  
  const regionScores: { region: string; score: number; reason: string }[] = regions.map(r => {
    const location = vinoLocations.find(l => l.name.toLowerCase().includes(r.toLowerCase()));
    if (!location) return { region: r, score: 50, reason: 'Region no encontrada' };
    
    let score = 70 + crowdPenalty;
    let reason = '';
    
    if (budget === 'bajo') {
      score += location.name.toLowerCase().includes('jumilla') || location.name.toLowerCase().includes('montilla') ? 20 : -5;
      reason = 'Mejor relacion precio-calidad';
    } else if (budget === 'alto') {
      score += location.name.toLowerCase().includes('rioja') || location.name.toLowerCase().includes('ribera') ? 15 : 0;
      reason = 'Vinos premium y experiencias exclusivas';
    } else {
      reason = 'Opcion equilibrada';
    }
    
    return { region: r, score, reason };
  });
  
  return regionScores.sort((a, b) => b.score - a.score);
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