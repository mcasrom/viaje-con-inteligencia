// Seed script for radius recommender - generates SQL for places table
// Run: node scripts/seed-places.mjs > supabase/seed-places.sql

const CITIES = {
  // EUROPA
  es: { country: 'España', risk: 'sin-riesgo', cities: [
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, type: 'city', pop: '3.3M', desc: 'Capital de España, museos del Prado y Reina Sofía' },
    { name: 'Barcelona', lat: 41.3874, lon: 2.1686, type: 'city', pop: '1.6M', desc: 'Sagrada Familia, Park Güell, playas mediterráneas' },
    { name: 'Sevilla', lat: 37.3891, lon: -5.9845, type: 'city', pop: '690K', desc: 'Alcázar, Plaza de España, flamenco' },
    { name: 'Valencia', lat: 39.4699, lon: -0.3763, type: 'city', pop: '800K', desc: 'Ciudad de las Artes y las Ciencias, paella' },
    { name: 'Granada', lat: 37.1773, lon: -3.5986, type: 'city', pop: '230K', desc: 'Alhambra, Sierra Nevada, tapas gratis' },
    { name: 'Bilbao', lat: 43.263, lon: -2.935, type: 'city', pop: '350K', desc: 'Guggenheim, casco viejo, pintxos' },
    { name: 'San Sebastián', lat: 43.3183, lon: -1.9812, type: 'city', pop: '190K', desc: 'Playa de la Concha, gastronomía vasca' },
    { name: 'Málaga', lat: 36.7213, lon: -4.4214, type: 'city', pop: '580K', desc: 'Costa del Sol, Picasso, Alcazaba' },
    { name: 'Toledo', lat: 39.8628, lon: -4.0273, type: 'city', pop: '85K', desc: 'Ciudad imperial, catedral gótica' },
    { name: 'Santiago de Compostela', lat: 42.8805, lon: -8.5457, type: 'city', pop: '98K', desc: 'Fin del Camino de Santiago, catedral románica' },
    { name: 'Córdoba', lat: 37.8882, lon: -4.7794, type: 'city', pop: '325K', desc: 'Mezquita-Catedral, patios cordobeses' },
    { name: 'Salamanca', lat: 40.9701, lon: -5.6635, type: 'city', pop: '145K', desc: 'Universidad histórica, Plaza Mayor' },
  ]},
  fr: { country: 'Francia', risk: 'sin-riesgo', cities: [
    { name: 'París', lat: 48.8566, lon: 2.3522, type: 'city', pop: '2.2M', desc: 'Torre Eiffel, Louvre, Notre-Dame' },
    { name: 'Lyon', lat: 45.764, lon: 4.8357, type: 'city', pop: '520K', desc: 'Capital gastronómica, Vieux Lyon' },
    { name: 'Marsella', lat: 43.2965, lon: 5.3698, type: 'city', pop: '870K', desc: 'Vieux-Port, Calanques, cultura mediterránea' },
    { name: 'Niza', lat: 43.7102, lon: 7.262, type: 'city', pop: '340K', desc: 'Promenade des Anglais, Côte d\'Azur' },
    { name: 'Burdeos', lat: 44.8378, lon: -0.5792, type: 'city', pop: '260K', desc: 'Vinos, Place de la Bourse, Cité du Vin' },
    { name: 'Estrasburgo', lat: 48.5734, lon: 7.7521, type: 'city', pop: '290K', desc: 'Parlamento Europeo, Petite France' },
    { name: 'Toulouse', lat: 43.6047, lon: 1.4442, type: 'city', pop: '500K', desc: 'Ciudad rosa, Cité de l\'espace' },
    { name: 'Mont-Saint-Michel', lat: 48.6361, lon: -1.5115, type: 'town', pop: '30', desc: 'Abadía medieval, maravilla del mundo' },
  ]},
  it: { country: 'Italia', risk: 'sin-riesgo', cities: [
    { name: 'Roma', lat: 41.9028, lon: 12.4964, type: 'city', pop: '2.9M', desc: 'Coliseo, Vaticano, Fontana di Trevi' },
    { name: 'Florencia', lat: 43.7696, lon: 11.2558, type: 'city', pop: '380K', desc: 'Cuna del Renacimiento, Uffizi, Duomo' },
    { name: 'Venecia', lat: 45.4408, lon: 12.3155, type: 'city', pop: '260K', desc: 'Canales, Plaza de San Marcos, Murano' },
    { name: 'Milán', lat: 45.4642, lon: 9.19, type: 'city', pop: '1.4M', desc: 'Moda, Duomo, La Scala' },
    { name: 'Nápoles', lat: 40.8518, lon: 14.2681, type: 'city', pop: '970K', desc: 'Pizza original, Pompeya, Vesubio' },
    { name: 'Bolonia', lat: 44.4949, lon: 11.3426, type: 'city', pop: '400K', desc: 'Capital gastronómica, universidad más antigua' },
    { name: 'Verona', lat: 45.4384, lon: 10.9916, type: 'city', pop: '260K', desc: 'Arena romana, casa de Julieta' },
    { name: 'Sicilia (Palermo)', lat: 38.1157, lon: 13.3615, type: 'city', pop: '630K', desc: 'Mercados, templos griegos, gastronomía' },
  ]},
  de: { country: 'Alemania', risk: 'sin-riesgo', cities: [
    { name: 'Berlín', lat: 52.52, lon: 13.405, type: 'city', pop: '3.7M', desc: 'Muro de Berlín, Puerta de Brandeburgo' },
    { name: 'Múnich', lat: 48.1351, lon: 11.582, type: 'city', pop: '1.5M', desc: 'Oktoberfest, Marienplatz, cervecerías' },
    { name: 'Hamburgo', lat: 53.5511, lon: 9.9937, type: 'city', pop: '1.9M', desc: 'Puerto, Elbphilharmonie, Speicherstadt' },
    { name: 'Colonia', lat: 50.9375, lon: 6.9603, type: 'city', pop: '1.1M', desc: 'Catedral gótica, Museo Ludwig' },
    { name: 'Fráncfort', lat: 50.1109, lon: 8.6821, type: 'city', pop: '760K', desc: 'Rascacielos, Museo Städel, Römer' },
    { name: 'Dresde', lat: 51.0504, lon: 13.7373, type: 'city', pop: '560K', desc: 'Zwinger, Frauenkirche, Florencia del Elba' },
  ]},
  pt: { country: 'Portugal', risk: 'sin-riesgo', cities: [
    { name: 'Lisboa', lat: 38.7223, lon: -9.1393, type: 'city', pop: '550K', desc: 'Tranvía 28, Belém, fado' },
    { name: 'Oporto', lat: 41.1579, lon: -8.6291, type: 'city', pop: '240K', desc: 'Vino de Oporto, Librería Lello, Ribeira' },
    { name: 'Sintra', lat: 38.7982, lon: -9.3885, type: 'town', pop: '27K', desc: 'Palacio da Pena, Quinta da Regaleira' },
    { name: 'Faro', lat: 37.0194, lon: -7.9322, type: 'city', pop: '65K', desc: 'Algarve, playas, Ria Formosa' },
    { name: 'Coímbra', lat: 40.2033, lon: -8.4103, type: 'city', pop: '105K', desc: 'Universidad histórica, biblioteca Joanina' },
    { name: 'Évora', lat: 38.5714, lon: -7.9095, type: 'town', pop: '57K', desc: 'Templo romano, capilla de huesos' },
  ]},
  gb: { country: 'Reino Unido', risk: 'sin-riesgo', cities: [
    { name: 'Londres', lat: 51.5074, lon: -0.1278, type: 'city', pop: '9M', desc: 'Big Ben, Tower of London, British Museum' },
    { name: 'Edimburgo', lat: 55.9533, lon: -3.1883, type: 'city', pop: '530K', desc: 'Castillo, Royal Mile, festival Fringe' },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426, type: 'city', pop: '550K', desc: 'Fútbol, Northern Quarter, museos' },
    { name: 'Liverpool', lat: 53.4084, lon: -2.9916, type: 'city', pop: '500K', desc: 'The Beatles, Albert Dock, Anfield' },
    { name: 'Bath', lat: 51.3811, lon: -2.359, type: 'town', pop: '100K', desc: 'Termas romanas, arquitectura georgiana' },
    { name: 'Cambridge', lat: 52.2053, lon: 0.1218, type: 'town', pop: '130K', desc: 'Universidad, punting, King\'s College' },
  ]},
  gr: { country: 'Grecia', risk: 'sin-riesgo', cities: [
    { name: 'Atenas', lat: 37.9838, lon: 23.7275, type: 'city', pop: '3.1M', desc: 'Acrópolis, Partenón, Plaka' },
    { name: 'Santorini', lat: 36.3932, lon: 25.4615, type: 'town', pop: '15K', desc: 'Atardeceres en Oia, playas volcánicas' },
    { name: 'Mykonos', lat: 37.4467, lon: 25.3289, type: 'town', pop: '10K', desc: 'Molinos, playas, vida nocturna' },
    { name: 'Salónica', lat: 40.6401, lon: 22.9444, type: 'city', pop: '320K', desc: 'Torre Blanca, murallas bizantinas' },
    { name: 'Creta (Heraklion)', lat: 35.3387, lon: 25.1442, type: 'city', pop: '170K', desc: 'Palacio de Knossos, gargantas de Samariá' },
    { name: 'Delfos', lat: 38.4824, lon: 22.501, type: 'town', pop: '1K', desc: 'Oráculo antiguo, templo de Apolo' },
  ]},
  ie: { country: 'Irlanda', risk: 'sin-riesgo', cities: [
    { name: 'Dublín', lat: 53.3498, lon: -6.2603, type: 'city', pop: '550K', desc: 'Trinity College, Guinness Storehouse, Temple Bar' },
    { name: 'Galway', lat: 53.2707, lon: -9.0568, type: 'city', pop: '80K', desc: 'Música tradicional, Cliffs of Moher cerca' },
    { name: 'Cork', lat: 51.8985, lon: -8.4756, type: 'city', pop: '210K', desc: 'English Market, Blarney Castle' },
  ]},
  nl: { country: 'Países Bajos', risk: 'sin-riesgo', cities: [
    { name: 'Ámsterdam', lat: 52.3676, lon: 4.9041, type: 'city', pop: '920K', desc: 'Canales, Rijksmuseum, Anne Frank' },
    { name: 'Rotterdam', lat: 51.9244, lon: 4.4777, type: 'city', pop: '670K', desc: 'Arquitectura moderna, puerto, Markthal' },
    { name: 'La Haya', lat: 52.0705, lon: 4.3007, type: 'city', pop: '560K', desc: 'Tribunal Internacional, Mauritshuis' },
    { name: 'Utrecht', lat: 52.0907, lon: 5.1214, type: 'city', pop: '360K', desc: 'Domtoren, canales con muelles' },
  ]},
  be: { country: 'Bélgica', risk: 'sin-riesgo', cities: [
    { name: 'Bruselas', lat: 50.8503, lon: 4.3517, type: 'city', pop: '1.2M', desc: 'Grand Place, Atomium, Manneken Pis' },
    { name: 'Brujas', lat: 51.2093, lon: 3.2247, type: 'city', pop: '120K', desc: 'Canales medievales, patrimonio UNESCO' },
    { name: 'Gante', lat: 51.0543, lon: 3.7174, type: 'city', pop: '260K', desc: 'Castillo de los Condes, Catedral de San Bavón' },
    { name: 'Antwerp', lat: 51.2194, lon: 4.4025, type: 'city', pop: '530K', desc: 'Diamantes, catedral, Rubens' },
  ]},
  at: { country: 'Austria', risk: 'sin-riesgo', cities: [
    { name: 'Viena', lat: 48.2082, lon: 16.3738, type: 'city', pop: '1.9M', desc: 'Schönbrunn, ópera, café vienesa' },
    { name: 'Salzburgo', lat: 47.8095, lon: 13.055, type: 'city', pop: '155K', desc: 'Mozart, Hohensalzburg, Sound of Music' },
    { name: 'Innsbruck', lat: 47.2692, lon: 11.4041, type: 'city', pop: '130K', desc: 'Alpes, Goldenes Dachl, esquí' },
    { name: 'Hallstatt', lat: 47.5622, lon: 13.6493, type: 'town', pop: '800', desc: 'Lago alpino, mina de sal, UNESCO' },
  ]},
  ch: { country: 'Suiza', risk: 'sin-riesgo', cities: [
    { name: 'Zúrich', lat: 47.3769, lon: 8.5417, type: 'city', pop: '430K', desc: 'Finanzas, lago, Bahnhofstrasse' },
    { name: 'Ginebra', lat: 46.2044, lon: 6.1432, type: 'city', pop: '200K', desc: 'ONU, Jet d\'Eau, Cruz Roja' },
    { name: 'Lucerna', lat: 47.0502, lon: 8.3093, type: 'city', pop: '80K', desc: 'Kapellbrücke, Monte Pilatus, lago' },
    { name: 'Interlaken', lat: 46.6863, lon: 7.8632, type: 'town', pop: '5K', desc: 'Jungfrau, deportes extremos, lagos' },
  ]},
  pl: { country: 'Polonia', risk: 'sin-riesgo', cities: [
    { name: 'Cracovia', lat: 50.0647, lon: 19.945, type: 'city', pop: '780K', desc: 'Wawel, casco medieval, Auschwitz cerca' },
    { name: 'Varsovia', lat: 52.2297, lon: 21.0122, type: 'city', pop: '1.8M', desc: 'Casco antiguo reconstruido, palacios' },
    { name: 'Gdańsk', lat: 54.352, lon: 18.6466, type: 'city', pop: '470K', desc: 'Puerto báltico, Solidaridad, ámbar' },
    { name: 'Wrocław', lat: 51.1079, lon: 17.0385, type: 'city', pop: '640K', desc: 'Isla de las Catedrales, enanos de bronce' },
  ]},
  cz: { country: 'República Checa', risk: 'sin-riesgo', cities: [
    { name: 'Praga', lat: 50.0755, lon: 14.4378, type: 'city', pop: '1.3M', desc: 'Puente Carlos, Castillo, Plaza Vieja' },
    { name: 'Český Krumlov', lat: 48.8127, lon: 14.3175, type: 'town', pop: '13K', desc: 'Castillo medieval, Vltava, UNESCO' },
    { name: 'Brno', lat: 49.1951, lon: 16.6068, type: 'city', pop: '380K', desc: 'Castillo de Špilberk, Villa Tugendhat' },
  ]},
  hu: { country: 'Hungría', risk: 'sin-riesgo', cities: [
    { name: 'Budapest', lat: 47.4979, lon: 19.0402, type: 'city', pop: '1.7M', desc: 'Parlamento, baños termales, Danubio' },
    { name: 'Eger', lat: 47.9031, lon: 20.3734, type: 'town', pop: '53K', desc: 'Castillo, vinos de Bull\'s Blood, baños' },
    { name: 'Pécs', lat: 46.0727, lon: 18.2322, type: 'city', pop: '140K', desc: 'Mausoleo paleocristiano, mezquita' },
  ]},
  ro: { country: 'Rumanía', risk: 'sin-riesgo', cities: [
    { name: 'Bucarest', lat: 44.4268, lon: 26.1025, type: 'city', pop: '1.8M', desc: 'Palacio del Parlamento, casco antiguo' },
    { name: 'Brașov', lat: 45.6427, lon: 25.5887, type: 'city', pop: '250K', desc: 'Castillo de Bran (Drácula), montes Cárpatos' },
    { name: 'Cluj-Napoca', lat: 46.7712, lon: 23.6236, type: 'city', pop: '320K', desc: 'Universidad, festival UNTOLD, Transilvania' },
    { name: 'Sibiu', lat: 45.794, lon: 24.1496, type: 'city', pop: '150K', desc: 'Capital Cultural Europea, plazas medievales' },
  ]},
  hr: { country: 'Croacia', risk: 'sin-riesgo', cities: [
    { name: 'Dubrovnik', lat: 42.6403, lon: 18.1083, type: 'city', pop: '42K', desc: 'Murallas medievales, Juego de Tronos' },
    { name: 'Split', lat: 43.5081, lon: 16.4402, type: 'city', pop: '180K', desc: 'Palacio de Diocleciano, islas dálmatas' },
    { name: 'Zagreb', lat: 45.815, lon: 15.9819, type: 'city', pop: '690K', desc: 'Capital, mercados, museos' },
    { name: 'Plitvice', lat: 44.8651, lon: 15.5824, type: 'town', pop: '1K', desc: 'Lagos y cascadas, parque nacional UNESCO' },
  ]},
  bg: { country: 'Bulgaria', risk: 'sin-riesgo', cities: [
    { name: 'Sofía', lat: 42.6977, lon: 23.3219, type: 'city', pop: '1.2M', desc: 'Catedral Alexander Nevsky, Vitosha' },
    { name: 'Plovdiv', lat: 42.1354, lon: 24.7453, type: 'city', pop: '350K', desc: 'Capital Cultural 2019, teatro romano' },
    { name: 'Varna', lat: 43.2141, lon: 27.9147, type: 'city', pop: '340K', desc: 'Mar Negro, playas, jardines marítimos' },
  ]},
  sk: { country: 'Eslovaquia', risk: 'sin-riesgo', cities: [
    { name: 'Bratislava', lat: 48.1486, lon: 17.1077, type: 'city', pop: '440K', desc: 'Castillo, casco antiguo, Danubio' },
    { name: 'Košice', lat: 48.7164, lon: 21.2611, type: 'city', pop: '240K', desc: 'Catedral gótica, calle principal' },
  ]},
  si: { country: 'Eslovenia', risk: 'sin-riesgo', cities: [
    { name: 'Liubliana', lat: 46.0569, lon: 14.5058, type: 'city', pop: '290K', desc: 'Castillo, Dragón, arquitectura de Plečnik' },
    { name: 'Lago Bled', lat: 46.3638, lon: 14.0997, type: 'town', pop: '5K', desc: 'Isla con iglesia, castillo, Alpes Julianos' },
  ]},
  dk: { country: 'Dinamarca', risk: 'sin-riesgo', cities: [
    { name: 'Copenhague', lat: 55.6761, lon: 12.5683, type: 'city', pop: '780K', desc: 'La Sirenita, Nyhavn, Tivoli' },
    { name: 'Aarhus', lat: 56.1629, lon: 10.2039, type: 'city', pop: '280K', desc: 'Museo al aire libre ARoS, universidad' },
    { name: 'Odense', lat: 55.4038, lon: 10.4024, type: 'city', pop: '180K', desc: 'Ciudad natal de Hans Christian Andersen' },
  ]},
  se: { country: 'Suecia', risk: 'sin-riesgo', cities: [
    { name: 'Estocolmo', lat: 59.3293, lon: 18.0686, type: 'city', pop: '970K', desc: 'Gamla Stan, Vasa Museum, archipiélago' },
    { name: 'Gotemburgo', lat: 57.7089, lon: 11.9746, type: 'city', pop: '580K', desc: 'Puerto, Liseberg, canales' },
    { name: 'Malmö', lat: 55.605, lon: 13.0038, type: 'city', pop: '350K', desc: 'Turning Torso, puente de Øresund' },
  ]},
  no: { country: 'Noruega', risk: 'sin-riesgo', cities: [
    { name: 'Oslo', lat: 59.9139, lon: 10.7522, type: 'city', pop: '690K', desc: 'Fiordo, Museo del Barco Vikingo, Holmenkollen' },
    { name: 'Bergen', lat: 60.3913, lon: 5.3221, type: 'city', pop: '290K', desc: 'Bryggen, fiordos, puerta a Lofoten' },
    { name: 'Tromsø', lat: 69.6492, lon: 18.9553, type: 'city', pop: '77K', desc: 'Auroras boreales, sol de medianoche' },
  ]},
  fi: { country: 'Finlandia', risk: 'sin-riesgo', cities: [
    { name: 'Helsinki', lat: 60.1699, lon: 24.9384, type: 'city', pop: '660K', desc: 'Catedral blanca, Suomenlinna, diseño' },
    { name: 'Rovaniemi', lat: 66.5039, lon: 25.7294, type: 'city', pop: '63K', desc: 'Casa de Papá Noel, auroras, Laponia' },
    { name: 'Turku', lat: 60.4518, lon: 22.2666, type: 'city', pop: '195K', desc: 'Castillo medieval, catedral, archipiélago' },
  ]},
  is: { country: 'Islandia', risk: 'sin-riesgo', cities: [
    { name: 'Reikiavik', lat: 64.1466, lon: -21.9426, type: 'city', pop: '140K', desc: 'Auroras, Blue Lagoon, Hallgrímskirkja' },
    { name: 'Vík', lat: 63.4186, lon: -19.0059, type: 'town', pop: '300', desc: 'Playa negra de arena, acantilados Dyrhólaey' },
    { name: 'Akureyri', lat: 65.6835, lon: -18.1002, type: 'city', pop: '19K', desc: 'Capital del norte, fiordos, ballenas' },
  ]},
  ee: { country: 'Estonia', risk: 'sin-riesgo', cities: [
    { name: 'Tallin', lat: 59.437, lon: 24.7536, type: 'city', pop: '440K', desc: 'Casco medieval, Toompea, digital nation' },
    { name: 'Tartu', lat: 58.378, lon: 26.729, type: 'city', pop: '97K', desc: 'Universidad, Museo Nacional, Bohemia' },
  ]},
  lv: { country: 'Letonia', risk: 'sin-riesgo', cities: [
    { name: 'Riga', lat: 56.9496, lon: 24.1052, type: 'city', pop: '610K', desc: 'Art Nouveau, Mercado Central, casco antiguo' },
    { name: 'Jūrmala', lat: 56.968, lon: 23.7706, type: 'town', pop: '50K', desc: 'Playa de arena blanca, spa' },
  ]},
  lt: { country: 'Lituania', risk: 'sin-riesgo', cities: [
    { name: 'Vilna', lat: 54.6872, lon: 25.2797, type: 'city', pop: '590K', desc: 'Casco antiguo UNESCO, Torre de Gediminas' },
    { name: 'Kaunas', lat: 54.8985, lon: 23.9036, type: 'city', pop: '280K', desc: 'Castillo, Modernismo UNESCO' },
  ]},
  // AMÉRICA
  mx: { country: 'México', risk: 'bajo', cities: [
    { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332, type: 'city', pop: '9M', desc: 'Zócalo, Museo Nacional de Antropología' },
    { name: 'Cancún', lat: 21.1619, lon: -86.8515, type: 'city', pop: '900K', desc: 'Playas caribeñas, Chichén Itzá cerca' },
    { name: 'Oaxaca', lat: 17.0594, lon: -96.7216, type: 'city', pop: '260K', desc: 'Gastronomía, Monte Albán, Día de Muertos' },
    { name: 'Guanajuato', lat: 21.019, lon: -101.2574, type: 'city', pop: '190K', desc: 'Callejoneada, momias, callejones coloridos' },
    { name: 'San Miguel de Allende', lat: 20.9153, lon: -100.7437, type: 'town', pop: '170K', desc: 'Arte, arquitectura colonial, Parroquia' },
    { name: 'Mérida', lat: 20.9674, lon: -89.5926, type: 'city', pop: '900K', desc: 'Cenotes, cultura maya, cenote Ik Kil' },
  ]},
  us: { country: 'Estados Unidos', risk: 'bajo', cities: [
    { name: 'Nueva York', lat: 40.7128, lon: -74.006, type: 'city', pop: '8.3M', desc: 'Estatua de la Libertad, Central Park' },
    { name: 'Los Ángeles', lat: 34.0522, lon: -118.2437, type: 'city', pop: '3.9M', desc: 'Hollywood, Santa Monica, Disneyland' },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, type: 'city', pop: '870K', desc: 'Golden Gate, Alcatraz, Silicon Valley' },
    { name: 'Miami', lat: 25.7617, lon: -80.1918, type: 'city', pop: '470K', desc: 'South Beach, Art Deco, Everglades' },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298, type: 'city', pop: '2.7M', desc: 'Architecture, Millennium Park, deep dish' },
    { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, type: 'city', pop: '650K', desc: 'Strip, shows, Gran Cañón cerca' },
  ]},
  ca: { country: 'Canadá', risk: 'sin-riesgo', cities: [
    { name: 'Toronto', lat: 43.6532, lon: -79.3832, type: 'city', pop: '2.9M', desc: 'CN Tower, multicultural, islas' },
    { name: 'Vancouver', lat: 49.2827, lon: -123.1207, type: 'city', pop: '680K', desc: 'Montañas, Stanley Park, Granville Island' },
    { name: 'Montreal', lat: 45.5017, lon: -73.5673, type: 'city', pop: '1.8M', desc: 'Bilingüe, Old Port, Festival de Jazz' },
    { name: 'Quebec', lat: 46.8139, lon: -71.208, type: 'city', pop: '550K', desc: 'Ciudad amurallada, Château Frontenac' },
  ]},
  co: { country: 'Colombia', risk: 'medio', cities: [
    { name: 'Bogotá', lat: 4.711, lon: -74.0721, type: 'city', pop: '7.2M', desc: 'Monserrate, Museo del Oro, La Candelaria' },
    { name: 'Cartagena', lat: 10.391, lon: -75.5144, type: 'city', pop: '1M', desc: 'Ciudad amurallada, Rosario Islands' },
    { name: 'Medellín', lat: 6.2476, lon: -75.5658, type: 'city', pop: '2.5M', desc: 'Ciudad de la eterna primavera, Comuna 13' },
    { name: 'Eje Cafetero', lat: 4.5709, lon: -75.6782, type: 'town', pop: '400K', desc: 'Cocora Valley, Salento, fincas cafeteras' },
  ]},
  pe: { country: 'Perú', risk: 'bajo', cities: [
    { name: 'Lima', lat: -12.0464, lon: -77.0428, type: 'city', pop: '10M', desc: 'Gastronomía, Huaca Pucllana, Miraflores' },
    { name: 'Cusco', lat: -13.1631, lon: -72.545, type: 'city', pop: '430K', desc: 'Machu Picchu, Plaza de Armas, Sacsayhuamán' },
    { name: 'Arequipa', lat: -16.409, lon: -71.5375, type: 'city', pop: '870K', desc: 'Ciudad blanca, Cañón del Colca' },
    { name: 'Lago Titicaca (Puno)', lat: -15.8402, lon: -70.0219, type: 'city', pop: '120K', desc: 'Islas flotantes Uros, Amantaní' },
  ]},
  ar: { country: 'Argentina', risk: 'bajo', cities: [
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, type: 'city', pop: '3M', desc: 'Tango, La Boca, Recoleta, Palermo' },
    { name: 'Bariloche', lat: -41.1335, lon: -71.3103, type: 'city', pop: '130K', desc: 'Lagos, esquí, chocolate, Patagonia' },
    { name: 'Mendoza', lat: -32.8908, lon: -68.8272, type: 'city', pop: '115K', desc: 'Vinos, Aconcagua, Andes' },
    { name: 'Cataratas del Iguazú', lat: -25.6953, lon: -54.4367, type: 'town', pop: '30K', desc: 'Cataratas UNESCO, selva misionera' },
    { name: 'Salta', lat: -24.7859, lon: -65.4117, type: 'city', pop: '540K', desc: 'Tren a las Nubes, Quebrada de Humahuaca' },
  ]},
  cl: { country: 'Chile', risk: 'bajo', cities: [
    { name: 'Santiago', lat: -33.4489, lon: -70.6693, type: 'city', pop: '5.6M', desc: 'Cerro San Cristóbal, centro histórico' },
    { name: 'Valparaíso', lat: -33.0472, lon: -71.6127, type: 'city', pop: '290K', desc: 'Cerros coloridos, funiculares, Neruda' },
    { name: 'San Pedro de Atacama', lat: -22.909, lon: -68.2004, type: 'town', pop: '6K', desc: 'Desierto, géiseres, lagunas altiplánicas' },
    { name: 'Puerto Varas', lat: -41.3189, lon: -72.9844, type: 'city', pop: '45K', desc: 'Lago Llanquihue, volcanes, Chiloé' },
  ]},
  ec: { country: 'Ecuador', risk: 'bajo', cities: [
    { name: 'Quito', lat: -0.1807, lon: -78.4678, type: 'city', pop: '1.6M', desc: 'Centro histórico UNESCO, Mitad del Mundo' },
    { name: 'Galápagos', lat: -0.9538, lon: -90.9656, type: 'town', pop: '25K', desc: 'Tortugas gigantes, iguanas marinas, Darwin' },
    { name: 'Cuenca', lat: -2.9001, lon: -79.0059, type: 'city', pop: '330K', desc: 'Catedral Nueva, ríos Tomebamba, artesanal' },
  ]},
  cr: { country: 'Costa Rica', risk: 'bajo', cities: [
    { name: 'San José', lat: 9.9281, lon: -84.0907, type: 'city', pop: '340K', desc: 'Museo del Oro Precolombino, Teatro Nacional' },
    { name: 'Arenal/La Fortuna', lat: 10.4624, lon: -84.6694, type: 'town', pop: '6K', desc: 'Volcán, aguas termales, cascadas' },
    { name: 'Monteverde', lat: 10.303, lon: -84.8074, type: 'town', pop: '4K', desc: 'Bosque nuboso, canopy walk, quetzales' },
    { name: 'Manuel Antonio', lat: 9.3908, lon: -84.143, type: 'town', pop: '2K', desc: 'Playas, monos, parque nacional' },
  ]},
  pa: { country: 'Panamá', risk: 'bajo', cities: [
    { name: 'Ciudad de Panamá', lat: 8.9824, lon: -79.5199, type: 'city', pop: '900K', desc: 'Canal de Panamá, Casco Viejo' },
    { name: 'Bocas del Toro', lat: 9.3463, lon: -82.2542, type: 'town', pop: '5K', desc: 'Archipiélago, playas, snorkel' },
    { name: 'San Blas', lat: 9.4685, lon: -78.9559, type: 'town', pop: '30K', desc: 'Islas Guna Yala, cultura indígena' },
  ]},
  gt: { country: 'Guatemala', risk: 'bajo', cities: [
    { name: 'Antigua Guatemala', lat: 14.5586, lon: -90.7339, type: 'city', pop: '46K', desc: 'Colonial, arco de Santa Catalina, volcanes' },
    { name: 'Lago Atitlán', lat: 14.6869, lon: -91.2088, type: 'town', pop: '13K', desc: 'Lago volcánico, pueblos mayas' },
    { name: 'Tikal', lat: 17.2219, lon: -89.6236, type: 'town', pop: '100', desc: 'Ruinas mayas, selva tropical' },
    { name: 'Ciudad de Guatemala', lat: 14.6349, lon: -90.5069, type: 'city', pop: '1M', desc: 'Museo Popol Vuh, Zona Viva' },
  ]},
  uy: { country: 'Uruguay', risk: 'sin-riesgo', cities: [
    { name: 'Montevideo', lat: -34.9011, lon: -56.1645, type: 'city', pop: '1.4M', desc: 'Rambla, Ciudad Vieja, Mercado del Puerto' },
    { name: 'Punta del Este', lat: -34.9553, lon: -54.9448, type: 'city', pop: '14K', desc: 'Playas, casinos, La Mano' },
    { name: 'Colonia del Sacramento', lat: -34.463, lon: -57.8396, type: 'town', pop: '26K', desc: 'Casco histórico UNESCO, Barrio Histórico' },
  ]},
  py: { country: 'Paraguay', risk: 'bajo', cities: [
    { name: 'Asunción', lat: -25.2637, lon: -57.5759, type: 'city', pop: '520K', desc: 'Palacio de López, Panteón Nacional' },
    { name: 'Encarnación', lat: -27.333, lon: -55.8668, type: 'city', pop: '130K', desc: 'Carnaval, ruinas jesuíticas, costa Paraná' },
  ]},
  bo: { country: 'Bolivia', risk: 'bajo', cities: [
    { name: 'La Paz', lat: -16.5, lon: -68.15, type: 'city', pop: '750K', desc: 'Teleférico, Valle de la Luna, Illimani' },
    { name: 'Sucre', lat: -19.0333, lon: -65.2627, type: 'city', pop: '280K', desc: 'Ciudad blanca, universidad, dinosaurios' },
    { name: 'Uyuni', lat: -20.4608, lon: -66.8256, type: 'town', pop: '10K', desc: 'Salar, cementerio de trenes, isla Incahuasi' },
    { name: 'Potosí', lat: -19.5836, lon: -65.753, type: 'city', pop: '180K', desc: 'Cerro Rico, Casa de la Moneda' },
  ]},
  ve: { country: 'Venezuela', risk: 'alto', cities: [
    { name: 'Caracas', lat: 10.4806, lon: -66.9036, type: 'city', pop: '2.9M', desc: 'Monte Ávila, teleférico' },
    { name: 'Isla de Margarita', lat: 10.95, lon: -63.95, type: 'city', pop: '440K', desc: 'Playas, castillos, zona libre' },
    { name: 'Canaima', lat: 5.8589, lon: -62.5363, type: 'town', pop: '2K', desc: 'Salto Ángel, tepuyes, selva amazónica' },
  ]},
  // ASIA
  jp: { country: 'Japón', risk: 'sin-riesgo', cities: [
    { name: 'Tokio', lat: 35.6762, lon: 139.6503, type: 'city', pop: '14M', desc: 'Shibuya, Senso-ji, Akihabara, Tsukiji' },
    { name: 'Kioto', lat: 35.0116, lon: 135.7681, type: 'city', pop: '1.4M', desc: 'Templos, Fushimi Inari, Arashiyama' },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023, type: 'city', pop: '2.7M', desc: 'Dotonbori, castillo, takoyaki' },
    { name: 'Nara', lat: 34.6851, lon: 135.8048, type: 'city', pop: '350K', desc: 'Ciervos libres, Gran Buda, Todai-ji' },
    { name: 'Hiroshima', lat: 34.3853, lon: 133.2687, type: 'city', pop: '1.2M', desc: 'Peace Memorial, Miyajima, Itsukushima' },
    { name: 'Sapporo', lat: 43.0621, lon: 141.3544, type: 'city', pop: '2M', desc: 'Festival de nieve, cerveza, Hokkaido' },
  ]},
  kr: { country: 'Corea del Sur', risk: 'sin-riesgo', cities: [
    { name: 'Seúl', lat: 37.5665, lon: 126.978, type: 'city', pop: '9.7M', desc: 'Palacio Gyeongbok, Gangnam, Namsan' },
    { name: 'Busan', lat: 35.1796, lon: 129.0756, type: 'city', pop: '3.4M', desc: 'Playas, Jagalchi Fish Market, Gamcheon' },
    { name: 'Jeju', lat: 33.4996, lon: 126.5312, type: 'city', pop: '490K', desc: 'Isla volcánica, Hallasan, playas' },
  ]},
  th: { country: 'Tailandia', risk: 'bajo', cities: [
    { name: 'Bangkok', lat: 13.7563, lon: 100.5018, type: 'city', pop: '10M', desc: 'Grand Palace, Wat Pho, Khao San Road' },
    { name: 'Chiang Mai', lat: 18.7883, lon: 98.9853, type: 'city', pop: '130K', desc: 'Templos, santuarios elefantes, montañas' },
    { name: 'Phuket', lat: 7.8804, lon: 98.3923, type: 'city', pop: '420K', desc: 'Playas, Old Town, Phi Phi cerca' },
    { name: 'Ayutthaya', lat: 14.3517, lon: 100.5694, type: 'city', pop: '50K', desc: 'Ruinas históricas, patrimonio UNESCO' },
    { name: 'Krabi', lat: 8.0863, lon: 98.9063, type: 'city', pop: '32K', desc: 'Railay Beach, Phi Phi, acantilados' },
    { name: 'Pattaya', lat: 12.9236, lon: 100.8825, type: 'city', pop: '330K', desc: 'Playas, vida nocturna, islas Coral' },
  ]},
  in: { country: 'India', risk: 'bajo', cities: [
    { name: 'Delhi', lat: 28.6139, lon: 77.209, type: 'city', pop: '33M', desc: 'Qutub Minar, Jama Masjid, Chandni Chowk' },
    { name: 'Agra', lat: 27.1767, lon: 78.0081, type: 'city', pop: '1.7M', desc: 'Taj Mahal, Agra Fort, Fatehpur Sikri' },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873, type: 'city', pop: '3.1M', desc: 'Hawa Mahal, Amber Fort, ciudad rosa' },
    { name: 'Goa', lat: 15.2993, lon: 74.124, type: 'city', pop: '1.5M', desc: 'Playas, iglesias portuguesas, nightlife' },
    { name: 'Kerala (Kochi)', lat: 9.9312, lon: 76.2673, type: 'city', pop: '2.1M', desc: 'Backwaters, spices, Chinese fishing nets' },
    { name: 'Varanasi', lat: 25.3176, lon: 82.9739, type: 'city', pop: '1.2M', desc: 'Ganges, ghats, ciudad más antigua' },
  ]},
  vn: { country: 'Vietnam', risk: 'bajo', cities: [
    { name: 'Hanói', lat: 21.0278, lon: 105.8342, type: 'city', pop: '8M', desc: 'Old Quarter, Hoan Kiem, Templo de la Literatura' },
    { name: 'Ho Chi Minh', lat: 10.8231, lon: 106.6297, type: 'city', pop: '9M', desc: 'Ben Thanh Market, Cu Chi Tunnels' },
    { name: 'Hoi An', lat: 15.8801, lon: 108.338, type: 'town', pop: '120K', desc: 'Ciudad antigua, linternas, sastre' },
    { name: 'Ha Long Bay', lat: 20.9101, lon: 107.1839, type: 'town', pop: '8K', desc: 'Crucero entre islotes kársticos, UNESCO' },
  ]},
  id: { country: 'Indonesia', risk: 'bajo', cities: [
    { name: 'Bali (Denpasar)', lat: -8.4095, lon: 115.1889, type: 'city', pop: '890K', desc: 'Templos, arrozales, surf, Ubud' },
    { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695, type: 'city', pop: '400K', desc: 'Borobudur, Prambanan, arte javanés' },
    { name: 'Yakarta', lat: -6.2088, lon: 106.8456, type: 'city', pop: '10M', desc: 'Kota Tua, National Monument' },
    { name: 'Lombok', lat: -8.65, lon: 116.32, type: 'town', pop: '3M', desc: 'Monte Rinjani, playas vírgenes, Gili' },
  ]},
  ph: { country: 'Filipinas', risk: 'bajo', cities: [
    { name: 'Manila', lat: 14.5995, lon: 120.9842, type: 'city', pop: '1.8M', desc: 'Intramuros, Rizal Park, shopping' },
    { name: 'Cebú', lat: 10.3157, lon: 123.8854, type: 'city', pop: '920K', desc: 'Magellan\'s Cross, playas, sardine run' },
    { name: 'Palawan (Puerto Princesa)', lat: 9.7392, lon: 118.7353, type: 'city', pop: '310K', desc: 'Underground River, El Nido' },
    { name: 'Boracay', lat: 11.9674, lon: 121.9248, type: 'town', pop: '37K', desc: 'White Beach, atardeceres, snorkel' },
  ]},
  my: { country: 'Malasia', risk: 'bajo', cities: [
    { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869, type: 'city', pop: '1.8M', desc: 'Torres Petronas, Batu Caves, Jalan Alor' },
    { name: 'Penang (George Town)', lat: 5.4141, lon: 100.3288, type: 'city', pop: '710K', desc: 'Street art, hawker food, UNESCO' },
    { name: 'Langkawi', lat: 6.35, lon: 99.8, type: 'town', pop: '100K', desc: 'SkyBridge, playas, geopark' },
  ]},
  sg: { country: 'Singapur', risk: 'sin-riesgo', cities: [
    { name: 'Singapur', lat: 1.3521, lon: 103.8198, type: 'city', pop: '5.7M', desc: 'Marina Bay, Gardens by the Bay, hawker' },
    { name: 'Sentosa', lat: 1.2494, lon: 103.8303, type: 'town', pop: '1K', desc: 'Universal Studios, playas, resorts' },
  ]},
  kh: { country: 'Camboya', risk: 'medio', cities: [
    { name: 'Siem Reap', lat: 13.3671, lon: 103.8448, type: 'city', pop: '200K', desc: 'Angkor Wat, Ta Prohm, Pub Street' },
    { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282, type: 'city', pop: '1.6M', desc: 'Palacio Real, S-21, Riverside' },
    { name: 'Sihanoukville', lat: 10.6265, lon: 103.5217, type: 'city', pop: '100K', desc: 'Playas, islas Koh Rong' },
  ]},
  mm: { country: 'Myanmar', risk: 'medio', cities: [
    { name: 'Yangon', lat: 16.8661, lon: 96.1951, type: 'city', pop: '5.2M', desc: 'Shwedagon Pagoda, mercado Bogyoke' },
    { name: 'Bagan', lat: 21.1717, lon: 94.8576, type: 'town', pop: '27K', desc: 'Miles de templos, globos al amanecer' },
    { name: 'Mandalay', lat: 21.9588, lon: 96.0891, type: 'city', pop: '1.2M', desc: 'Palacio real, puente U Bein' },
  ]},
  lk: { country: 'Sri Lanka', risk: 'bajo', cities: [
    { name: 'Colombo', lat: 6.9271, lon: 79.8612, type: 'city', pop: '750K', desc: 'Galle Face, Gangaramaya, Pettah Market' },
    { name: 'Kandy', lat: 7.2906, lon: 80.6337, type: 'city', pop: '125K', desc: 'Templo del Diente, lago, jardines botánicos' },
    { name: 'Galle', lat: 6.0329, lon: 80.2168, type: 'city', pop: '100K', desc: 'Fuerte colonial UNESCO, playas' },
    { name: 'Sigiriya', lat: 7.9569, lon: 80.7607, type: 'town', pop: '5K', desc: 'Roca del León, frescos, espejos de agua' },
  ]},
  qa: { country: 'Catar', risk: 'bajo', cities: [
    { name: 'Doha', lat: 25.2854, lon: 51.531, type: 'city', pop: '950K', desc: 'Souq Waqif, Museo Nacional, Corniche' },
    { name: 'The Pearl', lat: 25.3815, lon: 51.5325, type: 'town', pop: '18K', desc: 'Isla artificial, restaurantes, marina' },
  ]},
  om: { country: 'Omán', risk: 'sin-riesgo', cities: [
    { name: 'Mascate', lat: 23.588, lon: 58.3829, type: 'city', pop: '1.6M', desc: 'Gran Mezquita, Mutrah Souq, palacio' },
    { name: 'Nizwa', lat: 22.9333, lon: 57.5333, type: 'city', pop: '87K', desc: 'Fortaleza, souq, Jebel Shams' },
    { name: 'Salalah', lat: 17.0151, lon: 54.0924, type: 'city', pop: '330K', desc: 'Monzón Khareef, frankincense, playas' },
  ]},
  tr: { country: 'Turquía', risk: 'bajo', cities: [
    { name: 'Estambul', lat: 41.0082, lon: 28.9784, type: 'city', pop: '15M', desc: 'Hagia Sophia, Mezquita Azul, Gran Bazar' },
    { name: 'Capadocia (Göreme)', lat: 38.6431, lon: 34.8289, type: 'town', pop: '2K', desc: 'Globos, ciudades subterráneas, iglesias rupestres' },
    { name: 'Éfeso', lat: 37.9411, lon: 27.3419, type: 'town', pop: '500', desc: 'Biblioteca de Celso, templo de Artemisa' },
    { name: 'Antalya', lat: 36.8969, lon: 30.7133, type: 'city', pop: '2.6M', desc: 'Riviera turca, cascadas, casco antiguo' },
    { name: 'Pamukkale', lat: 37.92, lon: 29.1211, type: 'town', pop: '3K', desc: 'Piscinas de travertino, Hierápolis' },
  ]},
  il: { country: 'Israel', risk: 'medio', cities: [
    { name: 'Jerusalén', lat: 31.7683, lon: 35.2137, type: 'city', pop: '940K', desc: 'Muro de los Lamentos, Monte del Templo' },
    { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, type: 'city', pop: '460K', desc: 'Playas, Bauhaus, vida nocturna' },
    { name: 'Haifa', lat: 32.794, lon: 34.9896, type: 'city', pop: '290K', desc: 'Jardines Bahá\'ís, Monte Carmelo' },
  ]},
  ae: { country: 'Emiratos Árabes', risk: 'bajo', cities: [
    { name: 'Dubái', lat: 25.2048, lon: 55.2708, type: 'city', pop: '3.5M', desc: 'Burj Khalifa, Palm Jumeirah, Dubai Mall' },
    { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, type: 'city', pop: '1.5M', desc: 'Gran Mezquita, Louvre, Ferrari World' },
    { name: 'Sharjah', lat: 25.3463, lon: 55.4209, type: 'city', pop: '1.4M', desc: 'Museos, cultura, UNESCO' },
  ]},
  sa: { country: 'Arabia Saudí', risk: 'medio', cities: [
    { name: 'Riad', lat: 24.7136, lon: 46.6753, type: 'city', pop: '7.7M', desc: 'Masmak Fortress, Kingdom Centre' },
    { name: 'Jeddah', lat: 21.5433, lon: 39.1728, type: 'city', pop: '4.7M', desc: 'Al-Balad (UNESCO), Mar Rojo, Corniche' },
    { name: 'AlUla', lat: 26.6171, lon: 37.9165, type: 'town', pop: '16K', desc: 'Hegra (Madain Saleh), Elephant Rock' },
  ]},
  jo: { country: 'Jordania', risk: 'medio', cities: [
    { name: 'Amán', lat: 31.9454, lon: 35.9284, type: 'city', pop: '4M', desc: 'Teatro romano, Citadel, Rainbow Street' },
    { name: 'Petra', lat: 30.3285, lon: 35.4444, type: 'town', pop: '6K', desc: 'Tesoro, Siq, Monasterio, 7 maravillas' },
    { name: 'Wadi Rum', lat: 29.575, lon: 35.4236, type: 'town', pop: '1K', desc: 'Desierto rojo, campamentos beduinos' },
    { name: 'Mar Muerto', lat: 31.5588, lon: 35.4745, type: 'town', pop: '500', desc: 'Flotar, lodos terapéuticos' },
  ]},
  np: { country: 'Nepal', risk: 'medio', cities: [
    { name: 'Katmandú', lat: 27.7172, lon: 85.324, type: 'city', pop: '1.5M', desc: 'Templos, Swayambhunath, Thamel' },
    { name: 'Pokhara', lat: 28.2096, lon: 83.9856, type: 'city', pop: '520K', desc: 'Lago Phewa, Himalaya, paragliding' },
    { name: 'Lukla', lat: 27.6869, lon: 86.7328, type: 'town', pop: '2K', desc: 'Puerta al Everest Base Camp' },
  ]},
  pk: { country: 'Pakistán', risk: 'medio', cities: [
    { name: 'Islamabad', lat: 33.6844, lon: 73.0479, type: 'city', pop: '1M', desc: 'Mezquita Faisal, Margalla Hills' },
    { name: 'Lahore', lat: 31.5204, lon: 74.3587, type: 'city', pop: '11M', desc: 'Mezquita Badshahi, Fort, Old City' },
    { name: 'Hunza', lat: 36.3167, lon: 74.6833, type: 'town', pop: '14K', desc: 'Valle, montañas, Rakaposhi' },
  ]},
  // ÁFRICA
  ma: { country: 'Marruecos', risk: 'bajo', cities: [
    { name: 'Marrakech', lat: 31.6295, lon: -7.9811, type: 'city', pop: '930K', desc: 'Jemaa el-Fnaa, zocos, jardines Majorelle' },
    { name: 'Fez', lat: 34.0181, lon: -5.0078, type: 'city', pop: '1.1M', desc: 'Medina UNESCO, Curtidurías, universidad' },
    { name: 'Chefchaouen', lat: 35.1716, lon: -5.2697, type: 'town', pop: '42K', desc: 'Ciudad azul, Rif, artesanía' },
    { name: 'Casablanca', lat: 33.5731, lon: -7.5898, type: 'city', pop: '3.7M', desc: 'Mezquita Hassan II, Corniche, Art Deco' },
    { name: 'Essaouira', lat: 31.5085, lon: -9.7595, type: 'city', pop: '78K', desc: 'Puerto fortificado, windsurf, gnawa' },
    { name: 'Sahara (Merzouga)', lat: 31.0801, lon: -4.0134, type: 'town', pop: '5K', desc: 'Dunas Erg Chebbi, campamentos beréberes' },
  ]},
  za: { country: 'Sudáfrica', risk: 'bajo', cities: [
    { name: 'Ciudad del Cabo', lat: -33.9249, lon: 18.4241, type: 'city', pop: '4.7M', desc: 'Table Mountain, Robben Island, V&A' },
    { name: 'Johannesburgo', lat: -26.2041, lon: 28.0473, type: 'city', pop: '5.6M', desc: 'Apartheid Museum, Soweto, Gold Reef' },
    { name: 'Kruger', lat: -23.9884, lon: 31.5547, type: 'town', pop: '10K', desc: 'Safari Big Five, parques nacionales' },
    { name: 'Durban', lat: -29.8587, lon: 31.0218, type: 'city', pop: '3.4M', desc: 'Playas, Golden Mile, cultura zulú' },
  ]},
  eg: { country: 'Egipto', risk: 'medio', cities: [
    { name: 'El Cairo', lat: 30.0444, lon: 31.2357, type: 'city', pop: '10M', desc: 'Pirámides de Giza, Museo Egipcio, Khan el-Khalili' },
    { name: 'Luxor', lat: 25.6872, lon: 32.6396, type: 'city', pop: '500K', desc: 'Valle de los Reyes, Karnak, Hatshepsut' },
    { name: 'Asuán', lat: 24.0889, lon: 32.8998, type: 'city', pop: '290K', desc: 'Templo de Philae, presa, crucero Nilo' },
    { name: 'Sharm el-Sheikh', lat: 27.9158, lon: 34.33, type: 'city', pop: '73K', desc: 'Buceo, Mar Rojo, Ras Mohammed' },
    { name: 'Alejandría', lat: 31.2001, lon: 29.9187, type: 'city', pop: '5.2M', desc: 'Biblioteca, Citadel, Corniche' },
  ]},
  tn: { country: 'Túnez', risk: 'sin-riesgo', cities: [
    { name: 'Túnez', lat: 36.8065, lon: 10.1815, type: 'city', pop: '2M', desc: 'Medina, Bardo, Souk' },
    { name: 'Cartago', lat: 36.853, lon: 10.3232, type: 'town', pop: '20K', desc: 'Ruinas romanas, Termas de Antonino' },
    { name: 'Sidi Bou Said', lat: 36.87, lon: 10.341, type: 'town', pop: '6K', desc: 'Pueblo azul y blanco, vistas mediterráneo' },
    { name: 'Djerba', lat: 33.8075, lon: 10.8451, type: 'city', pop: '170K', desc: 'Isla, playas, sinagoga Ghriba' },
  ]},
  ke: { country: 'Kenia', risk: 'bajo', cities: [
    { name: 'Nairobi', lat: -1.2921, lon: 36.8219, type: 'city', pop: '4.7M', desc: 'National Park, Karen Blixen Museum' },
    { name: 'Maasai Mara', lat: -1.5, lon: 35.0, type: 'town', pop: '100', desc: 'Gran migración, Big Five, savana' },
    { name: 'Mombasa', lat: -4.0435, lon: 39.6682, type: 'city', pop: '1.2M', desc: 'Old Town, Fort Jesus, playas' },
    { name: 'Amboseli', lat: -2.6527, lon: 37.2606, type: 'town', pop: '500', desc: 'Elefantes, Kilimanjaro de fondo' },
  ]},
  et: { country: 'Etiopía', risk: 'bajo', cities: [
    { name: 'Adís Abeba', lat: 9.0192, lon: 40.4729, type: 'city', pop: '5M', desc: 'Mercado Merkato, Museo Nacional, Lucy' },
    { name: 'Lalibela', lat: 12.0333, lon: 39.0472, type: 'town', pop: '15K', desc: 'Iglesias rupestres, Jerusalem africana' },
    { name: 'Gondar', lat: 12.6, lon: 37.4667, type: 'city', pop: '320K', desc: 'Camelot de África, castillos, parques' },
    { name: 'Danakil (Erta Ale)', lat: 13.6, lon: 40.675, type: 'town', pop: '500', desc: 'Volcán activo, depresión más caliente' },
  ]},
  ng: { country: 'Nigeria', risk: 'medio', cities: [
    { name: 'Lagos', lat: 6.5244, lon: 3.3792, type: 'city', pop: '15M', desc: 'Vida nocturna, playas, arte' },
    { name: 'Abuja', lat: 9.0579, lon: 7.4951, type: 'city', pop: '3M', desc: 'Capital, mezquita nacional, Aso Rock' },
  ]},
  gh: { country: 'Ghana', risk: 'bajo', cities: [
    { name: 'Acra', lat: 5.6037, lon: -0.187, type: 'city', pop: '2.3M', desc: 'Independence Square, Jamestown, Makola' },
    { name: 'Cape Coast', lat: 5.1053, lon: -1.2466, type: 'city', pop: '170K', desc: 'Castillo, Cape Coast College, Kakum cerca' },
    { name: 'Kumasi', lat: 6.6885, lon: -1.6244, type: 'city', pop: '2M', desc: 'Capital Ashanti, palacio real, mercado' },
  ]},
  dz: { country: 'Argelia', risk: 'medio', cities: [
    { name: 'Argel', lat: 36.7538, lon: 3.0588, type: 'city', pop: '3.5M', desc: 'Casbah (UNESCO), Notre Dame d\'Afrique' },
    { name: 'Orán', lat: 35.6969, lon: -0.6331, type: 'city', pop: '850K', desc: 'Santa Cruz, arquitectura francesa' },
    { name: 'Constantina', lat: 36.365, lon: 6.6147, type: 'city', pop: '500K', desc: 'Ciudad de los puentes, gorges' },
  ]},
  tz: { country: 'Tanzania', risk: 'bajo', cities: [
    { name: 'Zanzíbar', lat: -6.1659, lon: 39.2026, type: 'city', pop: '200K', desc: 'Stone Town, playas, especias' },
    { name: 'Serengeti', lat: -2.3333, lon: 34.8333, type: 'town', pop: '100', desc: 'Gran migración, Big Five, sabana' },
    { name: 'Kilimanjaro', lat: -3.0674, lon: 37.3556, type: 'town', pop: '200K', desc: 'Techo de África, trekking' },
  ]},
  rw: { country: 'Ruanda', risk: 'bajo', cities: [
    { name: 'Kigali', lat: -1.9403, lon: 29.8739, type: 'city', pop: '1.2M', desc: 'Ciudad más limpia de África, Memorial' },
    { name: 'Volcanoes NP', lat: -1.4674, lon: 29.5215, type: 'town', pop: '500', desc: 'Gorilas de montaña, trekking' },
    { name: 'Lake Kivu', lat: -2.45, lon: 29.15, type: 'town', pop: '15K', desc: 'Lago, playas, kayaking' },
  ]},
  // OCEANÍA
  au: { country: 'Australia', risk: 'sin-riesgo', cities: [
    { name: 'Sídney', lat: -33.8688, lon: 151.2093, type: 'city', pop: '5.3M', desc: 'Ópera, Harbour Bridge, Bondi Beach' },
    { name: 'Melbourne', lat: -37.8136, lon: 144.9631, type: 'city', pop: '5M', desc: 'Café, arte callejero, Great Ocean Road' },
    { name: 'Brisbane', lat: -27.4698, lon: 153.0251, type: 'city', pop: '2.6M', desc: 'South Bank, Gold Coast cerca' },
    { name: 'Perth', lat: -31.9505, lon: 115.8605, type: 'city', pop: '2M', desc: 'Kings Park, Rottnest Island, Swan Valley' },
    { name: 'Uluru', lat: -25.3444, lon: 131.0369, type: 'town', pop: '300', desc: 'Ayers Rock, sagrado aborigen, outback' },
  ]},
  nz: { country: 'Nueva Zelanda', risk: 'sin-riesgo', cities: [
    { name: 'Auckland', lat: -36.8485, lon: 174.7633, type: 'city', pop: '1.7M', desc: 'Sky Tower, islas volcánicas, veleros' },
    { name: 'Queenstown', lat: -45.0312, lon: 168.6626, type: 'city', pop: '28K', desc: 'Deportes extremos, Milford Sound, LOTR' },
    { name: 'Wellington', lat: -41.2865, lon: 174.7762, type: 'city', pop: '215K', desc: 'Capital, Te Papa, Weta Workshop' },
    { name: 'Rotorua', lat: -38.1368, lon: 176.2497, type: 'city', pop: '75K', desc: 'Geiseres, cultura maorí, aguas termales' },
  ]},
  fj: { country: 'Fiyi', risk: 'sin-riesgo', cities: [
    { name: 'Suva', lat: -18.1248, lon: 178.4501, type: 'city', pop: '94K', desc: 'Capital, mercados, museos' },
    { name: 'Nadi', lat: -17.7765, lon: 177.4162, type: 'city', pop: '42K', desc: 'Aeropuerto, playas, resorts, Coral Coast' },
  ]},
  // ORIENTE MEDIO
  lb: { country: 'Líbano', risk: 'medio', cities: [
    { name: 'Beirut', lat: 33.8938, lon: 35.5018, type: 'city', pop: '360K', desc: 'Mar Mikhael, ruinas romanas, gastronomía' },
    { name: 'Byblos', lat: 34.1211, lon: 35.6482, type: 'town', pop: '40K', desc: 'Ciudad habitada más antigua del mundo' },
    { name: 'Baños de Júpiter (Baalbek)', lat: 34.0058, lon: 36.2047, type: 'town', pop: '80K', desc: 'Templos romanos, patrimonio UNESCO' },
  ]},
};

function generateSQL() {
  let sql = '-- Seed data for places table (radius recommender)\n';
  sql += '-- Generated automatically from comprehensive city database\n';
  sql += `INSERT INTO places (name, type, country_code, country_name, lat, lon, description, risk_level, population) VALUES\n`;

  const rows = [];
  for (const [code, data] of Object.entries(CITIES)) {
    for (const city of data.cities) {
      const escapedName = city.name.replace(/'/g, "''");
      const escapedDesc = city.desc ? city.desc.replace(/'/g, "''") : '';
      const escapedCountry = data.country.replace(/'/g, "''");
      rows.push(`('${escapedName}', '${city.type}', '${code}', '${escapedCountry}', ${city.lat}, ${city.lon}, '${escapedDesc}', '${data.risk}', '${city.pop || ''}')`);
    }
  }

  sql += rows.join(',\n') + ';\n';
  return sql;
}

console.log(generateSQL());
