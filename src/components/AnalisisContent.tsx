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

const activityPools: Record<string, { cultural: string[]; playa: string[]; naturaleza: string[]; familiar: string[]; gastronomia: string[] }> = {
  cultural: {
    cultural: ['Visita guiada por el casco histórico con guía local', 'Museo nacional de historia y arte', 'Centro cultural con exposiciones temporales', 'Tour de arquitectura colonial/histórica', 'Visita a barrios artísticos con galerías', 'Palacio o residencia histórica', 'Monasterio/templo con historia centenaria', 'Mercado artesanal con talleres en vivo', 'Biblioteca o archivo histórico', 'Teatro o sala de espectáculos tradicional', 'Visita a universidad histórica', 'Tour de street art y murales', 'Cementerio histórico con personajes ilustres', 'Centro de interpretación de la cultura local', 'Festival o evento cultural si coincide'],
    playa: ['Paseo por el puerto pesquero', 'Visita a faro histórico costero', 'Museo marítimo o naval', 'Pueblo costero con encanto', 'Mercado de pescado fresco', 'Paseo marítimo al atardecer', 'Playa con historia local'],
    naturaleza: ['Jardín botánico histórico', 'Sendero cultural con patrimonio rupestre', 'Mirador panorámico con leyendas locales', 'Parque natural con rutas interpretadas', 'Observación de fauna autóctona'],
    familiar: ['Museo interactivo para niños', 'Parque temático o de atracciones', 'Acuario o zoológico local', 'Taller de artesanía para familias', 'Granja escuela o experiencia rural'],
    gastronomia: ['Tour gastronómico por el centro', 'Visita a mercado central con degustación', 'Clase de cocina tradicional', 'Ruta de tapas/pinchos por bares históricos', 'Cata de vinos o bebidas locales', 'Restaurante con estrella o reconocido', 'Visita a bodega/fábrica alimentaria', 'Festival gastronómico si coincide', 'Desayuno típico en local centenario', 'Cena en rooftop con vistas'],
  },
  playa: {
    cultural: ['Visita al casco histórico', 'Museo principal de la ciudad', 'Catedral o mezquita emblemática', 'Plaza central con monumentos', 'Tour fotográfico por puntos icónicos', 'Barrio bohemio con galerías'],
    playa: ['Día completo en playa principal', 'Snorkel o buceo en arrecife cercano', 'Paseo en kayak o paddle surf', 'Excursión en barco a calas secretas', 'Surf o bodyboard con instructor', 'Pesca deportiva o excursion', 'Playa virgen accesible en 1h', 'Snorkel con fauna marina', 'Atardecer desde mirador costero', 'Chiringuito con pescado fresco', 'Deportes náuticos (jet ski, vela)', 'Isla cercana con excursión de medio día'],
    naturaleza: ['Reserva natural costera', 'Acantilados con ruta de senderismo', 'Dunas o sistema dunar protegido', 'Manglares o humedal costero', 'Avistamiento de aves marinas'],
    familiar: ['Playa con aguas tranquilas para niños', 'Parque acuático cercano', 'Paseo en catamarán familiar', 'Construcción de castillos de arena', 'Búsqueda de conchas y fósiles en la playa'],
    gastronomia: ['Restaurante frente al mar con mariscos', 'Degustación de ceviche o plato local de pescado', 'Tour de marisquerías en el puerto', 'Cocina fusión costera', 'Desayuno con frutas tropicales', 'Cena romántica en la playa'],
  },
  naturaleza: {
    cultural: ['Museo de historia natural', 'Pueblo de montaña con arquitectura tradicional', 'Santuario o ermita en la naturaleza', 'Museo etnográfico local', 'Ruta de pueblos con encanto'],
    playa: ['Playa natural sin urbanizar', 'Calas accesibles solo por sendero'],
    naturaleza: ['Parque nacional con senderos señalizados', 'Ruta de trekking de día completo', 'Cascada o salto de agua', 'Lago o laguna de montaña', 'Avistamiento de fauna silvestre', 'Cueva o sistema kárstico visitable', 'Mirador de montaña al amanecer', 'Canopy o tirolinas en zona natural', 'Rafting o kayak en río', 'Ciclismo de montaña por rutas locales', 'Observación de estrellas (cielo limpio)', 'Volcán o formación geológica', 'Bosque autóctono con guía', 'Baño en aguas termales naturales', 'Fotografía de flora y fauna'],
    familiar: ['Parque natural con rutas fáciles', 'Granja ecológica visitable', 'Centro de interpretación de la naturaleza', 'Paseo a caballo por caminos rurales', 'Taller de medio ambiente para niños'],
    gastronomia: ['Restaurante de montaña con cocina local', 'Picnic en zona natural con productos regionales', 'Quesería o productora artesanal', 'Miel o productos del bosque', 'Cocina de aprovechamiento tradicional'],
  },
  familiar: {
    cultural: ['Museo con actividades infantiles', 'Centro de ciencia interactivo', 'Teatro con espectáculo para niños', 'Visita guiada adaptada para familias', 'Cuenta-cuentos en biblioteca o centro cultural'],
    playa: ['Playa familiar con servicios', 'Piscina natural para niños', 'Parque acuático', 'Paseo en barco con avistamiento de fauna'],
    naturaleza: ['Parque natural con rutas cortas', 'Reserva de animales', 'Jardín botánico', 'Paseo en tren turístico por la naturaleza'],
    familiar: ['Parque infantil temático', 'Zoológico o acuario', 'Granja escuela con animales', 'Taller de manualidades locales', 'Paseo en trenecito turístico', 'Espectáculo de marionetas o teatro infantil', 'Mini-golf o bowling local', 'Paseo en bici familiar por carril bici', 'Excursión al campo con merienda', 'Museo del juguete o de la infancia', 'Centro de ocio cubierto (si mal tiempo)', 'Actividad de voluntariado familiar (recogida playa, plantación)'],
    gastronomia: ['Restaurante con menú infantil', 'Heladería artesanal famosa', 'Mercado con degustación para niños', 'Taller de cocina para familias', 'Pizzería o restaurante temático divertido', 'Cafetería con zona de juegos'],
  },
  gastronomia: {
    cultural: ['Visita al mercado histórico de la ciudad', 'Barrio gastronómico con tradición', 'Museo de la alimentación o gastronomía', 'Tour por el casco histórico con paradas gastronómicas'],
    playa: ['Marisquería con producto del día', 'Restaurante con vistas al mar', 'Puerto pesquero con subasta de pescado', 'Chiringuito con especialidad local'],
    naturaleza: ['Restaurante con productos km 0', 'Huerto ecológico visitable', 'Restaurante en plena naturaleza', 'Forrajeo guiado con chef local'],
    familiar: ['Restaurante con menú infantil', 'Taller de cocina para niños y adultos', 'Granja con degustación de productos'],
    gastronomia: ['Tour de mercado con compra y cocina después', 'Cata de vinos con maridaje', 'Restaurante con estrella Michelin o reconocimiento', 'Clase de cocina con chef local', 'Ruta de bares de tapas/pinchos', 'Desayuno típico en local centenario', 'Cena en restaurante de autor', 'Visita a bodega o destilería', 'Tour de street food por la noche', 'Merendero con productos artesanales', 'Festival gastronómico o feria alimentaria', 'Quesería o embutidera artesanal', 'Panadería tradicional con degustación', 'Restaurante con cocina fusión local-internacional', 'Cena con espectáculo de música en vivo'],
  },
};

function getCitiesForCountry(pais: DatoPais, attrs: any): string[] {
  const capital = pais.capital;
  const countryCities: Record<string, string[]> = {
    ma: ['Marrakech', 'Fez', 'Chefchaouen', 'Casablanca', 'Essaouira', 'Meknes', 'Tangier', 'Merzouga (Sahara)', 'Ouarzazate', 'Rabat'],
    es: ['Madrid', 'Barcelona', 'Sevilla', 'Granada', 'Valencia', 'Bilbao', 'San Sebastián', 'Toledo', 'Córdoba', 'Salamanca', 'Málaga', 'Santiago de Compostela'],
    fr: ['París', 'Lyon', 'Marsella', 'Burdeos', 'Toulouse', 'Niza', 'Estrasburgo', 'Mont Saint-Michel', 'Annecy', 'Avignon'],
    it: ['Roma', 'Florencia', 'Venecia', 'Milán', 'Nápoles', 'Bolonia', 'Turín', 'Verona', 'Palermo', 'Sorrento'],
    pt: ['Lisboa', 'Oporto', 'Sintra', 'Faro', 'Coímbra', 'Évora', 'Braga', 'Aveiro', 'Madeira (Funchal)'],
    jp: ['Tokio', 'Kioto', 'Osaka', 'Nara', 'Hiroshima', 'Nikko', 'Kanazawa', 'Takayama', 'Hakone', 'Kamakura'],
    th: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi', 'Ayutthaya', 'Pattaya', 'Koh Samui', 'Chiang Rai', 'Sukhothai', 'Hua Hin'],
    mx: ['CDMX', 'Cancún', 'Oaxaca', 'San Miguel de Allende', 'Mérida', 'Puebla', 'Guadalajara', 'Playa del Carmen', 'Tulum', 'Guanajuato'],
    de: ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Fráncfort', 'Dresde', 'Heidelberg', 'Núremberg', 'Stuttgart', 'Bremen'],
    gb: ['Londres', 'Edimburgo', 'Manchester', 'Liverpool', 'Oxford', 'Cambridge', 'Bath', 'York', 'Cardiff', 'Brighton'],
    us: ['Nueva York', 'Los Ángeles', 'Chicago', 'San Francisco', 'Miami', 'Las Vegas', 'Washington DC', 'Boston', 'Nueva Orleans', 'Seattle'],
    ar: ['Buenos Aires', 'Córdoba', 'Mendoza', 'Bariloche', 'Salta', 'Ushuaia', 'Rosario', 'Mar del Plata', 'Tigre', 'El Calafate'],
    co: ['Bogotá', 'Cartagena', 'Medellín', 'Cali', 'San Andrés', 'Santa Marta', 'Eje Cafetero', 'Barranquilla', 'Manizales', 'Villa de Leyva'],
    pe: ['Lima', 'Cusco', 'Arequipa', 'Machu Picchu', 'Puno (Lago Titicaca)', 'Trujillo', 'Paracas', 'Nazca', 'Iquitos', 'Huaraz'],
    br: ['Río de Janeiro', 'São Paulo', 'Salvador de Bahía', 'Florianópolis', 'Manaos', 'Fortaleza', 'Recife', 'Brasilia', 'Curitiba', 'Belo Horizonte'],
    eg: ['El Cairo', 'Luxor', 'Asuán', 'Alejandría', 'Sharm el-Sheikh', 'Hurghada', 'Abu Simbel', 'Dahab', 'Aswan', 'Giza'],
    tr: ['Estambul', 'Capadocia (Göreme)', 'Éfeso', 'Antalya', 'Ankara', 'Pamukkale', 'Bodrum', 'Trabzon', 'Konya', 'Izmir'],
    cn: ['Pekín', 'Shanghái', 'Xi\'án', 'Guilin', 'Chengdu', 'Hangzhou', 'Suzhou', 'Cantón', 'Lijiang', 'Tibet (Lhasa)'],
    in: ['Delhi', 'Mumbai', 'Agra (Taj Mahal)', 'Jaipur', 'Kerala', 'Goa', 'Varanasi', 'Bangalore', 'Calcuta', 'Rajasthan'],
    au: ['Sídney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaida', 'Cairns', 'Uluru', 'Gold Coast', 'Hobart', 'Darwin'],
    gr: ['Atenas', 'Santorini', 'Mykonos', 'Creta (Heraklion)', 'Rodas', 'Corfú', 'Delfos', 'Salónica', 'Meteora', 'Nafplio'],
    cr: ['San José', 'Manuel Antonio', 'Arenal (La Fortuna)', 'Monteverde', 'Tortuguero', 'Puerto Viejo', 'Guanacaste (Liberia)', 'Drake Bay', 'Corcovado', 'Poás'],
    vn: ['Hanói', 'Ho Chi Minh (Saigón)', 'Da Nang', 'Hoi An', 'Halong Bay', 'Nha Trang', 'Sapa', 'Hue', 'Dalat', 'Phong Nha'],
    id: ['Bali (Denpasar)', 'Yakarta', 'Yogyakarta', 'Lombok', 'Komodo', 'Gili Islands', 'Ubud', 'Surabaya', 'Bandung', 'Raja Ampat'],
    nz: ['Auckland', 'Wellington', 'Queenstown', 'Christchurch', 'Rotorua', 'Milford Sound', 'Bay of Islands', 'Dunedin', 'Hobbiton', 'Tongariro'],
    za: ['Ciudad del Cabo', 'Johannesburgo', 'Durban', 'Kruger (Safari)', 'Garden Route', 'Pretoria', 'Port Elizabeth', 'Stellenbosch', 'Soweto', 'Hermanus'],
    cl: ['Santiago', 'Valparaíso', 'San Pedro de Atacama', 'Patagonia (Punta Arenas)', 'Isla de Pascua', 'Puerto Varas', 'Viña del Mar', 'Concepción', 'Torres del Paine', 'Chiloé'],
    kr: ['Seúl', 'Busan', 'Jeju Island', 'Gyeongju', 'Incheon', 'Daegu', 'Jeonju', 'Suwon', 'Sokcho', 'Andong'],
    is: ['Reikiavik', 'Círculo Dorado', 'Vík', 'Akureyri', 'Glaciar Vatnajökull', 'Blue Lagoon', 'Jökulsárlón', 'Snæfellsnes', 'Westfjords', 'Heimaey'],
    no: ['Oslo', 'Bergen', 'Tromsø', 'Lofoten', 'Trondheim', 'Stavanger', 'Flåm', 'Geirangerfjord', 'Ålesund', 'Narvik'],
    ie: ['Dublín', 'Galway', 'Cork', 'Killarney', 'Belfast', 'Dingle', 'Kilkenny', 'Cliffs of Moher', 'Waterford', 'Sligo'],
    il: ['Jerusalén', 'Tel Aviv', 'Haifa', 'Mar Muerto', 'Eilat', 'Nazaret', 'Belén', 'Jaffa', 'Acre', 'Galilea'],
    ae: ['Dubái', 'Abu Dabi', 'Sharjah', 'Al Ain', 'Fujairah', 'Ras Al Khaimah', 'Desierto de Rub al-Jali', 'Palm Jumeirah', 'Burj Khalifa', 'Gran Mezquita de Abu Dabi'],
  };

  return countryCities[pais.codigo] || [capital, `${capital} - alrededores`, 'Pueblo cercano', 'Región interior', 'Zona costera'];
}

function generateItinerary(pais: DatoPais, days: number, preferencia: string): { day: number; title: string; activities: string[]; tip: string }[] {
  const attrs = clusteringAttrs[pais.codigo];
  const it: { day: number; title: string; activities: string[]; tip: string }[] = [];
  const highlights = pais.queHacer.length > 0 ? pais.queHacer : ['Explorar la capital', 'Gastronomía local', 'Mercado central', 'Casco histórico'];
  const cities = getCitiesForCountry(pais, attrs);
  const pool = activityPools[preferencia] || activityPools.cultural;

  const tipsByPreference: Record<string, string[]> = {
    cultural: [
      'Compra la city pass o tarjeta turística si planeas visitar varios museos — ahorra 30-50%.',
      'Reserva entradas online con semanas de antelación para los monumentos más populares.',
      'Contrata un guía local para experiencias que los libros no cuentan.',
      'Evita lunes (muchos museos cierran) y horas punta (10:00-12:00).',
      'Lleva auriculares para las audioguías — muchos museos las ofrecen gratis.',
      'Visita al atardecer para mejor luz fotográfica y menos multitudes.',
      'Busca horarios de entrada gratuita (primer domingo del mes, tardes específicas).',
      'Descarga apps del patrimonio local para acceso offline a información.',
    ],
    playa: [
      'Protección solar SPF 50+ y reaplicar cada 2 horas — el agua no protege del sol.',
      'Consulta banderas y mareas antes de entrar al agua.',
      'Lleva calzado acuático si hay rocas o erizos de mar.',
      'Los chiringuegos locales suelen tener mejor pescado que los restaurantes turísticos.',
      'Alquila equipo de snorkel/buceo en tiendas locales (más barato que en hoteles).',
      'Mejor hora para playa: 7:00-10:00 (tranquila) o 16:00-19:00 (atardecer).',
      'Lleva bolsa impermeable para el móvil y objetos de valor.',
      'Respeta la fauna marina — no tocar corales ni alimentar peces.',
    ],
    naturaleza: [
      'Siempre avisa a alguien de tu ruta y hora estimada de regreso.',
      'Lleva al menos 2L de agua, protección solar y botiquín básico.',
      'Descarga mapas offline — en zonas naturales no hay cobertura.',
      'La mejor hora para ver fauna es al amanecer y al atardecer.',
      'Respeta la regla "deja solo huellas" — no dejes basura ni recojas plantas.',
      'Contrata guías locales para rutas de dificultad media-alta.',
      'Comprueba el clima antes de salir — las montañas cambian rápido.',
      'Lleva prismáticos ligeros para observación de fauna y paisajes.',
    ],
    familiar: [
      'Lleva snacks y agua — los niños se cansan y tienen hambre frecuentemente.',
      'Planifica paradas cada 1-2 horas de actividad — los ritmos infantiles son diferentes.',
      'Busca baños y zonas de descanso antes de salir — evita urgencias.',
      'Lleva muda de repuesto para los más pequeños.',
      'Actividades de 1-2 horas máximo — mejor varias cortas que una larga.',
      'Reserva con antelación actividades populares para evitar colas.',
      'Identifica farmacias y centros médicos cercanos al alojamiento.',
      'Involucra a los niños en la planificación — les motiva más si eligen.',
    ],
    gastronomia: [
      'Reserva restaurantes populares con al menos 1 semana de antelación.',
      'Los menús del día (mediodía) son la mejor relación calidad-precio.',
      'Pregunta a locales por sus restaurantes favoritos — TripAdvisor no siempre acierta.',
      'Prueba el plato típico de la región — cada zona tiene su especialidad.',
      'Los mercados centrales son ideales para desayunos y experiencias auténticas.',
      'Evita restaurantes con fotos de platos en la puerta o camareros insistentes.',
      'Lleva antialérgicos si tienes intolerancias — no todos los restaurantes las conocen.',
      'Las clases de cocina son una experiencia que combina gastronomía y cultura.',
    ],
  };

  const genericTips = [
    'Cambia moneda en bancos o cajeros — evita casas de cambio en aeropuertos.',
    'Descarga mapas offline de Google Maps antes de salir.',
    'Compra una SIM local o activa roaming internacional.',
    'Guarda copias digitales de tu pasaporte y documentos en la nube.',
    'Registra tu viaje en el consulado para emergencias.',
    'Lleva siempre una botella de agua rellenable.',
    'Aprende 5 frases básicas en el idioma local — marca la diferencia.',
    'Consulta la página del MAEC antes de viajar por actualizaciones de seguridad.',
  ];

  const preferenceTips = tipsByPreference[preferencia] || genericTips;

  function getTip(dayIndex: number, phase: string): string {
    if (phase === 'arrival') return genericTips[0];
    const tipPool = [...preferenceTips, ...genericTips];
    return tipPool[dayIndex % tipPool.length];
  }

  function getActivity(pool: string[], idx: number): string {
    return pool[idx % pool.length];
  }

  const maxDays = Math.min(days, 14);

  for (let d = 1; d <= maxDays; d++) {
    let title = '';
    let activities: string[] = [];
    let tip = '';

    // Phase 1: Capital exploration (days 1-3)
    if (d === 1) {
      const city = cities[0] || pais.capital;
      title = `Día 1 — Llegada a ${city}`;
      activities = [
        '09:00 — Llegada al aeropuerto/estación y traslado al alojamiento',
        '10:30 — Check-in y dejar equipaje, orientación rápida por la zona',
        '12:00 — Almuerzo de bienvenida en restaurante cercano',
        `14:00 — Primer paseo por ${city}: calle principal y plaza central`,
        '16:00 — Visita al mercado local o zona comercial',
        '18:00 — Paseo al atardecer para ambientarse',
        '20:00 — Cena en zona peatonal o barrio animado',
      ];
      tip = getTip(d, 'arrival');
    } else if (d === 2) {
      const city = cities[0] || pais.capital;
      title = `Día 2 — ${city}: Corazón cultural`;
      activities = [
        '08:00 — Desayuno típico en cafetería local (evita buffet del hotel)',
        '09:00 — Visita al monumento o museo más emblemático de la ciudad',
        attrs?.cultural && attrs.cultural >= 7
          ? '11:30 — Segundo museo o galería de arte local con guía'
          : '11:30 — Paseo por el casco histórico con parada en iglesias/palacios',
        '13:30 — Almuerzo en restaurante recomendado por locales',
        getActivity(pool.cultural, d - 1),
        '17:00 — Tiempo libre para compras o fotografía',
        '19:00 — Mirador o punto panorámico al atardecer',
        '21:00 — Cena en restaurante con cocina regional',
      ];
      tip = getTip(d, 'exploration');
    } else if (d === 3) {
      const city = cities[0] || pais.capital;
      title = `Día 3 — ${city}: Vida local y autenticidad`;
      activities = [
        '08:30 — Desayuno en mercado local o panadería artesanal',
        '09:30 — Barrio menos turístico: vida cotidiana y arquitectura local',
        getActivity(pool[preferencia as keyof typeof pool] || pool.cultural, d),
        '13:00 — Almuerzo en zona residencial auténtica',
        '15:00 — Actividad libre: taller artesanal, spa, o parque local',
        getActivity(pool.gastronomia, d + 1),
        '18:00 — Paseo por zona peatonal o parque urbano',
        '20:30 — Cena en restaurante que no aparece en guías turísticas',
      ];
      tip = getTip(d, 'local');
    }
    // Phase 2: Thematic days based on preference (days 4-5)
    else if (d <= 5) {
      const city = cities[1] || cities[0] || pais.capital;
      const isDay4 = d === 4;
      const theme = isDay4 ? pool[preferencia as keyof typeof pool] || pool.cultural : pool[preferencia as keyof typeof pool] || pool.naturaleza;
      const prefLabel = preferencia === 'cultural' ? 'Cultura profunda' : preferencia === 'playa' ? 'Costa y mar' : preferencia === 'naturaleza' ? 'Naturaleza salvaje' : preferencia === 'familiar' ? 'Diversión en familia' : 'Ruta gastronómica';
      title = `Día ${d} — ${city}: ${prefLabel}`;
      activities = [
        '08:00 — Desayuno temprano y salida hacia ' + city,
        getActivity(theme, d + 2),
        '11:00 — ' + getActivity(theme, d + 3),
        '13:00 — Almuerzo en ' + city + (preferencia === 'gastronomia' ? ': plato estrella de la región' : ': restaurante con buena relación calidad-precio'),
        getActivity(theme, d + 4),
        '16:00 — ' + getActivity(theme, d + 5),
        '18:00 — Regreso al alojamiento con parada en mirador o punto interesante',
        '20:00 — Cena y reflexión del día',
      ];
      tip = getTip(d, 'thematic');
    }
    // Phase 3: Multi-city excursion (days 6-7)
    else if (d <= 7) {
      const city = cities[d - 4] || cities[2] || cities[0] || 'Destino cercano';
      title = `Día ${d} — Excursión a ${city}`;
      activities = [
        '07:30 — Salida temprana hacia ' + city + (cities.length > 3 ? ` (${Math.round(Math.random() * 100 + 50)}km de ${cities[0]})` : ''),
        '09:00 — Llegada y primer recorrido por ' + city,
        getActivity(pool.cultural, d + 6),
        '12:30 — Almuerzo con especialidad local de la zona',
        getActivity(pool[preferencia as keyof typeof pool] || pool.cultural, d + 7),
        '15:30 — Exploración libre por ' + city + ': tiendas, cafés, rincones secretos',
        '17:00 — Regreso al alojamiento',
        '19:30 — Cena ligera cerca del alojamiento',
      ];
      tip = getTip(d, 'excursion');
    }
    // Phase 4: Highlights rotation (days 8-10)
    else if (d <= 10) {
      const highlight = highlights[(d - 8) % highlights.length] || `Exploración libre - Día ${d}`;
      const nextCity = cities[d - 6] || cities[d % cities.length] || 'Zona por descubrir';
      title = `Día ${d} — ${highlight}`;
      activities = [
        '08:30 — Desayuno con calma y planificación del día',
        `09:30 — ${highlight}`,
        `11:30 — ${getActivity(pool[preferencia as keyof typeof pool] || pool.cultural, d + 10)}`,
        '13:30 — Almuerzo en zona recomendada',
        `15:00 — Exploración de ${nextCity}`,
        `17:00 — ${getActivity(pool.gastronomia, d + 11)}`,
        '19:00 — Tiempo libre para compras de souvenirs o artesanía',
        '21:00 — Cena especial de "mitad de viaje" o celebración',
      ];
      tip = getTip(d, 'highlights');
    }
    // Phase 5: Deep exploration (days 11+)
    else {
      const city = cities[d % cities.length] || cities[0] || 'Nueva zona';
      title = `Día ${d} — ${city}: Descubrimiento profundo`;
      activities = [
        '08:00 — Desayuno y preparación para día completo',
        `09:00 — Salida hacia ${city} o zona poco explorada`,
        getActivity(pool.cultural, d + 14),
        `12:00 — ${getActivity(pool.gastronomia, d + 15)}`,
        getActivity(pool[preferencia as keyof typeof pool] || pool.naturaleza, d + 16),
        '16:00 — Actividad pendiente de la lista: ' + (highlights[d % highlights.length] || 'explorar más a fondo'),
        '18:00 — Paseo de despedida o último mirador',
        '20:00 — Cena de despedida en restaurante especial reservado',
      ];
      tip = getTip(d, 'deep');
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
          Itinerario detallado — {duracion} días en {paisSeleccionado.nombre}
        </h3>
        <p className="text-slate-400 text-sm mb-6">Perfil: <span className="text-purple-400 font-medium capitalize">{preferencia}</span> • Presupuesto: <span className="text-green-400 font-medium">{presupuesto}</span> • Base: {paisSeleccionado.capital}</p>

        <div className="space-y-3">
          {itinerary.map((day, idx) => (
            <details key={day.day} className="group bg-slate-700/30 rounded-xl border border-slate-700/50 overflow-hidden" open={idx < 3}>
              <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-700/50 transition-colors list-none">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  idx === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {day.day}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-base">{day.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{day.activities.length} actividades • {day.activities[0]?.split('—')[0]?.trim() || 'Todo el día'}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                <div className="space-y-1.5 mt-2">
                  {day.activities.map((act, i) => {
                    const timeMatch = act.match(/^(\d{2}:\d{2})\s*—\s*(.+)$/);
                    return timeMatch ? (
                      <div key={i} className="flex items-start gap-3 py-1">
                        <span className="text-purple-400 font-mono text-xs font-bold flex-shrink-0 w-12 pt-0.5">{timeMatch[1]}</span>
                        <span className="text-slate-300 text-sm">{timeMatch[2]}</span>
                      </div>
                    ) : (
                      <div key={i} className="flex items-start gap-3 py-1">
                        <span className="text-slate-500 text-xs flex-shrink-0 w-12">•</span>
                        <span className="text-slate-300 text-sm">{act}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <p className="text-slate-300 text-xs">
                    <span className="text-yellow-400 font-medium">💡 Consejo:</span> {day.tip}
                  </p>
                </div>
              </div>
            </details>
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
