export type Ruta = {
  slug: string;
  titulo: string;
  descripcion: string;
  dias: number;
  presupuesto: 'bajo' | 'medio' | 'alto';
  zonas: string[];
  perfil: string;
  tags: string[];
  itinerario: { dia: number; titulo: string; descripcion: string }[];
  riesgo: 'bajo' | 'medio' | 'alto';
  riesgoNota: string;
};

export const RUTAS: Ruta[] = [
  {
    slug: 'camino-de-santiago',
    titulo: 'Camino de Santiago Francés',
    descripcion: 'La ruta jacobea más popular del mundo: 780 km desde Saint-Jean-Pied-de-Port hasta Santiago de Compostela atravesando Navarra, La Rioja, Castilla y León y Galicia.',
    dias: 30,
    presupuesto: 'bajo',
    zonas: ['Navarra', 'La Rioja', 'Castilla y León', 'Galicia'],
    perfil: 'aventurero',
    tags: ['senderismo', 'cultura', 'naturaleza'],
    riesgo: 'bajo',
    riesgoNota: 'Ruta muy transitada y bien señalizada. Riesgo mínimo. Precaución en etapas de alta montaña en invierno.',
    itinerario: [
      { dia: 1, titulo: 'Saint-Jean-Pied-de-Port → Roncesvalles', descripcion: 'Etapa más dura: cruce de los Pirineos por el puerto de Ibañeta. 25 km, desnivel +1.400m.' },
      { dia: 2, titulo: 'Roncesvalles → Pamplona', descripcion: 'Bajada suave por el bosque de Erro hasta la capital navarra. 40 km.' },
      { dia: 7, titulo: 'Logroño → Nájera', descripcion: 'Entrada a La Rioja, viñedos y bodegas. 29 km.' },
      { dia: 15, titulo: 'Burgos → Meseta castellana', descripcion: 'Inicio de la meseta: paisajes abiertos y silencio. Etapas largas y llanas.' },
      { dia: 25, titulo: 'O Cebreiro → Galicia', descripcion: 'Entrada a Galicia por el mítico O Cebreiro. Verde, lluvia y eucaliptos.' },
      { dia: 30, titulo: 'Santiago de Compostela', descripcion: 'Llegada a la Catedral. La Misa del Peregrino a las 12:00.' },
    ],
  },
  {
    slug: 'ruta-del-quijote',
    titulo: 'Ruta del Quijote — La Mancha',
    descripcion: 'Por los paisajes de Cervantes: molinos de viento, castillos medievales y llanuras infinitas de Castilla-La Mancha.',
    dias: 7,
    presupuesto: 'bajo',
    zonas: ['Castilla-La Mancha'],
    perfil: 'cultural',
    tags: ['cultura', 'historia', 'road-trip'],
    riesgo: 'bajo',
    riesgoNota: 'Zona rural tranquila. Sin riesgos reseñables. Calor extremo en verano (>40°C): salir antes de las 9h.',
    itinerario: [
      { dia: 1, titulo: 'Toledo', descripcion: 'Ciudad imperial: catedral, Alcázar y judería. Base de operaciones.' },
      { dia: 2, titulo: 'Consuegra', descripcion: 'Los molinos de viento más fotogénicos de La Mancha sobre el cerro Calderico.' },
      { dia: 3, titulo: 'Campo de Criptana', descripcion: 'Molinos originales del s.XVI. Pueblo blanco manchego auténtico.' },
      { dia: 5, titulo: 'Almagro', descripcion: 'Corral de Comedias del s.XVII, único en el mundo. Plaza Mayor porticada.' },
      { dia: 7, titulo: 'Cuenca', descripcion: 'Casas colgadas y ciudad patrimonio UNESCO. Fin de ruta.' },
    ],
  },
  {
    slug: 'costa-brava-y-pirineos',
    titulo: 'Costa Brava y Pirineos Catalanes',
    descripcion: 'Combina calas cristalinas de la Costa Brava con pueblos medievales del Pirineo catalán. De Cadaqués a la Cerdanya.',
    dias: 10,
    presupuesto: 'medio',
    zonas: ['Girona', 'Cataluña'],
    perfil: 'familiar',
    tags: ['playa', 'montaña', 'naturaleza'],
    riesgo: 'bajo',
    riesgoNota: 'Zona turística consolidada. Riesgo bajo. En Pirineos: consultar previsión de tormentas de tarde en verano.',
    itinerario: [
      { dia: 1, titulo: 'Barcelona → Cadaqués', descripcion: 'Llegada al pueblo más bohemio de la Costa Brava. Casa Dalí en Portlligat.' },
      { dia: 3, titulo: 'Cap de Creus', descripcion: 'El punto más oriental de la Península. Parque Natural espectacular.' },
      { dia: 5, titulo: 'Begur y Palafrugell', descripcion: 'Las calas más exclusivas: Aiguablava, Tamariu, Llafranc.' },
      { dia: 7, titulo: 'Girona ciudad', descripcion: 'Barrio judío, catedral y murallas. Escenario de Juego de Tronos.' },
      { dia: 9, titulo: 'Cerdanya — Pirineos', descripcion: 'Valle soleado a 1.000m. Pueblos románicos, esquí y senderismo.' },
    ],
  },
  {
    slug: 'andalucia-profunda',
    titulo: 'Andalucía Profunda',
    descripcion: 'De Sevilla a Granada pasando por Córdoba y la Alpujarra. Flamenco, arquitectura árabe y gastronomía del sur.',
    dias: 12,
    presupuesto: 'medio',
    zonas: ['Sevilla', 'Córdoba', 'Granada', 'Almería'],
    perfil: 'cultural',
    tags: ['cultura', 'gastronomía', 'historia'],
    riesgo: 'bajo',
    riesgoNota: 'Turismo masivo en verano. Riesgo de golpe de calor en julio/agosto (>45°C en Sevilla). Actividad normal el resto del año.',
    itinerario: [
      { dia: 1, titulo: 'Sevilla', descripcion: 'Giralda, Alcázar y Triana. Tablaos flamencos por la noche.' },
      { dia: 3, titulo: 'Córdoba', descripcion: 'La Mezquita-Catedral y el Barrio de la Judería. Declarada Patrimonio UNESCO.' },
      { dia: 6, titulo: 'Granada — Alhambra', descripcion: 'Reserva entradas con semanas de antelación. Sunset desde el Mirador de San Nicolás.' },
      { dia: 9, titulo: 'Las Alpujarras', descripcion: 'Pueblos blancos colgados de Sierra Nevada. Pampaneira, Bubión, Capileira.' },
      { dia: 12, titulo: 'Almería — Cabo de Gata', descripcion: 'Parque Natural más árido de Europa. Playas vírgenes y volcánicas.' },
    ],
  },
  {
    slug: 'picos-de-europa',
    titulo: 'Picos de Europa y Costa Cantábrica',
    descripcion: 'El corazón verde de España: Parque Nacional de Picos de Europa, Covadonga, acantilados cántabros y sidrerías asturianas.',
    dias: 8,
    presupuesto: 'medio',
    zonas: ['Asturias', 'Cantabria', 'Castilla y León'],
    perfil: 'aventurero',
    tags: ['senderismo', 'naturaleza', 'gastronomía'],
    riesgo: 'bajo',
    riesgoNota: 'Rutas de montaña: respetar señalización y no salir sin mapa en niebla. Costa: olas impredecibles en invierno.',
    itinerario: [
      { dia: 1, titulo: 'Oviedo', descripcion: 'Capital asturiana: catedral prerrománica y sidrerías en la calle Gascona.' },
      { dia: 2, titulo: 'Covadonga y Lagos', descripcion: 'Santuario nacional asturiano y Lagos de Enol a 1.100m. Llegar temprano.' },
      { dia: 4, titulo: 'Picos de Europa — Naranjo de Bulnes', descripcion: 'El Naranjo de Bulnes (Picu Urriellu): icono del alpinismo español.' },
      { dia: 6, titulo: 'Costa de Cantabria', descripcion: 'Santillana del Mar, Comillas y el Capricho de Gaudí.' },
      { dia: 8, titulo: 'Santander', descripcion: 'El Sardinero, Palacio de la Magdalena. Fin de ruta.' },
    ],
  },
  {
    slug: 'islas-canarias-tenerife-lanzarote',
    titulo: 'Canarias: Tenerife y Lanzarote',
    descripcion: 'Volcanes activos, playas de arena negra y paisajes lunares. El Teide y los Jameos del Agua como protagonistas.',
    dias: 10,
    presupuesto: 'medio',
    zonas: ['Tenerife', 'Lanzarote'],
    perfil: 'aventurero',
    tags: ['naturaleza', 'playa', 'volcanes'],
    riesgo: 'bajo',
    riesgoNota: 'Zona sísmica activa pero monitorizada. Sin riesgo turístico. Subida al Teide: permiso obligatorio para la cima.',
    itinerario: [
      { dia: 1, titulo: 'Santa Cruz de Tenerife', descripcion: 'Capital canaria. Mercado de Nuestra Señora de África.' },
      { dia: 2, titulo: 'Teide', descripcion: 'Ascenso al volcán más alto de España (3.718m). Permiso previo obligatorio.' },
      { dia: 4, titulo: 'Anaga y Teno', descripcion: 'Los dos macizos más antiguos de Tenerife. Bosque de laurisilva prehistórico.' },
      { dia: 6, titulo: 'Vuelo Tenerife → Lanzarote', descripcion: 'Cambio de isla. Paisaje lunar volcánico radicalmente distinto.' },
      { dia: 7, titulo: 'Timanfaya', descripcion: 'Parque Nacional de volcanes activos. Temperatura del suelo: 100°C a 10cm.' },
      { dia: 9, titulo: 'Jameos del Agua y Jameos', descripcion: 'Arte y naturaleza de César Manrique integrados en una cueva volcánica.' },
    ],
  },
];

export const presupuestoLabel: Record<string, string> = {
  bajo: '< 50€/día',
  medio: '50–100€/día',
  alto: '100€+/día',
};

export const presupuestoColor: Record<string, string> = {
  bajo: 'text-green-400 bg-green-500/10 border-green-500/20',
  medio: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  alto: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export const riesgoColor: Record<string, string> = {
  bajo: 'text-green-400 bg-green-500/10 border-green-500/20',
  medio: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  alto: 'text-red-400 bg-red-500/10 border-red-500/20',
};
