export type NivelRiesgo = 'sin-riesgo' | 'bajo' | 'medio' | 'alto' | 'muy-alto';

export interface ContactoOficial {
  tipo: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
}

export interface Requisito {
  categoria: string;
  icon: string;
  items: string[];
}

export interface DatoPais {
  codigo: string;
  nombre: string;
  capital: string;
  continente: string;
  idioma: string;
  moneda: string;
  tipoCambio: string;
  zonaHoraria: string;
  conduccion: 'derecha' | 'izquierda';
  poblacion: string;
  pib: string;
  indicadores: {
    ipc: string;
    indicePrecios: string;
  };
  voltaje: string;
  prefijoTelefono: string;
  nivelRiesgo: NivelRiesgo;
  ultimoInforme: string;
  contactos: ContactoOficial[];
  requerimientos: Requisito[];
  queHacer: string[];
  queNoHacer: string[];
  diarios: { nombre: string; url: string }[];
  urlsUtiles: { nombre: string; url: string }[];
  bandera: string;
  mapaCoordenadas: [number, number];
}

export const paisesData: Record<string, DatoPais> = {
  es: {
    codigo: 'es',
    nombre: 'España',
    capital: 'Madrid',
    continente: 'Europa',
    idioma: 'Español',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '48 millones',
    pib: '1.4 billones USD',
    indicadores: { ipc: '3.4%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+34',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Ministerio',
        nombre: 'Ministerio de Asuntos Exteriores',
        direccion: 'Plaza de la Provincia 1, 28012 Madrid',
        telefono: '+34 91 379 97 00',
        email: 'central@maec.es',
        horario: 'Lunes a viernes 8:00-20:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['DNI o Pasaporte en vigor', 'No se requiere visado para ciudadanos UE', 'Tarjeta sanitaria europea (TSE)'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Sistema sanitario público disponible', 'Farmacias en cada barrio', 'Urgencias: 112'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Moneda: Euro', 'Horario comercial: 9:00-20:00', 'Propina: opcional'] }
    ],
    queHacer: [
      'Visitar la Sagrada Familia en Barcelona',
      'Recorrer la Alhambra de Granada',
      'Probar tapas en San Sebastián',
      'Visitar el Prado en Madrid',
      'Disfrutar de las Fallas de Valencia'
    ],
    queNoHacer: [
      'No confuse hora de comer (14:00-16:00)',
      'No se quede sin probar la paella',
      'No cambie dinero en la calle',
      'No pise la rambla de Barcelona sin mirar',
      'No olvide sunscreen en verano'
    ],
    diarios: [
      { nombre: 'El País', url: 'https://elpais.com' },
      { nombre: 'El Mundo', url: 'https://elmundo.es' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo España', url: 'https://www.spain.info' },
      { nombre: 'MAEC España', url: 'https://www.exteriores.gob.es' }
    ],
    bandera: '🇪🇸',
    mapaCoordenadas: [40.4637, -3.7492]
  },
  fr: {
    codigo: 'fr',
    nombre: 'Francia',
    capital: 'París',
    continente: 'Europa',
    idioma: 'Francés',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '68 millones',
    pib: '2.9 billones USD',
    indicadores: { ipc: '2.3%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+33',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en París',
        direccion: '11 Avenue Marceau, 75008 París',
        telefono: '+33 1 44 43 18 00',
        email: 'emb.paris@maec.es',
        horario: 'Lunes a viernes 9:00-14:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español en vigor', 'DNI en vigor (estancias hasta 90 días)', 'No se requiere visado'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea (TSE)', 'Seguro de viaje recomendado', 'Vacunas: ninguna obligatoria'] },
      { categoria: 'Aduana', icon: '🛃', items: ['Declarar efectivo superior a 10,000€', 'Tabaco: 200 cigarrillos', 'Alcohol: 4L vino, 16L cerveza'] }
    ],
    queHacer: [
      'Visitar Torre Eiffel y Louvre',
      'Probar gastronomía francesa',
      'Usar transporte público (Metro)',
      'Visitar Versalles',
      'Explorar la Costa Azul'
    ],
    queNoHacer: [
      'No hablar alto en sitios públicos',
      'No esperar que todos hablen inglés',
      'No saltarse las colas',
      'No dar pourboire excesivo',
      'No confundir con la cuenta'
    ],
    diarios: [
      { nombre: 'Le Monde', url: 'https://www.lemonde.fr' },
      { nombre: 'Le Figaro', url: 'https://www.lefigaro.fr' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Francia', url: 'https://france.fr' },
      { nombre: 'MAEC - Francia', url: 'https://www.exteriores.gob.es/Embajadas/Paris' }
    ],
    bandera: '🇫🇷',
    mapaCoordenadas: [46.2276, 2.2137]
  },
  de: {
    codigo: 'de',
    nombre: 'Alemania',
    capital: 'Berlín',
    continente: 'Europa',
    idioma: 'Alemán',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '84 millones',
    pib: '4.1 billones USD',
    indicadores: { ipc: '2.9%', indicePrecios: 'Medio-Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+49',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Berlín',
        direccion: 'Lichtensteinallee 1, 10787 Berlín',
        telefono: '+49 30 254 0070',
        email: 'emb.berlin@maec.es',
        horario: 'Lunes a viernes 8:30-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI en vigor', 'No se requiere visado', 'Permiso internacional conducir (recomendado)'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea', 'Hospitales públicos disponibles', '112 para emergencias'] },
      { categoria: 'Conducción', icon: '🚗', items: ['Conduce por la derecha', 'Autopistas sin límite muchos tramos', 'Distintivo ambiental en ciudades'] }
    ],
    queHacer: [
      'Visitar Brandeburgo y Reichstag',
      'Probar cerveza en tabernas',
      'Visitar Múnich (Oktoberfest)',
      'Explorar Castillo de Neuschwanstein',
      'Visitar Semana Santa en Colonia'
    ],
    queNoHacer: [
      'No cruzar con rojo aunque no haya tráfico',
      'No hacer ruido después de 22:00',
      'No olvidar dar propina (5-10%)',
      'No aparcar en zonas de residentes',
      'No circular sin distintivo ambiental'
    ],
    diarios: [
      { nombre: 'Der Spiegel', url: 'https://www.spiegel.de' },
      { nombre: 'Die Zeit', url: 'https://www.zeit.de' }
    ],
    urlsUtiles: [
      { nombre: 'Alemania Turismo', url: 'https://www.germany.travel' },
      { nombre: 'MAEC - Alemania', url: 'https://www.exteriores.gob.es/Embajadas/Berlin' }
    ],
    bandera: '🇩🇪',
    mapaCoordenadas: [51.1657, 10.4515]
  },
  it: {
    codigo: 'it',
    nombre: 'Italia',
    capital: 'Roma',
    continente: 'Europa',
    idioma: 'Italiano',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '59 millones',
    pib: '2.1 billones USD',
    indicadores: { ipc: '2.9%', indicePrecios: 'Medio-Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+39',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Roma',
        direccion: 'Piazza di San Francesco a Ripa 4, 00153 Roma',
        telefono: '+39 06 581 6144',
        email: 'emb.roma@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI en vigor', 'No se requiere visado', 'Seguro de viaje recomendado'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea', 'Farmacias (verde cruz)', 'Emergencias: 118'] },
      { categoria: 'Cultura', icon: '🏛️', items: ['Respetar dress code en iglesias', 'Reservar para restaurantes populares', 'Cuidado con carteristas'] }
    ],
    queHacer: [
      'Visitar Coliseo y Foro Romano',
      'Ver el David de Miguel Ángel',
      'Probar gelato y pasta italiana',
      'Visitar Vatican Museums',
      'Explorar costa Amalfitana'
    ],
    queNoHacer: [
      'No entrar en iglesias con shorts',
      'No pedir cappuccino después de comer',
      'No dejar propinas excesivas',
      'No esperar comida rápida',
      'No confiar en taxistas no oficiales'
    ],
    diarios: [
      { nombre: 'La Repubblica', url: 'https://www.repubblica.it' },
      { nombre: 'Corriere della Sera', url: 'https://www.corriere.it' }
    ],
    urlsUtiles: [
      { nombre: 'Italia Turismo', url: 'https://italia.it' },
      { nombre: 'MAEC - Italia', url: 'https://www.exteriores.gob.es/Embajadas/Roma' }
    ],
    bandera: '🇮🇹',
    mapaCoordenadas: [41.8719, 12.5674]
  },
  pt: {
    codigo: 'pt',
    nombre: 'Portugal',
    capital: 'Lisboa',
    continente: 'Europa',
    idioma: 'Portugués',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+0',
    conduccion: 'derecha',
    poblacion: '10 millones',
    pib: '255 mil millones USD',
    indicadores: { ipc: '2.3%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+351',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Lisboa',
        direccion: 'Rua do Salitre 1, 1269-065 Lisboa',
        telefono: '+351 21 311 05 50',
        email: 'emb.lisboa@maec.es',
        horario: 'Lunes a viernes 8:30-15:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI en vigor', 'No se requiere visado', 'Permiso conducir español válido'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea', 'Hospitales públicos', 'Farmacias 24h'] },
      { categoria: 'General', icon: '💡', items: ['Zona Schengen', 'Moneda: Euro', 'Pago con tarjeta muy aceptado'] }
    ],
    queHacer: [
      'Visitar Torre de Belém',
      'Probar pastéis de nata',
      'Conocer Oporto y Duero',
      'Visitar Sintra',
      'Enjoy beaches in Algarve'
    ],
    queNoHacer: [
      'No confundir con España',
      'No dejar propina obligatoria',
      'No esperar sitios abiertos 24h',
      'No pasar por Coimbra',
      'No ignorar fado'
    ],
    diarios: [
      { nombre: 'Público', url: 'https://www.publico.pt' },
      { nombre: 'Jornal de Notícias', url: 'https://www.jn.pt' }
    ],
    urlsUtiles: [
      { nombre: 'Portugal Turismo', url: 'https://www.visitportugal.com' },
      { nombre: 'MAEC - Portugal', url: 'https://www.exteriores.gob.es/Embajadas/Lisboa' }
    ],
    bandera: '🇵🇹',
    mapaCoordenadas: [39.3999, -8.2245]
  },
  gb: {
    codigo: 'gb',
    nombre: 'Reino Unido',
    capital: 'Londres',
    continente: 'Europa',
    idioma: 'Inglés',
    moneda: 'Libra esterlina (GBP)',
    tipoCambio: '1 GBP = 1.17 EUR',
    zonaHoraria: 'UTC+0',
    conduccion: 'izquierda',
    poblacion: '67 millones',
    pib: '3.1 billones USD',
    indicadores: { ipc: '4.0%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+44',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Londres',
        direccion: '39 Chesham Place, London SW1X 8SB',
        telefono: '+44 20 7201 5555',
        email: 'emb.londres@maec.es',
        horario: 'Lunes a viernes 8:30-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte (post-Brexit)', 'No se requiere visado turismo 6 meses', 'No es necesario ETIAS aún'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['GHIC (antes TSE) recomendado', 'NHS para emergencias', 'Recetas médicas distintas'] },
      { categoria: 'Conducción', icon: '🚗', items: ['Conduce por izquierda', 'Permiso español válido 1 año', 'Peajes en algunas autopistas'] }
    ],
    queHacer: [
      'Visitar Big Ben y Westminster',
      'Ver musicals en West End',
      'Probar fish and chips',
      'Visitar British Museum',
      'Pasear por Hyde Park'
    ],
    queNoHacer: [
      'No cruzar la calle mirando a derecha',
      'No meterse en el metro sin oyster card',
      'No pedir té con leche después',
      'No ignorar las colas',
      'No dejar menos de 10% de propina'
    ],
    diarios: [
      { nombre: 'The Guardian', url: 'https://www.theguardian.com' },
      { nombre: 'BBC News', url: 'https://www.bbc.co.uk/news' }
    ],
    urlsUtiles: [
      { nombre: 'Visit London', url: 'https://www.visitlondon.com' },
      { nombre: 'MAEC - Reino Unido', url: 'https://www.exteriores.gob.es/Embajadas/Londres' }
    ],
    bandera: '🇬🇧',
    mapaCoordenadas: [55.3781, -3.4360]
  },
  nl: {
    codigo: 'nl',
    nombre: 'Países Bajos',
    capital: 'Ámsterdam',
    continente: 'Europa',
    idioma: 'Holandés',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '18 millones',
    pib: '1.0 billones USD',
    indicadores: { ipc: '2.8%', indicePrecios: 'Medio-Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+31',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en La Haya',
        direccion: 'Lange Voorhout 50, 2514 EG La Haya',
        telefono: '+31 70 360 09 00',
        email: 'emb.lahaya@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI en vigor', 'No se requiere visado', 'Schengen 90 días'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea', 'Asegurance requerida para registro', 'Emergencias: 112'] },
      { categoria: 'General', icon: '🚲', items: ['Ciudad muy accesible en bici', 'Coffeeshops solo para residentes', 'Horario comercial limitado'] }
    ],
    queHacer: [
      'Visitar Museos Van Gogh y Rijksmuseum',
      'Pasear por Jordaan',
      'Hacer un paseo en barco por canales',
      'Visitar molinos de Kinderdijk',
      'Probar stroopwafels'
    ],
    queNoHacer: [
      'No tomar fotos en todas partes',
      'No conducir borracho',
      'No entrar a smartshops',
      'No esperar que hablen español',
      'No aparcar en cualquier sitio'
    ],
    diarios: [
      { nombre: 'De Telegraaf', url: 'https://www.telegraaf.nl' },
      { nombre: 'NRC', url: 'https://www.nrc.nl' }
    ],
    urlsUtiles: [
      { nombre: 'Holanda Turismo', url: 'https://www.holland.com' },
      { nombre: 'MAEC - Países Bajos', url: 'https://www.exteriores.gob.es/Embajadas/LaHaya' }
    ],
    bandera: '🇳🇱',
    mapaCoordenadas: [52.1326, 5.2913]
  },
  ch: {
    codigo: 'ch',
    nombre: 'Suiza',
    capital: 'Berna',
    continente: 'Europa',
    idioma: 'Alemán, Francés, Italiano',
    moneda: 'Franco suizo (CHF)',
    tipoCambio: '1 CHF = 1.05 EUR',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '9 millones',
    pib: '818 mil millones USD',
    indicadores: { ipc: '1.7%', indicePrecios: 'Muy Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+41',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Berna',
        direccion: 'Kalkfabrikstrasse 61, 3063 Ittigen, Berna',
        telefono: '+41 31 925 00 15',
        email: 'emb.berna@maec.es',
        horario: 'Lunes a viernes 8:30-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI Schengen', 'No es parte de UE pero Schengen', 'Seguro viaje muy recomendado'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['No hay TSE con Suiza', 'Seguro médico obligatorio', 'Farmacias muy buenas'] },
      { categoria: 'General', icon: '💰', items: ['Moneda: Franco suizo', 'Muy caro', 'Trenes puntuales y eficientes'] }
    ],
    queHacer: [
      'Visitar Matterhorn en Zermatt',
      'Explorar Lucerna',
      'Pasear por Zúrich',
      'Visitar Jungfrau',
      'Probar chocolate y queso'
    ],
    queNoHacer: [
      'No esperar precios bajos',
      'No tirar basura',
      'No hacer ruido en zonas residenciales',
      'No aparcar mal',
      'No hablar debanca en público'
    ],
    diarios: [
      { nombre: 'Neue Zürcher Zeitung', url: 'https://www.nzz.ch' },
      { nombre: 'Le Temps', url: 'https://www.letemps.ch' }
    ],
    urlsUtiles: [
      { nombre: 'Suiza Turismo', url: 'https://www.myswitzerland.com' },
      { nombre: 'MAEC - Suiza', url: 'https://www.exteriores.gob.es/Embajadas/Berna' }
    ],
    bandera: '🇨🇭',
    mapaCoordenadas: [46.8182, 8.2275]
  },
  gr: {
    codigo: 'gr',
    nombre: 'Grecia',
    capital: 'Atenas',
    continente: 'Europa',
    idioma: 'Griego',
    moneda: 'Euro (EUR)',
    tipoCambio: '1 EUR = 1.08 USD',
    zonaHoraria: 'UTC+2',
    conduccion: 'derecha',
    poblacion: '10.4 millones',
    pib: '219 mil millones USD',
    indicadores: { ipc: '2.6%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+30',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Atenas',
        direccion: 'Drakoulis 27, 11521 Atenas',
        telefono: '+30 210 721 62 30',
        email: 'emb.atenas@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte o DNI en vigor', 'No se requiere visado', 'Schengen 90 días'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Tarjeta sanitaria europea', 'Buen sistema sanitario público', 'Farmacias Ionios'] },
      { categoria: 'Cultura', icon: '🏛️', items: ['Respetar siesta (15:00-17:00)', 'Vestir apropiado en iglesias', 'Mantenimiento en construcciones'] }
    ],
    queHacer: [
      'Visitar Acrópolis de Atenas',
      'Ver atardecer en Santorini',
      'Nadar en playas de Creta',
      'Visitar Delfos',
      'Probar souvlaki y moussaka'
    ],
    queNoHacer: [
      'No hacer la siesta',
      'No esperar sitios abiertos tarde',
      'No entrar churches sin ropa adecuada',
      'No confondre con Turkey',
      'No perder ferry'
    ],
    diarios: [
      { nombre: 'To Vima', url: 'https://www.tovima.gr' },
      { nombre: 'Kathimerini', url: 'https://www.ekathimerini.com' }
    ],
    urlsUtiles: [
      { nombre: 'Grecia Turismo', url: 'https://www.visitgreece.gr' },
      { nombre: 'MAEC - Grecia', url: 'https://www.exteriores.gob.es/Embajadas/atenas' }
    ],
    bandera: '🇬🇷',
    mapaCoordenadas: [39.0742, 21.8243]
  },
  us: {
    codigo: 'us',
    nombre: 'Estados Unidos',
    capital: 'Washington D.C.',
    continente: 'Norteamérica',
    idioma: 'Inglés',
    moneda: 'Dólar estadounidense (USD)',
    tipoCambio: '1 USD = 0.93 EUR',
    zonaHoraria: 'UTC-5 a UTC-10',
    conduccion: 'derecha',
    poblacion: '335 millones',
    pib: '25.5 billones USD',
    indicadores: { ipc: '3.4%', indicePrecios: 'Alto' },
    voltaje: '120V / 60Hz',
    prefijoTelefono: '+1',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Washington D.C.',
        direccion: '2375 Pennsylvania Ave NW, Washington D.C. 20037',
        telefono: '+1 202 452 0100',
        email: 'emb.washington@maec.es',
        horario: 'Lunes a viernes 8:30-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Formulario ESTA (esta.cbp.dhs.gov)', 'No visado para turismo 90 días'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro médico OBLIGATORIO', 'Hospitales muy caros', '911 para emergencias'] },
      { categoria: 'Aduana', icon: '🛃', items: ['Declarar todo', 'Prohibido alimentos frescos', 'Alcohol: 1L máximo'] }
    ],
    queHacer: [
      'Visitar Nueva York y Statue of Liberty',
      'Ver Gran Cañón',
      'Probar comida diversa',
      'Alquilar coche',
      'Visitar Parques Nacionales'
    ],
    queNoHacer: [
      'No conducir borracho',
      'No importar agricultural products',
      'No exceed speed limits',
      'No hablar de politics',
      'No dar less than 15% tip'
    ],
    diarios: [
      { nombre: 'The New York Times', url: 'https://www.nytimes.com' },
      { nombre: 'The Washington Post', url: 'https://www.washingtonpost.com' }
    ],
    urlsUtiles: [
      { nombre: 'Visit USA', url: 'https://www.visittheusa.com' },
      { nombre: 'MAEC - Estados Unidos', url: 'https://www.exteriores.gob.es/Embajadas/Washington' }
    ],
    bandera: '🇺🇸',
    mapaCoordenadas: [37.0902, -95.7129]
  },
  ca: {
    codigo: 'ca',
    nombre: 'Canadá',
    capital: 'Ottawa',
    continente: 'Norteamérica',
    idioma: 'Inglés, Francés',
    moneda: 'Dólar canadiense (CAD)',
    tipoCambio: '1 CAD = 0.68 EUR',
    zonaHoraria: 'UTC-3.5 a UTC-8',
    conduccion: 'derecha',
    poblacion: '40 millones',
    pib: '2.1 billones USD',
    indicadores: { ipc: '2.9%', indicePrecios: 'Medio-Alto' },
    voltaje: '120V / 60Hz',
    prefijoTelefono: '+1',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Ottawa',
        direccion: '74 Stanley Avenue, Ottawa, ON K1M 1P4',
        telefono: '+1 613 747 2252',
        email: 'emb.ottawa@maec.es',
        horario: 'Lunes a viernes 9:00-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'eTA electrónico (canada.ca/eta)', 'No se requiere visa turismo'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro médico obligatorio', 'Hospitales públicos', '911 emergencias'] },
      { categoria: 'General', icon: '🌍', items: ['Clima muy frío en invierno', 'Propina 15-20%', 'Millas canadienses'] }
    ],
    queHacer: [
      'Visitar Niagara Falls',
      'Explorar Banff y Rockies',
      'Visitar Vancouver',
      'Ver auroras boreales',
      'Probar poutine'
    ],
    queNoHacer: [
      'No conducir sin winter tires',
      'No dar less than 15% tip',
      'No esperar partout speak spanish',
      'No sobrepasar límites velocidad',
      'No meterse en conversaciones políticas'
    ],
    diarios: [
      { nombre: 'The Globe and Mail', url: 'https://www.theglobeandmail.com' },
      { nombre: 'Toronto Star', url: 'https://www.thestar.com' }
    ],
    urlsUtiles: [
      { nombre: 'Canadá Turismo', url: 'https://www.canada.ca/en/tourism.html' },
      { nombre: 'MAEC - Canadá', url: 'https://www.exteriores.gob.es/Embajadas/Ottawa' }
    ],
    bandera: '🇨🇦',
    mapaCoordenadas: [56.1304, -106.3468]
  },
  mx: {
    codigo: 'mx',
    nombre: 'México',
    capital: 'Ciudad de México',
    continente: 'Norteamérica',
    idioma: 'Español',
    moneda: 'Peso mexicano (MXN)',
    tipoCambio: '1 EUR ≈ 18.5 MXN',
    zonaHoraria: 'UTC-6 a UTC-8',
    conduccion: 'derecha',
    poblacion: '130 millones',
    pib: '1.4 billones USD',
    indicadores: { ipc: '4.2%', indicePrecios: 'Bajo' },
    voltaje: '127V / 60Hz',
    prefijoTelefono: '+52',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Ciudad de México',
        direccion: 'Paseo de la Reforma 530, CDMX',
        telefono: '+52 55 5280 4400',
        email: 'emb.mexico@maec.es',
        horario: 'Lunes a viernes 8:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No visado hasta 180 días', 'FMM migratorio'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla (algunos estados)', 'Agua embotellada', 'Seguro médico'] },
      { categoria: 'Seguridad', icon: '⚠️', items: ['Evitar zonas rurales noche', 'Taxís oficiales o apps', 'Cuidado con carteteristas'] }
    ],
    queHacer: [
      'Visitar CDMX y Zócalo',
      'Ver Chichén Itzá',
      'Probar comida mexicana',
      'Visitar Oaxaca y Puebla',
      'Relax en Riviera Maya'
    ],
    queNoHacer: [
      'No beber agua del grifo',
      'No aceptar ayuda de extraños',
      'No caminar zonas marginales noche',
      'No show expensive items',
      'No conducir night on highways'
    ],
    diarios: [
      { nombre: 'El Universal', url: 'https://www.eluniversal.com.mx' },
      { nombre: 'Reforma', url: 'https://www.reforma.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo México', url: 'https://www.visitmexico.com' },
      { nombre: 'MAEC - México', url: 'https://www.exteriores.gob.es/Embajadas/Mexico' }
    ],
    bandera: '🇲🇽',
    mapaCoordenadas: [23.6345, -102.5528]
  },
  cu: {
    codigo: 'cu',
    nombre: 'Cuba',
    capital: 'La Habana',
    continente: 'Caribe',
    idioma: 'Español',
    moneda: 'Peso cubano (CUP)',
    tipoCambio: '1 CUC ≈ 0.85 EUR',
    zonaHoraria: 'UTC-5',
    conduccion: 'derecha',
    poblacion: '11 millones',
    pib: '107 mil millones USD',
    indicadores: { ipc: '5.0%', indicePrecios: 'Medio' },
    voltaje: '110V / 60Hz',
    prefijoTelefono: '+53',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en La Habana',
        direccion: 'Calle 4 entre 5ta y 7ma, Miramar, La Habana',
        telefono: '+53 7 214 1400',
        email: 'emb.lahabana@maec.es',
        horario: 'Lunes a viernes 8:00-15:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'Tarjeta turística (visado)', 'Seguro médico obligatorio'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Médico tourism servicios', 'Medicamentos limitados', 'Hospitales públicos'] },
      { categoria: 'General', icon: '💡', items: ['Dos monedas', 'Wifi caro y limitado', 'Cargar efectivo'] }
    ],
    queHacer: [
      'Pasear por La Habana Vieja',
      'Ver atardecer en Malecón',
      'Visitar Varadero',
      'Probar mojito y daiquiri',
      'Ver performance de música live'
    ],
    queNoHacer: [
      'No criticar gobierno',
      'No esperar internet fácil',
      'No bring drone',
      'No photograph military sites',
      'No change money on black market'
    ],
    diarios: [
      { nombre: 'Granma', url: 'https://www.granma.cu' },
      { nombre: 'Juventud Rebelde', url: 'https://www.juventudrebelde.cu' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Cuba', url: 'https://www.cuba.travel' },
      { nombre: 'MAEC - Cuba', url: 'https://www.exteriores.gob.es/Embajadas/LaHabana' }
    ],
    bandera: '🇨🇺',
    mapaCoordenadas: [21.5218, -77.7812]
  },
  co: {
    codigo: 'co',
    nombre: 'Colombia',
    capital: 'Bogotá',
    continente: 'Sudamérica',
    idioma: 'Español',
    moneda: 'Peso colombiano (COP)',
    tipoCambio: '1 EUR ≈ 4200 COP',
    zonaHoraria: 'UTC-5',
    conduccion: 'derecha',
    poblacion: '52 millones',
    pib: '340 mil millones USD',
    indicadores: { ipc: '5.5%', indicePrecios: 'Medio-Bajo' },
    voltaje: '110V / 60Hz',
    prefijoTelefono: '+57',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Bogotá',
        direccion: 'Calle 92 No. 7A-47, Bogotá',
        telefono: '+57 1 622 0460',
        email: 'emb.bogota@maec.es',
        horario: 'Lunes a viernes 8:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No se requiere visado', 'Tiquete de salida'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla recomendada', 'Vacuna COVID según requisitos', 'Seguro médico obligatorio'] },
      { categoria: 'Seguridad', icon: '⚠️', items: ['Evitar frontera Venezuela', 'Usar apps de transporte', 'Cuidado en zonas rurales'] }
    ],
    queHacer: [
      'Visitar Cartagena y Ciudad Amurallada',
      'Explorar Parque Tayrona',
      'Ver Salento y Cocora Valley',
      'Probar arepas y aguardiente',
      'Visitar Bogotá y Monserrate'
    ],
    queNoHacer: [
      'No caminar zonas marginales noche',
      'No change money unofficial',
      'No accept drinks from strangers',
      'No visit remote areas alone',
      'No exhibirt expensive jewelry'
    ],
    diarios: [
      { nombre: 'El Tiempo', url: 'https://www.eltiempo.com' },
      { nombre: 'El Espectador', url: 'https://www.elespectador.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Colombia', url: 'https://www.colombia.travel' },
      { nombre: 'MAEC - Colombia', url: 'https://www.exteriores.gob.es/Embajadas/Bogota' }
    ],
    bandera: '🇨🇴',
    mapaCoordenadas: [4.5709, -74.2973]
  },
  pe: {
    codigo: 'pe',
    nombre: 'Perú',
    capital: 'Lima',
    continente: 'Sudamérica',
    idioma: 'Español',
    moneda: 'Sol peruano (PEN)',
    tipoCambio: '1 EUR ≈ 4.1 PEN',
    zonaHoraria: 'UTC-5',
    conduccion: 'derecha',
    poblacion: '34 millones',
    pib: '268 mil millones USD',
    indicadores: { ipc: '3.2%', indicePrecios: 'Medio' },
    voltaje: '220V / 60Hz',
    prefijoTelefono: '+51',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Lima',
        direccion: 'Av. Jorge Basadre 610, San Isidro, Lima',
        telefono: '+51 1 440 9898',
        email: 'emb.lima@maec.es',
        horario: 'Lunes a viernes 8:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No se requiere visado', 'Migraciones al llegar'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla (zona selva)', 'Seguro médico obligatorio', 'Altitud en Cusco (3400m)'] },
      { categoria: 'General', icon: '🏔️', items: ['Altitude sickness', 'Carry cash in soles', 'Book Machu Picchu in advance'] }
    ],
    queHacer: [
      'Visitar Machu Picchu',
      'Explorar Lima y gastronomía',
      'Ver lago Titicaca',
      'Visitar Cusco y Sacred Valley',
      'Probar ceviche y pisco sour'
    ],
    queNoHacer: [
      'No subestimar altitud',
      'No hacer cola sin reserva',
      'No ignore altitude sickness',
      'No trust unofficial tours',
      'No leave belongings unattended'
    ],
    diarios: [
      { nombre: 'El Comercio', url: 'https://elcomercio.pe' },
      { nombre: 'La República', url: 'https://www.larepublica.pe' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Perú', url: 'https://www.peru.travel' },
      { nombre: 'MAEC - Perú', url: 'https://www.exteriores.gob.es/Embajadas/Lima' }
    ],
    bandera: '🇵🇪',
    mapaCoordenadas: [-9.1900, -75.0152]
  },
  br: {
    codigo: 'br',
    nombre: 'Brasil',
    capital: 'Brasilia',
    continente: 'Sudamérica',
    idioma: 'Portugués',
    moneda: 'Real brasileño (BRL)',
    tipoCambio: '1 EUR ≈ 5.4 BRL',
    zonaHoraria: 'UTC-2 a UTC-5',
    conduccion: 'derecha',
    poblacion: '215 millones',
    pib: '2.1 billones USD',
    indicadores: { ipc: '4.5%', indicePrecios: 'Medio' },
    voltaje: '127V / 230V',
    prefijoTelefono: '+55',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Brasilia',
        direccion: 'Setor de Embaixadas Sul, Lote 1, Brasilia',
        telefono: '+55 61 2195 8600',
        email: 'emb.brasilia@maec.es',
        horario: 'Lunes a viernes 8:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No se requiere visado 90 días', 'Boleto de regreso'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla obligatoria', 'Seguro médico obligatorio', 'Dengue en zonas tropicales'] },
      { categoria: 'Seguridad', icon: '⚠️', items: ['Evitar favelas sin guía', 'No beaches isolated at night', 'Cuidado Rio y São Paulo'] }
    ],
    queHacer: [
      'Visitar Cristo Redentor',
      'Ver Cataratas del Iguazú',
      'Probar feijoada y açaí',
      'Relax en playas de Salvador',
      'Explorar Amazonia'
    ],
    queNoHacer: [
      'No entrar a favelas alone',
      'No leave valuables on beach',
      'No walk alone at night',
      'No photograph militares',
      'No do v sign (offensive)'
    ],
    diarios: [
      { nombre: 'Folha de S.Paulo', url: 'https://www.folha.uol.com.br' },
      { nombre: 'O Globo', url: 'https://www.oglobo.com.br' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Brasil', url: 'https://www.visitbrasil.com' },
      { nombre: 'MAEC - Brasil', url: 'https://www.exteriores.gob.es/Embajadas/Brasilia' }
    ],
    bandera: '🇧🇷',
    mapaCoordenadas: [-14.2350, -51.9253]
  },
  ar: {
    codigo: 'ar',
    nombre: 'Argentina',
    capital: 'Buenos Aires',
    continente: 'Sudamérica',
    idioma: 'Español',
    moneda: 'Peso argentino (ARS)',
    tipoCambio: '1 EUR ≈ 950 ARS',
    zonaHoraria: 'UTC-3',
    conduccion: 'derecha',
    poblacion: '46 millones',
    pib: '640 mil millones USD',
    indicadores: { ipc: '133%', indicePrecios: 'Alto' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+54',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Buenos Aires',
        direccion: 'Tagle 2822, C1425EEH Buenos Aires',
        telefono: '+54 11 4808 2200',
        email: 'emb.buenosaires@maec.es',
        horario: 'Lunes a viernes 8:30-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No se requiere visado', 'DNI español válido 90 días'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla (Norte)', 'Seguro médico obligatorio', 'Hospitales públicos disponibles'] },
      { categoria: 'Economía', icon: '💰', items: ['Blue dollar different rate', 'Carry dólares', 'Tarjetas tienen recargos'] }
    ],
    queHacer: [
      'Tango en Buenos Aires',
      'Visitar Patagonia y glaciares',
      'Ver Cataratas del Iguazú',
      'Probar asado y mate',
      'Visit Ushuaia (fin del mundo)'
    ],
    queNoHacer: [
      'No change money on street',
      'No show expensive items',
      'No walk night en peripheral areas',
      'No confuse with Uruguay',
      'No bring meat products'
    ],
    diarios: [
      { nombre: 'Clarín', url: 'https://www.clarin.com' },
      { nombre: 'La Nación', url: 'https://www.lanacion.com.ar' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Argentina', url: 'https://www.argentina.gob.ar/turismoydeportes' },
      { nombre: 'MAEC - Argentina', url: 'https://www.exteriores.gob.es/Embajadas/BuenosAires' }
    ],
    bandera: '🇦🇷',
    mapaCoordenadas: [-38.4161, -63.6167]
  },
  cl: {
    codigo: 'cl',
    nombre: 'Chile',
    capital: 'Santiago',
    continente: 'Sudamérica',
    idioma: 'Español',
    moneda: 'Peso chileno (CLP)',
    tipoCambio: '1 EUR ≈ 980 CLP',
    zonaHoraria: 'UTC-3 a UTC-5',
    conduccion: 'derecha',
    poblacion: '19 millones',
    pib: '301 mil millones USD',
    indicadores: { ipc: '4.5%', indicePrecios: 'Medio-Alto' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+56',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Santiago',
        direccion: 'Av. Luis Thayer Ojeda 1175, Providencia, Santiago',
        telefono: '+56 2 2750 0200',
        email: 'emb.santiago@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No se requiere visado', 'Permiso TURIST (90 días)'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas estándar', 'Hospitales privados buenos', 'Seguro médico recomendado'] },
      { categoria: 'General', icon: '🌍', items: ['Faja horaria país largo', 'Terremotos comunes', 'Isla de Pascua lejana'] }
    ],
    queHacer: [
      'Visitar Isla de Pascua',
      'Ver Torres del Paine',
      'Recorrer Atacama Desert',
      'Probar pisco sour y empanadas',
      'Beaches en Valparaíso'
    ],
    queNoHacer: [
      'No subestimar distancias',
      'No forget sunscreen',
      'No be unprepared for Andes',
      'No skip Valparaíso',
      'No disrespect Mapuche culture'
    ],
    diarios: [
      { nombre: 'El Mercurio', url: 'https://www.elmercurio.com' },
      { nombre: 'La Tercera', url: 'https://www.latercera.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Chile', url: 'https://www.subirturismo.gob.cl' },
      { nombre: 'MAEC - Chile', url: 'https://www.exteriores.gob.es/Embajadas/Santiago' }
    ],
    bandera: '🇨🇱',
    mapaCoordenadas: [-35.6751, -71.5430]
  },
  jp: {
    codigo: 'jp',
    nombre: 'Japón',
    capital: 'Tokio',
    continente: 'Asia',
    idioma: 'Japonés',
    moneda: 'Yen japonés (JPY)',
    tipoCambio: '1 EUR ≈ 163 JPY',
    zonaHoraria: 'UTC+9',
    conduccion: 'izquierda',
    poblacion: '125 millones',
    pib: '4.2 billones USD',
    indicadores: { ipc: '2.8%', indicePrecios: 'Alto' },
    voltaje: '100V / 50Hz',
    prefijoTelefono: '+81',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Tokio',
        direccion: '1-1-28 Minami-Azabu, Minato-ku, Tokio',
        telefono: '+81 3 5420 8800',
        email: 'emb.tokio@maec.es',
        horario: 'Lunes a viernes 9:00-17:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'No visado hasta 90 días', 'ERES electronic registration'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro viaje obligatorio', 'Hospitales good but expensive', 'Medicamentos restrictions'] },
      { categoria: 'Cultura', icon: '🏯', items: ['Remove shoes en temples', 'No speak loud en public transport', 'Respect filas (gyoretsu)'] }
    ],
    queHacer: [
      'Visitar Tokio y Shibuya Crossing',
      'Templos de Kioto',
      'Probar sushi auténtico',
      'JR Pass para transporte',
      'Visitar Hiroshima Peace Memorial'
    ],
    queNoHacer: [
      'No eat while walking',
      'No talk on phone en metro',
      'No give tip (es insultante)',
      'No point with finger',
      'No chopsticks stick in rice'
    ],
    diarios: [
      { nombre: 'Yomiuri Shimbun', url: 'https://www.yomiuri.co.jp' },
      { nombre: 'Asahi Shimbun', url: 'https://www.asahi.com' }
    ],
    urlsUtiles: [
      { nombre: 'Japan Guide', url: 'https://www.japan-guide.com' },
      { nombre: 'MAEC - Japón', url: 'https://www.exteriores.gob.es/Embajadas/Tokio' }
    ],
    bandera: '🇯🇵',
    mapaCoordenadas: [36.2048, 138.2529]
  },
  kr: {
    codigo: 'kr',
    nombre: 'Corea del Sur',
    capital: 'Seúl',
    continente: 'Asia',
    idioma: 'Coreano',
    moneda: 'Won surcoreano (KRW)',
    tipoCambio: '1 EUR ≈ 1450 KRW',
    zonaHoraria: 'UTC+9',
    conduccion: 'derecha',
    poblacion: '52 millones',
    pib: '1.7 billones USD',
    indicadores: { ipc: '2.5%', indicePrecios: 'Medio' },
    voltaje: '220V / 60Hz',
    prefijoTelefono: '+82',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Seúl',
        direccion: '2-1 Jeong-dong, Jung-gu, Seúl',
        telefono: '+82 2 738 2300',
        email: 'emb.seul@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte español vigente', 'K-ETA electronic authorization', 'No se requiere visado'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro médico recomendado', 'Hospitales modernos', 'Farmacias 24h'] },
      { categoria: 'General', icon: '💡', items: ['T-money card for transport', 'Highly connected country', 'K-culture world famous'] }
    ],
    queHacer: [
      'Visitar Gyeongbokgung Palace',
      'Explorar Myeongdong shopping',
      'Probar kimchi y bibimbap',
      'Nightlife en Hongdae',
      'Hike en Bukhansan'
    ],
    queNoHacer: [
      'No pour drink with one hand',
      'No write names in red',
      'No stick chopsticks in rice',
      'No blow nose en table',
      'No ignore queuing culture'
    ],
    diarios: [
      { nombre: 'The Korea Herald', url: 'https://www.koreaherald.com' },
      { nombre: 'Chosun Ilbo', url: 'https://english.chosun.com' }
    ],
    urlsUtiles: [
      { nombre: 'Visit Korea', url: 'https://english.visitkorea.or.kr' },
      { nombre: 'MAEC - Corea del Sur', url: 'https://www.exteriores.gob.es/Embajadas/Seul' }
    ],
    bandera: '🇰🇷',
    mapaCoordenadas: [35.9078, 127.7669]
  },
  th: {
    codigo: 'th',
    nombre: 'Tailandia',
    capital: 'Bangkok',
    continente: 'Asia',
    idioma: 'Tailandés',
    moneda: 'Baht tailandés (THB)',
    tipoCambio: '1 EUR ≈ 38 THB',
    zonaHoraria: 'UTC+7',
    conduccion: 'izquierda',
    poblacion: '70 millones',
    pib: '570 mil millones USD',
    indicadores: { ipc: '1.2%', indicePrecios: 'Bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+66',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Bangkok',
        direccion: '23 Sap Road, Silom, Bangrak, Bangkok',
        telefono: '+66 2 632 6100',
        email: 'emb.bangkok@maec.es',
        horario: 'Lunes a viernes 8:30-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Visado según duración', 'Registro TM30 en hotel'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla if from endemic area', 'Seguro médico obligatorio', 'Dengue prevalent'] },
      { categoria: 'Cultura', icon: '🛕', items: ['Respetar monjes budistas', 'No head touching', 'No pointing feet'] }
    ],
    queHacer: [
      'Visitar Gran Palacio Bangkok',
      'Islas de Phi Phi',
      'Probar pad thai y som tam',
      'Templos de Chiang Mai',
      'Mercados flotantes'
    ],
    queNoHacer: [
      'No disrespect monarchy',
      'No touch head of Thai people',
      'No point feet at Buddha',
      'No raise voice',
      'No dress inappropriate en temples'
    ],
    diarios: [
      { nombre: 'The Nation', url: 'https://www.nationthailand.com' },
      { nombre: 'Bangkok Post', url: 'https://www.bangkokpost.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Tailandia', url: 'https://www.tourismthailand.org' },
      { nombre: 'MAEC - Tailandia', url: 'https://www.exteriores.gob.es/Embajadas/Bangkok' }
    ],
    bandera: '🇹🇭',
    mapaCoordenadas: [15.8700, 100.9925]
  },
  vn: {
    codigo: 'vn',
    nombre: 'Vietnam',
    capital: 'Hanoi',
    continente: 'Asia',
    idioma: 'Vietnamita',
    moneda: 'Dong vietnamita (VND)',
    tipoCambio: '1 EUR ≈ 26000 VND',
    zonaHoraria: 'UTC+7',
    conduccion: 'derecha',
    poblacion: '98 millones',
    pib: '409 mil millones USD',
    indicadores: { ipc: '3.2%', indicePrecios: 'Muy Bajo' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+84',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Hanoi',
        direccion: '4th Floor, Tung Shing Building, 2 Ngo Quyen, Hoan Kiem, Hanoi',
        telefono: '+84 24 3934 8580',
        email: 'emb.hanoi@maec.es',
        horario: 'Lunes a viernes 8:30-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'E-visa available', 'Registro hotel obligatorio'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla if from endemic', 'Seguro médico obligatorio', 'Malaria en zonas rurales'] },
      { categoria: 'General', icon: '🏍️', items: ['Motorbike culture', 'Very cheap country', 'Bargaining expected'] }
    ],
    queHacer: [
      'Bahía de Ha Long',
      'Hanoi Old Quarter',
      'Hoi An ancient town',
      'Probar pho y banh mi',
      'Mekong Delta'
    ],
    queNoHacer: [
      'No dress inappropriate en pagodas',
      'No be rude about war',
      'No touch heads',
      'No refuse offered tea',
      'No overprice without bargaining'
    ],
    diarios: [
      { nombre: 'Vietnam News', url: 'https://vietnamnews.vn' },
      { nombre: 'VnExpress', url: 'https://e.vnexpress.net' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Vietnam', url: 'https://vietnamtourism.vn' },
      { nombre: 'MAEC - Vietnam', url: 'https://www.exteriores.gob.es/Embajadas/Hanoi' }
    ],
    bandera: '🇻🇳',
    mapaCoordenadas: [14.0583, 108.2772]
  },
  in: {
    codigo: 'in',
    nombre: 'India',
    capital: 'Nueva Delhi',
    continente: 'Asia',
    idioma: 'Hindi, Inglés',
    moneda: 'Rupia india (INR)',
    tipoCambio: '1 EUR ≈ 89 INR',
    zonaHoraria: 'UTC+5:30',
    conduccion: 'izquierda',
    poblacion: '1.4 mil millones',
    pib: '3.7 billones USD',
    indicadores: { ipc: '4.9%', indicePrecios: 'Muy Bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+91',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Nueva Delhi',
        direccion: 'C-17 Vasant Marg, Vasant Vihar, Nueva Delhi',
        telefono: '+91 11 4600 6400',
        email: 'emb.nuevadelhi@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Visa obligatoria', 'Registro con FRRO'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas: hepatitis A/B, tifoidea', 'Malaria prophylaxis zonas', 'Agua embotellada siempre'] },
      { categoria: 'Cultura', icon: '🕌', items: ['Respetar vacas (sagradas)', 'Usar mano derecha', 'Zapatos fuera templos'] }
    ],
    queHacer: [
      'Ver Taj Mahal',
      'Varanasi y Ganges',
      'Rajasthan palaces',
      'Probar curry y naan',
      'Yoga en Rishikesh'
    ],
    queNoHacer: [
      'No point with finger',
      'No touch heads of locals',
      'No wear shorts en templos',
      'No left hand para dar/recibir',
      'No show public affection'
    ],
    diarios: [
      { nombre: 'The Times of India', url: 'https://timesofindia.indiatimes.com' },
      { nombre: 'The Hindu', url: 'https://www.thehindu.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo India', url: 'https://www.incredibleindia.org' },
      { nombre: 'MAEC - India', url: 'https://www.exteriores.gob.es/Embajadas/NuevaDelhi' }
    ],
    bandera: '🇮🇳',
    mapaCoordenadas: [20.5937, 78.9629]
  },
  cn: {
    codigo: 'cn',
    nombre: 'China',
    capital: 'Pekín',
    continente: 'Asia',
    idioma: 'Mandarín',
    moneda: 'Yuan (CNY)',
    tipoCambio: '1 EUR ≈ 7.8 CNY',
    zonaHoraria: 'UTC+8',
    conduccion: 'derecha',
    poblacion: '1.4 mil millones',
    pib: '17.7 billones USD',
    indicadores: { ipc: '1.0%', indicePrecios: 'Medio' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+86',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Pekín',
        direccion: 'Sanlitun, 9 Sanlitun Lu, Chaoyang, Pekín',
        telefono: '+86 10 6532 0780',
        email: 'emb.pekin@maec.es',
        horario: 'Lunes a viernes 9:00-12:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Visa obligatoria', 'Hotel registration'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['No morphine derivatives', 'Seguro médico recomendado', 'Hospitales modernos cities'] },
      { categoria: 'Tecnología', icon: '📱', items: ['No Google/Facebook/Twitter', 'VPN essential', 'WeChat para pagos'] }
    ],
    queHacer: [
      'Gran Muralla China',
      'Ciudad Prohibida',
      'Terracota Army en Xian',
      'Probar dim sum y Peking duck',
      'Shanghai skyline'
    ],
    queNoHacer: [
      'No speak about politics',
      'No share info with strangers',
      'No photo military zones',
      'No cross streets with phone',
      'No send negative messages about China'
    ],
    diarios: [
      { nombre: 'China Daily', url: 'https://www.chinadaily.com.cn' },
      { nombre: 'Global Times', url: 'https://www.globaltimes.cn' }
    ],
    urlsUtiles: [
      { nombre: 'China Tourism', url: 'https://english.www.cn' },
      { nombre: 'MAEC - China', url: 'https://www.exteriores.gob.es/Embajadas/Pekin' }
    ],
    bandera: '🇨🇳',
    mapaCoordenadas: [35.8617, 104.1954]
  },
  sg: {
    codigo: 'sg',
    nombre: 'Singapur',
    capital: 'Singapur',
    continente: 'Asia',
    idioma: 'Inglés, Mandarín, Malayo',
    moneda: 'Dólar singapurense (SGD)',
    tipoCambio: '1 EUR ≈ 1.45 SGD',
    zonaHoraria: 'UTC+8',
    conduccion: 'izquierda',
    poblacion: '6 millones',
    pib: '423 mil millones USD',
    indicadores: { ipc: '2.8%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+65',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Singapur',
        direccion: '1 George Street, #17-01, Singapur 049145',
        telefono: '+65 6438 0888',
        email: 'emb.singapur@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'No se requiere visado turismo', 'SGAC arrival card'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro médico recomendado', 'World-class healthcare', 'No vaccination required'] },
      { categoria: 'Ley', icon: '⚖️', items: ['Strict laws', 'No chewing gum', 'Heavy fines for littering'] }
    ],
    queHacer: [
      'Marina Bay Sands',
      'Gardens by the Bay',
      'Hawker centres food',
      'Sentosa Island',
      'China Town and Little India'
    ],
    queNoHacer: [
      'No jaywalk',
      'No litter',
      'No chew gum',
      'No drugs (death penalty)',
      'No tip (not expected)'
    ],
    diarios: [
      { nombre: 'The Straits Times', url: 'https://www.straitstimes.com' },
      { nombre: 'Today', url: 'https://www.todayonline.com' }
    ],
    urlsUtiles: [
      { nombre: 'Visit Singapur', url: 'https://www.visitsingapore.com' },
      { nombre: 'MAEC - Singapur', url: 'https://www.exteriores.gob.es/Embajadas/Singapur' }
    ],
    bandera: '🇸🇬',
    mapaCoordenadas: [1.3521, 103.8198]
  },
  ae: {
    codigo: 'ae',
    nombre: 'Emiratos Árabes Unidos',
    capital: 'Abu Dhabi',
    continente: 'Asia',
    idioma: 'Árabe, Inglés',
    moneda: 'Dirham (AED)',
    tipoCambio: '1 EUR ≈ 4.0 AED',
    zonaHoraria: 'UTC+4',
    conduccion: 'derecha',
    poblacion: '10 millones',
    pib: '507 mil millones USD',
    indicadores: { ipc: '2.3%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+971',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Abu Dhabi',
        direccion: 'Al Mahra Street, Al Nahyan Camp Area, Abu Dhabi',
        telefono: '+971 2 448 5500',
        email: 'emb.abudhabi@maec.es',
        horario: 'Domingo a jueves 8:00-15:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Visa gratuita 30 días', 'Hotel reservations'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['No vaccines required', 'Drinking water safe', 'Healthcare world-class'] },
      { categoria: 'Ley', icon: '⚖️', items: ['Zero tolerance for drugs', 'No public intoxication', 'Modest dress code'] }
    ],
    queHacer: [
      'Burj Khalifa en Dubai',
      'Sheikh Zayed Mosque',
      'Desert safari',
      'Shopping en malls y zocos',
      'Ferrari World Abu Dhabi'
    ],
    queNoHacer: [
      'No drink alcohol without license',
      'No photograph locals without consent',
      'No public displays of affection',
      'No eat/drink en público during Ramadan',
      'No obscene gestures'
    ],
    diarios: [
      { nombre: 'The National', url: 'https://www.thenationalnews.com' },
      { nombre: 'Gulf News', url: 'https://gulfnews.com' }
    ],
    urlsUtiles: [
      { nombre: 'Visit Dubai', url: 'https://www.visitdubai.com' },
      { nombre: 'MAEC - EAU', url: 'https://www.exteriores.gob.es/Embajadas/AbuDhabi' }
    ],
    bandera: '🇦🇪',
    mapaCoordenadas: [23.4241, 53.8478]
  },
  za: {
    codigo: 'za',
    nombre: 'Sudáfrica',
    capital: 'Pretoria',
    continente: 'África',
    idioma: 'Inglés, Afrikáans, Bantu',
    moneda: 'Rand (ZAR)',
    tipoCambio: '1 EUR ≈ 20 ZAR',
    zonaHoraria: 'UTC+2',
    conduccion: 'izquierda',
    poblacion: '60 millones',
    pib: '405 mil millones USD',
    indicadores: { ipc: '4.5%', indicePrecios: 'Medio-Bajo' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+27',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Pretoria',
        direccion: '333 Mackintosh Street, Hatfield, Pretoria',
        telefono: '+27 12 460 1200',
        email: 'emb.pretoria@maec.es',
        horario: 'Lunes a viernes 8:00-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 30 días validity', 'No se requiere visado', 'Yellow fever certificate if from endemic'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Malaria prophylaxis for Kruger', 'Vacuna fiebre amarilla', 'Seguro médico esencial'] },
      { categoria: 'Seguridad', icon: '⚠️', items: ['Cuidado en Johannesburgo', 'No walk alone at night', 'Drive with windows closed'] }
    ],
    queHacer: [
      'Safari en Kruger National Park',
      'Table Mountain en Ciudad del Cabo',
      'Visitar Robben Island',
      'Probar bobotie y biltong',
      'Garden Route'
    ],
    queNoHacer: [
      'No display expensive items',
      'No walk alone at night',
      'No leave car windows open',
      'No ignore safety warnings',
      'No swim without lifeguard flags'
    ],
    diarios: [
      { nombre: 'Mail & Guardian', url: 'https://mg.co.za' },
      { nombre: 'News24', url: 'https://www.news24.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Sudáfrica', url: 'https://www.southafrica.net' },
      { nombre: 'MAEC - Sudáfrica', url: 'https://www.exteriores.gob.es/Embajadas/Pretoria' }
    ],
    bandera: '🇿🇦',
    mapaCoordenadas: [-30.5595, 22.9375]
  },
  eg: {
    codigo: 'eg',
    nombre: 'Egipto',
    capital: 'El Cairo',
    continente: 'África',
    idioma: 'Árabe',
    moneda: 'Libra egipcia (EGP)',
    tipoCambio: '1 EUR ≈ 55 EGP',
    zonaHoraria: 'UTC+2',
    conduccion: 'derecha',
    poblacion: '110 millones',
    pib: '400 mil millones USD',
    indicadores: { ipc: '5.2%', indicePrecios: 'Bajo' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+20',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en El Cairo',
        direccion: '21 Ahmed Naguib Street, Garden City, El Cairo',
        telefono: '+20 2 2794 6040',
        email: 'emb.elcairo@maec.es',
        horario: 'Domingo a jueves 8:00-15:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validez', 'Visa on arrival available', 'Voucher hotel recommended'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla if from endemic', 'Agua embotellada', 'Seguro médico recomendado'] },
      { categoria: 'Cultura', icon: '🏛️', items: ['Regatear en zocos', 'Respetar vestido en mosques', 'Tipping culture (baksheesh)'] }
    ],
    queHacer: [
      'Pirámides de Giza',
      'Valle de los Reyes',
      'Crucero por Nilo',
      'Probar koshari y ful',
      'Abu Simbel'
    ],
    queNoHacer: [
      'No photograph inside mosques without permission',
      'No show soles of feet',
      'No be rude about Islam',
      'No accept offers from touts',
      'No photograph police/military'
    ],
    diarios: [
      { nombre: 'Ahram Online', url: 'https://english.ahram.org.eg' },
      { nombre: 'Egyptian Gazette', url: 'https://theegyptian gazette.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Egipto', url: 'https://egymonuments.gov.eg' },
      { nombre: 'MAEC - Egipto', url: 'https://www.exteriores.gob.es/Embajadas/ElCairo' }
    ],
    bandera: '🇪🇬',
    mapaCoordenadas: [26.8206, 30.8025]
  },
  ma: {
    codigo: 'ma',
    nombre: 'Marruecos',
    capital: 'Rabat',
    continente: 'África',
    idioma: 'Árabe, Francés',
    moneda: 'Dirham marroquí (MAD)',
    tipoCambio: '1 EUR ≈ 10.8 MAD',
    zonaHoraria: 'UTC+1',
    conduccion: 'derecha',
    poblacion: '37 millones',
    pib: '134 mil millones USD',
    indicadores: { ipc: '2.3%', indicePrecios: 'Bajo' },
    voltaje: '220V / 50Hz',
    prefijoTelefono: '+212',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Rabat',
        direccion: 'Cuesta de Marchane, Souissi, Rabat',
        telefono: '+212 537 63 66 00',
        email: 'emb.rabat@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 3 meses validity', 'No se requiere visado', 'Registro consular recommended'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['No vaccines required', 'Agua embotellada', 'Seguro viaje'] },
      { categoria: 'Cultura', icon: '🕌', items: ['Respect Ramadan', 'Modest dress code', 'Bargaining en souks'] }
    ],
    queHacer: [
      'Perderse en zocos Marrakech',
      'Chefchaouen (ciudad azul)',
      'Desierto del Sahara',
      'Probar tagine y cuscús',
      'Fez y medina'
    ],
    queNoHacer: [
      'No photograph without permission',
      'No enter mosques unauthorized',
      'No drink alcohol in public',
      'No show affection public',
      'No show soles of feet'
    ],
    diarios: [
      { nombre: 'Le Matin', url: 'https://lematin.ma' },
      { nombre: 'TelQuel', url: 'https://telquel.ma' }
    ],
    urlsUtiles: [
      { nombre: 'Visit Morocco', url: 'https://www.visitmorocco.com' },
      { nombre: 'MAEC - Marruecos', url: 'https://www.exteriores.gob.es/Embajadas/Rabat' }
    ],
    bandera: '🇲🇦',
    mapaCoordenadas: [31.7917, -7.0926]
  },
  ke: {
    codigo: 'ke',
    nombre: 'Kenia',
    capital: 'Nairobi',
    continente: 'África',
    idioma: 'Swahili, Inglés',
    moneda: ' Chelín kenyano (KES)',
    tipoCambio: '1 EUR ≈ 155 KES',
    zonaHoraria: 'UTC+3',
    conduccion: 'izquierda',
    poblacion: '55 millones',
    pib: '110 mil millones USD',
    indicadores: { ipc: '5.6%', indicePrecios: 'Medio-Bajo' },
    voltaje: '240V / 50Hz',
    prefijoTelefono: '+254',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Nairobi',
        direccion: 'Upper Hill Road 10, Nairobi',
        telefono: '+254 20 277 2000',
        email: 'emb.nairobi@maec.es',
        horario: 'Lunes a viernes 8:00-16:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 6 meses validity', 'Visa required (e-visa)', 'Yellow fever certificate'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla OBLIGATORIA', 'Malaria prophylaxis essential', 'Seguro médico con evacuación'] },
      { categoria: 'Seguridad', icon: '⚠️', items: ['Cuidado en Nairobi', 'Safari con guías profesionales', 'No walk alone at night'] }
    ],
    queHacer: [
      'Safari en Masai Mara',
      'Ver migración de ñus',
      'Kilimanjaro trekking',
      'Probar nyama choma',
      'Playas de Mombasa'
    ],
    queNoHacer: [
      'No leave vehicle en safari',
      'No show valuables',
      'No walk night Nairobi CBD',
      'No take photos of locals without ask',
      'No touch animals'
    ],
    diarios: [
      { nombre: 'Daily Nation', url: 'https://nation.africa' },
      { nombre: 'The Standard', url: 'https://www.standardmedia.co.ke' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Kenia', url: 'https://www.magicalkenya.com' },
      { nombre: 'MAEC - Kenia', url: 'https://www.exteriores.gob.es/Embajadas/Nairobi' }
    ],
    bandera: '🇰🇪',
    mapaCoordenadas: [-0.0236, 37.9062]
  },
  au: {
    codigo: 'au',
    nombre: 'Australia',
    capital: 'Canberra',
    continente: 'Oceanía',
    idioma: 'Inglés',
    moneda: 'Dólar australiano (AUD)',
    tipoCambio: '1 EUR ≈ 1.65 AUD',
    zonaHoraria: 'UTC+8 a UTC+11',
    conduccion: 'izquierda',
    poblacion: '26 millones',
    pib: '1.7 billones USD',
    indicadores: { ipc: '3.6%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+61',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Canberra',
        direccion: '15 Arkana Street, Yarralumla, ACT 2600, Canberra',
        telefono: '+61 2 6273 3555',
        email: 'emb.canberra@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte electrónico (ePassport)', 'ETA subclass 601 online', 'No se requiere visado'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Seguro médico obligatorio', 'No snakes antivenom cost', 'World-class hospitals'] },
      { categoria: 'General', icon: '🦘', items: ['Biosecurity muy estricto', 'Large distances', 'UV very high'] }
    ],
    queHacer: [
      'Uluru (Ayers Rock)',
      'Gran Barrera de Coral',
      'Sídney Opera House',
      'Probar meat pie y vegemite',
      'Great Ocean Road'
    ],
    queNoHacer: [
      'No bring biosecurity items',
      'No swim at unpatrolled beaches',
      'No ignore sun protection',
      'No feed wildlife',
      'No swim with jellyfish in north'
    ],
    diarios: [
      { nombre: 'The Australian', url: 'https://www.theaustralian.com.au' },
      { nombre: 'ABC News', url: 'https://www.abc.net.au/news' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Australia', url: 'https://www.australia.com' },
      { nombre: 'MAEC - Australia', url: 'https://www.exteriores.gob.es/Embajadas/Canberra' }
    ],
    bandera: '🇦🇺',
    mapaCoordenadas: [-25.2744, 133.7751]
  },
  nz: {
    codigo: 'nz',
    nombre: 'Nueva Zelanda',
    capital: 'Wellington',
    continente: 'Oceanía',
    idioma: 'Inglés, Maorí',
    moneda: 'Dólar neozelandés (NZD)',
    tipoCambio: '1 EUR ≈ 1.78 NZD',
    zonaHoraria: 'UTC+12 a UTC+13',
    conduccion: 'izquierda',
    poblacion: '5 millones',
    pib: '247 mil millones USD',
    indicadores: { ipc: '3.9%', indicePrecios: 'Alto' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+64',
    nivelRiesgo: 'sin-riesgo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Wellington',
        direccion: '10 Brandon Street, Wellington 6011',
        telefono: '+64 4 499 4500',
        email: 'emb.wellington@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 3 meses validity', 'NZeTA required', 'No se requiere visado turismo'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['ACC for accidents', 'Seguro médico recomendado', 'No snakes'] },
      { categoria: 'General', icon: '🌿', items: ['Biosecurity muy estricto', 'Clean green country', 'Lord of the Rings filming locations'] }
    ],
    queHacer: [
      'Milford Sound',
      'Hobbiton Movie Set',
      'Queenstown adventure sports',
      'Probar pavlova y lamb',
      'Geothermal Rotorua'
    ],
    queNoHacer: [
      'No bring biosecurity risk items',
      'No ignore earthquake safety',
      'No feed wildlife',
      'No assume English only',
      'No disrespect Maori culture'
    ],
    diarios: [
      { nombre: 'New Zealand Herald', url: 'https://www.nzherald.co.nz' },
      { nombre: 'Stuff', url: 'https://www.stuff.co.nz' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo NZ', url: 'https://www.newzealand.com' },
      { nombre: 'MAEC - Nueva Zelanda', url: 'https://www.exteriores.gob.es/Embajadas/Wellington' }
    ],
    bandera: '🇳🇿',
    mapaCoordenadas: [-40.9006, 174.8860]
  },
  tr: {
    codigo: 'tr',
    nombre: 'Turquía',
    capital: 'Ankara',
    continente: 'Asia/Europa',
    idioma: 'Turco',
    moneda: 'Lira turca (TRY)',
    tipoCambio: '1 EUR ≈ 38 TRY',
    zonaHoraria: 'UTC+3',
    conduccion: 'derecha',
    poblacion: '85 millones',
    pib: '1.1 billones USD',
    indicadores: { ipc: '53.9%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+90',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Ankara',
        direccion: 'Karyağdı Sokak No. 10, Çankaya, Ankara',
        telefono: '+90 312 441 71 00',
        email: 'emb.ankara@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte 5 meses validity', 'No se requiere visado', 'Registro policial (24h)'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['No vaccines required', 'Seguro médico recomendado', 'Good healthcare system'] },
      { categoria: 'Cultura', icon: '🏛️', items: ['Bargaining en bazaars', 'Modest dress at mosques', 'Çay culture'] }
    ],
    queHacer: [
      'Santa Sofía en Estambul',
      'Capadocia hot air balloon',
      'Efeso antigua ciudad',
      'Probar kebab y baklava',
      'Pamukkale travertinos'
    ],
    queNoHacer: [
      'No discuss politics openly',
      'No show soles of feet',
      'No ignore conservative areas',
      'No assume Istanbul is all Turkey',
      'No skip Ankara capital'
    ],
    diarios: [
      { nombre: 'Hürriyet', url: 'https://www.hurriyet.com.tr' },
      { nombre: 'Sabah', url: 'https://www.sabah.com.tr' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Turquía', url: 'https://www.goturkiye.com' },
      { nombre: 'MAEC - Turquía', url: 'https://www.exteriores.gob.es/Embajadas/Ankara' }
    ],
    bandera: '🇹🇷',
    mapaCoordenadas: [38.9637, 35.2433]
  },

  id: {
    codigo: 'id',
    nombre: 'Indonesia (Bali)',
    capital: 'Yakarta',
    continente: 'Asia',
    idioma: 'Indonesio',
    moneda: 'Rupia indonesia (IDR)',
    tipoCambio: '1 EUR ≈ 17000 IDR',
    zonaHoraria: 'UTC+7 a +9',
    conduccion: 'izquierda',
    poblacion: '275 millones',
    pib: '1.3 billones USD',
    indicadores: { ipc: '3.5%', indicePrecios: 'Muy bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+62',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Yakarta',
        direccion: 'Jalan Profesor Mohammed Adnan Wiranata 61-63, Yakarta 10350',
        telefono: '+62 21 3190 6455',
        email: 'emb.yakarta@maec.es',
        horario: 'Lunes a viernes 8:30-15:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visado turístico 30 días', 'Boleto de salida'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla si vienes de zona endémica', 'Seguro médico obligatorio', 'Dengue presente'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Moneda: Rupia', 'Tarjetas en ciudades', 'Efectivo en mercados'] }
    ],
    queHacer: [
      'Visitar Borobudur al amanecer',
      'Disfrutar las playas de Bali',
      'Bucear en Komodo',
      'Explorar templos hinduistas',
      'Visitar arrozales de Tegallalang'
    ],
    queNoHacer: [
      'No toques la cabeza de los locales',
      'No señalices con el dedo',
      'No entres descalzo a templos',
      'No bebas agua del grifo',
      'No subas al Monte Agung sin guía'
    ],
    diarios: [
      { nombre: 'The Jakarta Post', url: 'https://www.thejakartapost.com' },
      { nombre: 'Bali Discovery', url: 'https://www.balidiscovery.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Indonesia', url: 'https://www.indonesia.travel' },
      { nombre: 'MAEC - Indonesia', url: 'https://www.exteriores.gob.es/Embajadas/Yakarta' }
    ],
    bandera: '🇮🇩',
    mapaCoordenadas: [-0.7893, 113.9213]
  },

  kh: {
    codigo: 'kh',
    nombre: 'Camboya',
    capital: 'Phnom Penh',
    continente: 'Asia',
    idioma: 'Jemer',
    moneda: 'Riel camboyano (KHR)',
    tipoCambio: '1 EUR ≈ 4400 KHR',
    zonaHoraria: 'UTC+7',
    conduccion: 'derecha',
    poblacion: '17 millones',
    pib: '29.5 billones USD',
    indicadores: { ipc: '2.5%', indicePrecios: 'Muy bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+855',
    nivelRiesgo: 'medio',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Bangkok (acreditada)',
        direccion: '990 Rama IV Road, Bangkok, Tailandia',
        telefono: '+66 2 635 6260',
        email: 'emb.bangkok@maec.es',
        horario: 'Lunes a viernes 9:00-14:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visado e-visa 30 días', 'Certificado fiebre amarilla'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacuna fiebre amarilla recomendada', 'Profilaxis malaria zonas rurales', 'Seguro médico esencial'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Moneda: Dólares USD aceptados', 'Clima tropical', 'Pobreza en zonas rurales'] }
    ],
    queHacer: [
      'Visitar Angkor Wat al amanecer',
      'Explorar Mercado Ruso de Phnom Penh',
      'Ir a las playas de Sihanoukville',
      'Probar amok de pescado',
      'Visitar Killing Fields'
    ],
    queNoHacer: [
      'No toques la cabeza de los camboyanos',
      'No señales con el dedo',
      'No toques el hombro de mujeres',
      'No fotografíes mendigos ni niños',
      'No aceptes ofertas demasiado buenas'
    ],
    diarios: [
      { nombre: 'Khmer Times', url: 'https://www.khmertimeskh.com' },
      { nombre: 'Cambodia Daily', url: 'https://www.cambodiadaily.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Camboya', url: 'https://www.tourismcambodia.com' },
      { nombre: 'Visado Camboya', url: 'https://www.evisa.gov.kh' }
    ],
    bandera: '🇰🇭',
    mapaCoordenadas: [12.5657, 104.9910]
  },

  la: {
    codigo: 'la',
    nombre: 'Laos',
    capital: 'Vientián',
    continente: 'Asia',
    idioma: 'Lao',
    moneda: 'Kip laosiano (LAK)',
    tipoCambio: '1 EUR ≈ 21000 LAK',
    zonaHoraria: 'UTC+7',
    conduccion: 'derecha',
    poblacion: '7.5 millones',
    pib: '15.7 billones USD',
    indicadores: { ipc: '4.2%', indicePrecios: 'Muy bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+856',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Bangkok (acreditada)',
        direccion: '990 Rama IV Road, Bangkok, Tailandia',
        telefono: '+66 2 635 6260',
        email: 'emb.bangkok@maec.es',
        horario: 'Lunes a viernes 9:00-14:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visado turístico 30 días', 'Registro policial en hoteles'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Profilaxis malaria zonas rurales', 'Vacunas hepatitis recomendadas', 'Seguro médico obligatorio'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Moneda: Kip y USD aceptados', 'Clima tropical monzónico', 'País tranquilo y seguro'] }
    ],
    queHacer: [
      'Visitar Pagodas de Luang Prabang',
      'Navegar por el Mekong',
      'Ver la ceremonia del Tak Bat',
      'Visitar Cascadas de Kuang Si',
      'Explorar la meseta de Bolaven'
    ],
    queNoHacer: [
      'No toques objetos religiosos con la cabeza',
      'No señales a personas con el dedo',
      'No te vistas inapropiadamente en templos',
      'No compres antigüedades sin permiso',
      'No discutas sobre política'
    ],
    diarios: [
      { nombre: 'Vientián Times', url: 'https://www.vientianetimes.la' },
      { nombre: 'Lao News', url: 'https://www.laotourism.go.la' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Laos', url: 'https://www.laotourism.go.la' },
      { nombre: 'Visado Laos', url: 'https://www.laoevisa.gov.la' }
    ],
    bandera: '🇱🇦',
    mapaCoordenadas: [19.8563, 102.4955]
  },

  mm: {
    codigo: 'mm',
    nombre: 'Myanmar',
    capital: 'Naipyidó',
    continente: 'Asia',
    idioma: 'Birmano',
    moneda: 'Kyat birmano (MMK)',
    tipoCambio: '1 EUR ≈ 2800 MMK',
    zonaHoraria: 'UTC+6:30',
    conduccion: 'derecha',
    poblacion: '54 millones',
    pib: '65 billones USD',
    indicadores: { ipc: '5.8%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+95',
    nivelRiesgo: 'medio',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Bangkok (acreditada)',
        direccion: '990 Rama IV Road, Bangkok, Tailandia',
        telefono: '+66 2 635 6260',
        email: 'emb.bangkok@maec.es',
        horario: 'Lunes a viernes 9:00-14:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'E-visa 28 días', 'Permiso zonas restringidas'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas recomendadas estándar', 'Profilaxis malaria zonas rurales', 'Seguro con evacuación'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Moneda: Kyat y USD', 'Sitios restringidos por conflicto', 'Situación política inestable'] }
    ],
    queHacer: [
      'Visitar Pagodas de Bagan',
      'Ver Golden Rock de Kyaiktiyo',
      'Explorar el Lago Inle',
      'Visitar Mandalay',
      'Conocer Yangon'
    ],
    queNoHacer: [
      'No toques la cabeza de nadie',
      'No señales con el pie',
      'No votes a los monjes',
      'No fotografíes militares',
      'No viajes a zonas de conflicto'
    ],
    diarios: [
      { nombre: 'Myanmar Times', url: 'https://www.mmtimes.com' },
      { nombre: 'Eleven Media', url: 'https://elevenmediagroup.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Myanmar', url: 'https://tourismmyanmar.org' },
      { nombre: 'MAEC - Recomendaciones', url: 'https://www.exteriores.gob.es' }
    ],
    bandera: '🇲🇲',
    mapaCoordenadas: [21.9162, 95.9560]
  },

  my: {
    codigo: 'my',
    nombre: 'Malasia',
    capital: 'Kuala Lumpur',
    continente: 'Asia',
    idioma: 'Malayo',
    moneda: 'Ringgit malayo (MYR)',
    tipoCambio: '1 EUR ≈ 5 MYR',
    zonaHoraria: 'UTC+8',
    conduccion: 'izquierda',
    poblacion: '33 millones',
    pib: '373 billones USD',
    indicadores: { ipc: '2.5%', indicePrecios: 'Medio' },
    voltaje: '240V / 50Hz',
    prefijoTelefono: '+60',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Kuala Lumpur',
        direccion: 'No 199, Jalan Tun Razak, 50400 Kuala Lumpur',
        telefono: '+60 3 2166 6300',
        email: 'emb.kualalumpur@maec.es',
        horario: 'Lunes a viernes 9:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visado no requerido hasta 90 días', 'Boleto de salida'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas estándar actualizadas', 'Seguro médico recomendado', 'Malaria rara en ciudades'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Multicultural: malayo, chino, indio', 'Comida callejera excelente', 'KLIA obligatorio en ciertas zonas'] }
    ],
    queHacer: [
      'Visitar Torres Petronas',
      'Explorar George Town, Penang',
      'Ver las Cuevas de Batu',
      'Ir a las playas de Langkawi',
      'Probar nasi lemak'
    ],
    queNoHacer: [
      'No critiques la monarquía',
      'No muestres afecto público',
      'No fotografíes sin permiso en templos',
      'No te vistas inapropiadamente',
      'No introduzcas alimentos no halal'
    ],
    diarios: [
      { nombre: 'The Star', url: 'https://www.thestar.com.my' },
      { nombre: 'Malay Mail', url: 'https://www.malaymail.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Malasia', url: 'https://www.malaysia.travel' },
      { nombre: 'MAEC - Malasia', url: 'https://www.exteriores.gob.es/Embajadas/KualaLumpur' }
    ],
    bandera: '🇲🇾',
    mapaCoordenadas: [4.2105, 101.9758]
  },

  ph: {
    codigo: 'ph',
    nombre: 'Filipinas',
    capital: 'Manila',
    continente: 'Asia',
    idioma: 'Filipino, Inglés',
    moneda: 'Peso filipino (PHP)',
    tipoCambio: '1 EUR ≈ 60 PHP',
    zonaHoraria: 'UTC+8',
    conduccion: 'derecha',
    poblacion: '110 millones',
    pib: '404 billones USD',
    indicadores: { ipc: '4.2%', indicePrecios: 'Medio' },
    voltaje: '220V / 60Hz',
    prefijoTelefono: '+63',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Manila',
        direccion: '8th Floor, Pacific Star Building, Makati City, Manila',
        telefono: '+63 2 8812 5393',
        email: 'emb.manila@maec.es',
        horario: 'Lunes a viernes 8:00-16:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visado no requerido hasta 30 días', 'Boleto de salida'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas estándar actualizadas', 'Seguro médico obligatorio', 'Cuidado con dengue'] },
      { categoria: 'General', icon: 'ℹ️', items: ['7,000+ islas', 'Tagalo e inglés oficiales', 'Clima tropical'] }
    ],
    queHacer: [
      'Bucear en Palawan',
      'Visitar Chocolate Hills en Bohol',
      'Explorar Boracay',
      'Ver el Monte Mayón',
      'Ir a Siargao'
    ],
    queNoHacer: [
      'No aceptes invitaos de desconocidos',
      'No critiques al gobierno',
      'No muestres afecto público excesivo',
      'No visites Mindanao sin precauciones',
      'No ignores advisories locales'
    ],
    diarios: [
      { nombre: 'Philippine Daily Inquirer', url: 'https://www.inquirer.net' },
      { nombre: 'Manila Bulletin', url: 'https://mb.com.ph' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Filipinas', url: 'https://philippines.travel' },
      { nombre: 'MAEC - Filipinas', url: 'https://www.exteriores.gob.es/Embajadas/Manila' }
    ],
    bandera: '🇵🇭',
    mapaCoordenadas: [12.8797, 121.7740]
  },

  np: {
    codigo: 'np',
    nombre: 'Nepal',
    capital: 'Katmandú',
    continente: 'Asia',
    idioma: 'Nepalí',
    moneda: 'Rupia nepalesa (NPR)',
    tipoCambio: '1 EUR ≈ 135 NPR',
    zonaHoraria: 'UTC+5:45',
    conduccion: 'izquierda',
    poblacion: '30 millones',
    pib: '36 billones USD',
    indicadores: { ipc: '4.8%', indicePrecios: 'Bajo' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+977',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Nueva Delhi (acreditada)',
        direccion: '12, Aurangzeb Road, Nueva Delhi, India',
        telefono: '+91 11 4123 8100',
        email: 'emb.nuevadelhi@maec.es',
        horario: 'Lunes a viernes 9:00-17:00'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'Visa on arrival o e-visa', 'Permiso TIMS para trekking'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas hepatitis A, tifoidea', 'Profilaxis malaria no necesaria', 'Seguro evacuación esencial'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Altitude sickness en trekking', 'Mejor temporada: oct-nov, mar-may', 'Permiso trekking obligatorio'] }
    ],
    queHacer: [
      'Trekking al Campo Base del Everest',
      'Visitar templos de Katmandú',
      'Salida del sol en Sarankot',
      'Safari en Chitwan',
      'Visitar Lhasa desde Nepal'
    ],
    queNoHacer: [
      'No toques a nadie con el pie izquierdo',
      'No gires la espalda a budas',
      'No trekkees solo en zonas remotas',
      'No bebas agua no embotellada',
      'No ignores el mal de altura'
    ],
    diarios: [
      { nombre: 'The Kathmandu Post', url: 'https://kathmandupost.com' },
      { nombre: 'Nepal News', url: 'https://nepalnews.com' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Nepal', url: 'https://welcomenepal.com' },
      { nombre: 'TAAN Trekking', url: 'https://www.taan.org.np' }
    ],
    bandera: '🇳🇵',
    mapaCoordenadas: [28.3949, 84.1240]
  },

  lk: {
    codigo: 'lk',
    nombre: 'Sri Lanka',
    capital: 'Sri Jayawardenepura Kotte',
    continente: 'Asia',
    idioma: 'Singalés, Tamil',
    moneda: 'Rupia de Sri Lanka (LKR)',
    tipoCambio: '1 EUR ≈ 360 LKR',
    zonaHoraria: 'UTC+5:30',
    conduccion: 'izquierda',
    poblacion: '22 millones',
    pib: '85 billones USD',
    indicadores: { ipc: '4.5%', indicePrecios: 'Medio' },
    voltaje: '230V / 50Hz',
    prefijoTelefono: '+94',
    nivelRiesgo: 'bajo',
    ultimoInforme: 'Marzo 2026',
    contactos: [
      {
        tipo: 'Embajada',
        nombre: 'Embajada de España en Colombo',
        direccion: '25, Sir James Peiris Mawatha, Colombo 2',
        telefono: '+94 11 269 4699',
        email: 'emb.colombo@maec.es',
        horario: 'Lunes a viernes 8:30-15:30'
      }
    ],
    requerimientos: [
      { categoria: 'Documentación', icon: '📄', items: ['Pasaporte válido 6 meses', 'ETA (Electronic Travel Authorization)', 'Boleto de salida'] },
      { categoria: 'Sanitario', icon: '🏥', items: ['Vacunas estándar actualizadas', 'Dengue presente', 'Seguro médico obligatorio'] },
      { categoria: 'General', icon: 'ℹ️', items: ['Clima tropical', 'Tsunamis históricamente', 'Comida picante típica'] }
    ],
    queHacer: [
      'Visitar Sigiriya (Roca del León)',
      'Temple of the Tooth en Kandy',
      'Safari en Yala',
      'Tomar té en Nuwara Eliya',
      'Playas de Mirissa'
    ],
    queNoHacer: [
      'No toques la cabeza de los cingales',
      'No señales con el pie',
      'No votes a budas',
      'No discutas de política',
      'No ignores avisos de tsunami'
    ],
    diarios: [
      { nombre: 'Daily Mirror', url: 'https://www.dailymirror.lk' },
      { nombre: 'The Island', url: 'https://www.island.lk' }
    ],
    urlsUtiles: [
      { nombre: 'Turismo Sri Lanka', url: 'https://srilanka.travel' },
      { nombre: 'MAEC - Sri Lanka', url: 'https://www.exteriores.gob.es/Embajadas/Colombo' }
    ],
    bandera: '🇱🇰',
    mapaCoordenadas: [7.8731, 80.7718]
  }
};

export function getPaisPorCodigo(codigo: string): DatoPais | undefined {
  return paisesData[codigo.toLowerCase()];
}

export function getTodosLosPaises(): DatoPais[] {
  return Object.values(paisesData);
}

export function getPaisesPorNivelRiesgo(nivel: NivelRiesgo): DatoPais[] {
  return Object.values(paisesData).filter(p => p.nivelRiesgo === nivel);
}

export function getPaisesPorContinente(continente: string): DatoPais[] {
  return Object.values(paisesData).filter(p => p.continente === continente);
}

export interface ColoresRiesgo {
  bg: string;
  text: string;
  border: string;
}

export function getColoresRiesgo(nivel: NivelRiesgo): ColoresRiesgo {
  switch (nivel) {
    case 'sin-riesgo': return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
    case 'bajo': return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
    case 'medio': return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
    case 'alto': return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
    case 'muy-alto': return { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900' };
  }
}

export function getLabelRiesgo(nivel: NivelRiesgo): string {
  switch (nivel) {
    case 'sin-riesgo': return 'Sin riesgo';
    case 'bajo': return 'Riesgo bajo';
    case 'medio': return 'Riesgo medio';
    case 'alto': return 'Riesgo alto';
    case 'muy-alto': return 'Riesgo muy alto';
  }
}
