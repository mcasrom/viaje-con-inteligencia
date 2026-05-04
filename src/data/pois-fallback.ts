export interface PoiFallback {
  name: string;
  description: string;
  lat: number;
  lon: number;
  image?: string;
}

const FALLBACK_POIS: Record<string, Record<string, PoiFallback[]>> = {
  beach: {
    es: [
      { name: 'Playa de La Concha', description: 'Famosa playa urbana en San Sebastián', lat: 43.3213, lon: -2.0037, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Playa_de_la_Concha%2C_San_Sebasti%C3%A1n%2C_Espa%C3%B1a%2C_2019-08-02%2C_DD_23.jpg/800px-Playa_de_la_Concha%2C_San_Sebasti%C3%A1n%2C_Espa%C3%B1a%2C_2019-08-02%2C_DD_23.jpg' },
      { name: 'Playa de Maspalomas', description: 'Extensa playa de dunas en Gran Canaria', lat: 27.7619, lon: -15.5776 },
      { name: 'Playa de Ses Illetes', description: 'Aguas cristalinas en Formentera', lat: 38.7145, lon: 1.4219 },
      { name: 'Playa del Silencio', description: 'Recóndita cala en Asturias', lat: 43.5542, lon: -6.5056 },
      { name: 'Playa de Rodas', description: 'Una de las más bellas de las Islas Cíes', lat: 42.2643, lon: -8.8777 },
      { name: 'Playa de Bolnuevo', description: 'Formaciones rocosas en Mazarrón', lat: 37.5767, lon: -1.3028 },
      { name: 'Playa de la Barrosa', description: 'Amplia playa en Chiclana, Cádiz', lat: 36.4507, lon: -6.1958 },
    ],
    fr: [
      { name: 'Plage de Deauville', description: 'Elegante playa en Normandía', lat: 49.3638, lon: 0.0794 },
      { name: 'Plage de Palombaggia', description: 'Playa de arena blanca en Córcega', lat: 41.5496, lon: 9.3091 },
      { name: 'Plage de la Côte des Basques', description: 'Playa icónica de surf en Biarritz', lat: 43.4778, lon: -1.5625 },
      { name: 'Plage du Sillon', description: 'Larga playa de arena en Saint-Malo', lat: 48.6494, lon: -2.0214 },
      { name: 'Plage de Pampelonne', description: 'Famosa playa en Saint-Tropez', lat: 43.2258, lon: 6.6907 },
    ],
    it: [
      { name: 'Spiaggia di San Vito Lo Capo', description: 'Playa de aguas turquesas en Sicilia', lat: 38.1737, lon: 12.7374 },
      { name: 'Spiaggia di Tropea', description: 'Costa espectacular en Calabria', lat: 38.6767, lon: 15.8996 },
      { name: 'Spiaggia di Mondello', description: 'Playa emblemática cerca de Palermo', lat: 38.2165, lon: 13.3294 },
      { name: 'Cala Luna', description: 'Calas en el Golfo de Orosei, Cerdeña', lat: 40.3319, lon: 9.5816 },
      { name: 'Spiaggia del Principe', description: 'Playa prístina en Cerdeña', lat: 41.1539, lon: 8.6847 },
    ],
    pt: [
      { name: 'Praia da Marinha', description: 'Acantilados y formaciones rocosas en el Algarve', lat: 37.0895, lon: -8.4109 },
      { name: 'Praia do Camilo', description: 'Playa con arcos naturales en Lagos', lat: 37.0806, lon: -8.6724 },
      { name: 'Praia de Benagil', description: 'Famosa cueva marina en el Algarve', lat: 37.0883, lon: -8.4181 },
      { name: 'Praia do Guincho', description: 'Playa salvaje cerca de Cascais', lat: 38.7338, lon: -9.4725 },
      { name: 'Praia do Baleal', description: 'Playa de surf en Peniche', lat: 39.3663, lon: -9.3447 },
    ],
    gb: [
      { name: 'Porthcurno Beach', description: 'Playa de arena dorada en Cornualles', lat: 50.0585, lon: -5.6306 },
      { name: 'Rhossili Bay', description: 'Una de las mejores playas de Gales', lat: 51.5653, lon: -4.3057 },
      { name: 'Woolacombe Beach', description: 'Playa de surf en Devon', lat: 51.1575, lon: -4.2194 },
      { name: 'Luskentyre Beach', description: 'Aguas cristalinas en Harris, Escocia', lat: 57.8212, lon: -6.9768 },
      { name: 'Whitesands Beach', description: 'Playa en Pembrokeshire, Gales', lat: 51.9068, lon: -5.2771 },
    ],
    gr: [
      { name: 'Navagio Beach', description: 'Playa del naufragio en Zakynthos', lat: 37.8589, lon: 20.6234 },
      { name: 'Balos Beach', description: 'Playa paradisíaca en Creta', lat: 35.5841, lon: 23.5854 },
      { name: 'Myrtos Beach', description: 'Espectacular playa en Cefalonia', lat: 38.3458, lon: 20.5066 },
      { name: 'Porto Katsiki', description: 'Acantilados en Lefkada', lat: 38.5787, lon: 20.3326 },
      { name: 'Elafonisi Beach', description: 'Playa de arena rosa en Creta', lat: 35.2717, lon: 23.5417 },
    ],
    jp: [
      { name: 'Playa de Okinawa', description: 'Playa de aguas cristalinas en el archipiélago', lat: 26.3344, lon: 127.8056 },
      { name: 'Sunset Beach Miyakojima', description: 'Atardeceres espectaculares', lat: 24.8103, lon: 125.2829 },
      { name: 'Zamami Beach', description: 'Aguas transparentes en las islas Kerama', lat: 26.1778, lon: 127.2729 },
      { name: 'Kondoi Beach', description: 'Playa en la isla de Taketomi', lat: 24.3607, lon: 124.0456 },
    ],
    mx: [
      { name: 'Playa Delfines', description: 'Playa emblemática en Cancún', lat: 21.0547, lon: -86.7868 },
      { name: 'Playa Norte', description: 'Aguas tranquilas en Isla Mujeres', lat: 21.2567, lon: -86.7369 },
      { name: 'Playa del Amor', description: 'Romántica playa en las Islas Marietas', lat: 20.5342, lon: -105.5384 },
      { name: 'Playa de los Muertos', description: 'Vibrante playa en Puerto Vallarta', lat: 20.6038, lon: -105.2329 },
      { name: 'Playa Escondida', description: 'Playa secreta en Riviera Maya', lat: 20.4278, lon: -87.3021 },
    ],
    us: [
      { name: 'South Beach', description: 'Icónica playa en Miami Beach', lat: 25.7826, lon: -80.1341 },
      { name: 'Waikiki Beach', description: 'Famosa playa en Honolulu, Hawái', lat: 21.2793, lon: -157.8293 },
      { name: 'Laguna Beach', description: 'Calas de arena en California', lat: 33.5427, lon: -117.7854 },
      { name: 'Clearwater Beach', description: 'Arena blanca en Florida', lat: 27.9784, lon: -82.8315 },
      { name: 'Cannon Beach', description: 'Monolito Haystack Rock en Oregón', lat: 45.8918, lon: -123.9615 },
    ],
    th: [
      { name: 'Playa de Maya Bay', description: 'Famosa por la película "La Playa"', lat: 7.6765, lon: 98.7665 },
      { name: 'Railay Beach', description: 'Espectaculares acantilados de caliza en Krabi', lat: 8.0115, lon: 98.8389 },
      { name: 'Patong Beach', description: 'La playa más vibrante de Phuket', lat: 7.8969, lon: 98.2946 },
      { name: 'White Beach (Koh Samui)', description: 'Arena blanca en el Golfo de Tailandia', lat: 9.4519, lon: 100.0483 },
      { name: 'Sunrise Beach', description: 'Amaneceres en Koh Lipe', lat: 6.4881, lon: 99.2973 },
    ],
  },
  lighthouse: {
    es: [
      { name: 'Faro de Cabo de Gata', description: 'Faro en el parque natural de Almería', lat: 36.6625, lon: -2.0231 },
      { name: 'Faro de Finisterre', description: 'Faro histórico en el fin del mundo', lat: 42.9078, lon: -9.2706 },
      { name: 'Faro de Cabo Creus', description: 'Punta más oriental de la Península Ibérica', lat: 42.3236, lon: 3.3143 },
      { name: 'Faro de Punta de Tarifa', description: 'Punto más meridional de Europa continental', lat: 36.0006, lon: -5.6025 },
      { name: 'Faro de Mouro', description: 'Faro en la entrada de la bahía de Santander', lat: 43.4648, lon: -3.8031 },
      { name: 'Faro de Punta del Hidalgo', description: 'Faro en el norte de Tenerife', lat: 28.5209, lon: -16.3028 },
    ],
    fr: [
      { name: 'Phare de Cordouan', description: 'El más antiguo de Francia, siglo XVII', lat: 45.5867, lon: -1.1728 },
      { name: 'Phare de Gatteville', description: 'Uno de los más altos de Europa en Normandía', lat: 49.7347, lon: -1.7768 },
      { name: 'Phare de Biarritz', description: 'Faro icónico en la costa vasca', lat: 43.4833, lon: -1.5581 },
      { name: 'Phare des Baleines', description: 'Faro en la Île de Ré', lat: 46.2078, lon: -1.4158 },
      { name: 'Phare de l\'Île Vierge', description: 'Faro más alto de Europa en Finistère', lat: 48.6631, lon: -4.6069 },
    ],
    it: [
      { name: 'Faro di Punta Palascia', description: 'Punto más oriental de Italia, Puglia', lat: 40.1456, lon: 18.5197 },
      { name: 'Faro di Livorno', description: 'Faro histórico en la Toscana', lat: 43.5294, lon: 10.2908 },
      { name: 'Faro della Vittoria', description: 'Faro memorial en Messina', lat: 38.2003, lon: 15.5653 },
      { name: 'Fanale di Punta Carena', description: 'Faro en la costa de Capri', lat: 40.5328, lon: 14.2081 },
    ],
    pt: [
      { name: 'Farol do Cabo da Roca', description: 'Faro en el punto más occidental de Europa', lat: 38.7803, lon: -9.4983 },
      { name: 'Farol de Santa Marta', description: 'Faro en Cascais', lat: 38.6983, lon: -9.4208 },
      { name: 'Farol do Cabo de São Vicente', description: 'Faro en el suroeste del Algarve', lat: 37.0347, lon: -8.9797 },
      { name: 'Farol da Ponta do Pargo', description: 'Faro en la isla de Madeira', lat: 32.7717, lon: -17.2644 },
    ],
    gb: [
      { name: 'Bell Rock Lighthouse', description: 'Faro marítimo más antiguo en Escocia', lat: 56.4408, lon: -2.4081 },
      { name: 'Eddystone Lighthouse', description: 'Icónico faro en Plymouth Sound', lat: 50.1864, lon: -4.2631 },
      { name: 'Start Point Lighthouse', description: 'Faro en Devon', lat: 50.2147, lon: -3.6961 },
      { name: 'South Foreland Lighthouse', description: 'Faro en Dover', lat: 51.1118, lon: 1.3919 },
    ],
    jp: [
      { name: 'Faro de Kannon-zaki', description: 'Faro occidental en la península de Miura', lat: 35.1372, lon: 139.6383 },
      { name: 'Faro de Tsunoshima', description: 'Faro pintoresco en Yamaguchi', lat: 34.3964, lon: 131.0114 },
      { name: 'Faro de Inubō-zaki', description: 'Faro en la costa de Chiba', lat: 35.7219, lon: 140.8539 },
    ],
    us: [
      { name: 'Cape Hatteras Lighthouse', description: 'Faro más alto de Estados Unidos', lat: 35.2417, lon: -75.5247 },
      { name: 'Portland Head Light', description: 'Faro icónico en Maine', lat: 43.6233, lon: -70.2078 },
      { name: 'Pigeon Point Light', description: 'Faro en la costa de California', lat: 37.1742, lon: -122.3967 },
      { name: 'Split Rock Lighthouse', description: 'Faro en las costas del Lago Superior', lat: 47.2307, lon: -91.4503 },
    ],
    mx: [
      { name: 'Faro de Punta Celis', description: 'Faro en la costa de Baja California', lat: 31.5342, lon: -116.7119 },
      { name: 'Faro de Cancún', description: 'Faro en la zona hotelera', lat: 21.1214, lon: -86.7578 },
      { name: 'Faro de Tuxpan', description: 'Faro en Veracruz', lat: 21.0025, lon: -97.3094 },
    ],
  },
  nature: {
    es: [
      { name: 'Parque Nacional del Teide', description: 'Volcán más alto de España en Tenerife', lat: 28.2722, lon: -16.6414, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/El_Teide%2C_Tenerife%2C_Spain%2C_2023-03-11%2C_DD_06.jpg/800px-El_Teide%2C_Tenerife%2C_Spain%2C_2023-03-11%2C_DD_06.jpg' },
      { name: 'Aigüestortes', description: 'Lagos de montaña en los Pirineos', lat: 42.5647, lon: 0.9722 },
      { name: 'Parque Nacional de Ordesa', description: 'Cañones y cascadas en el Pirineo aragonés', lat: 42.6147, lon: 0.0347 },
      { name: 'Picos de Europa', description: 'Macizo montañoso en Asturias, Cantabria y León', lat: 43.1903, lon: -4.8603 },
      { name: 'Parque Nacional de Cabañeros', description: 'Bosque mediterráneo en Ciudad Real', lat: 39.4172, lon: -4.4619 },
      { name: 'Doñana', description: 'Reserva de humedales en Huelva', lat: 36.9222, lon: -6.4436 },
    ],
    fr: [
      { name: 'Parc National du Mercantour', description: 'Parque alpino entre Niza y Cuneo', lat: 44.1667, lon: 7.1667 },
      { name: 'Parc National des Écrins', description: 'Alpes del Dauphiné', lat: 44.8500, lon: 6.2000 },
      { name: 'Parc National des Calanques', description: 'Calas entre Marsella y Cassis', lat: 43.2269, lon: 5.4344 },
      { name: 'Forêt de Brocéliande', description: 'Bosque legendario en Bretaña', lat: 48.1364, lon: -2.1969 },
      { name: 'Parc National de la Vanoise', description: 'Primer parque nacional de Francia', lat: 45.3500, lon: 6.8500 },
    ],
    de: [
      { name: 'Bosque Negro', description: 'Masa forestal en Baden-Württemberg', lat: 48.0000, lon: 8.2000 },
      { name: 'Parque Nacional de Sächsische Schweiz', description: 'Formaciones rocosas en Sajonia', lat: 50.9167, lon: 14.1667 },
      { name: 'Parque Nacional de Berchtesgaden', description: 'Alpes bávaros', lat: 47.5833, lon: 13.0000 },
      { name: 'Lago de Königssee', description: 'Lago alpino en Baviera', lat: 47.5572, lon: 12.9583 },
      { name: 'Selva de Turingia', description: 'Bosque en el centro de Alemania', lat: 50.7000, lon: 10.8000 },
    ],
    it: [
      { name: 'Parque Nacional del Gran Paraíso', description: 'Primer parque nacional italiano', lat: 45.5833, lon: 7.3167 },
      { name: 'Cinque Terre', description: 'Costa escarpada de Liguria', lat: 44.1500, lon: 9.7000 },
      { name: 'Lago de Braies', description: 'Lago alpino en las Dolomitas', lat: 46.7008, lon: 12.0692 },
      { name: 'Parque Nacional del Circeo', description: 'Reserva costera en el Lacio', lat: 41.2667, lon: 13.0833 },
      { name: 'Etna', description: 'Volcán activo más alto de Europa', lat: 37.7511, lon: 14.9936 },
    ],
    pt: [
      { name: 'Parque Nacional da Peneda-Gerês', description: 'Único parque nacional de Portugal', lat: 41.8333, lon: -8.1667 },
      { name: 'Ria de Aveiro', description: 'Laguna costera', lat: 40.6443, lon: -8.6456 },
      { name: 'Paisaje Volcánico de la Isla de Pico', description: 'Volcán en las Azores', lat: 38.4667, lon: -28.3167 },
      { name: 'Parque Natural de la Arrábida', description: 'Península con flora mediterránea', lat: 38.4667, lon: -8.9333 },
    ],
    gb: [
      { name: 'Lake District', description: 'Parque Nacional con lagos y montañas', lat: 54.4500, lon: -3.1000 },
      { name: 'Peak District', description: 'Primer parque nacional del mundo', lat: 53.2000, lon: -1.7500 },
      { name: 'Giant\'s Causeway', description: 'Columnas basálticas en Irlanda del Norte', lat: 55.2408, lon: -6.5116 },
      { name: 'Scottish Highlands', description: 'Tierras altas de Escocia', lat: 57.4778, lon: -4.2247 },
      { name: 'Snowdonia', description: 'Montañas en Gales', lat: 53.0000, lon: -4.0000 },
    ],
    gr: [
      { name: 'Monte Olimpo', description: 'La montaña de los dioses griegos', lat: 40.0772, lon: 22.3581 },
      { name: 'Samariá Gorge', description: 'Cañón en Creta', lat: 35.3000, lon: 23.9833 },
      { name: 'Lagos de Prespa', description: 'Lagos de frontera en Macedonia', lat: 40.7167, lon: 21.1333 },
      { name: 'Parque Nacional de Vikos-Aoös', description: 'Cañones en Epiro', lat: 40.0500, lon: 20.5333 },
    ],
    jp: [
      { name: 'Monte Fuji', description: 'El monte sagrado de Japón', lat: 35.3606, lon: 138.7274, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FujiSunriseKawaguchiko2025.jpg/800px-FujiSunriseKawaguchiko2025.jpg' },
      { name: 'Bosque de Aokigahara', description: 'Bosque al pie del Monte Fuji', lat: 35.4878, lon: 138.6106 },
      { name: 'Parque Nacional de Fuji-Hakone-Izu', description: 'Volcanes, lagos y aguas termales', lat: 35.3167, lon: 139.0167 },
      { name: 'Parque Nacional de Yakushima', description: 'Bosque de cedros milenarios', lat: 30.4000, lon: 130.5000 },
    ],
    us: [
      { name: 'Gran Cañón', description: 'Inmenso cañón en Arizona', lat: 36.1069, lon: -112.1129, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/A_Branch_of_the_Canyon%2C_Grand_Canyon%2C_2010.jpg/800px-A_Branch_of_the_Canyon%2C_Grand_Canyon%2C_2010.jpg' },
      { name: 'Parque Nacional de Yellowstone', description: 'Geysers y vida salvaje', lat: 44.4280, lon: -110.5885 },
      { name: 'Yosemite', description: 'Cascadas y secuoyas en California', lat: 37.8651, lon: -119.5383 },
      { name: 'Parque Nacional de las Secuoyas', description: 'Los árboles más grandes del mundo', lat: 36.4864, lon: -118.5658 },
      { name: 'Glacier National Park', description: 'Montañas y lagos en Montana', lat: 48.7596, lon: -113.7870 },
    ],
    mx: [
      { name: 'Sian Ka\'an', description: 'Reserva de la biosfera en Quintana Roo', lat: 19.6000, lon: -87.8000 },
      { name: 'Barranca del Cobre', description: 'Red de cañones en Chihuahua', lat: 27.5667, lon: -107.4167 },
      { name: 'Reserva de la Biósfera de Calakmul', description: 'Selva maya en Campeche', lat: 18.2167, lon: -89.5333 },
      { name: 'Cenote Ik Kil', description: 'Cenote en la Península de Yucatán', lat: 20.6783, lon: -88.1956 },
    ],
    th: [
      { name: 'Khao Sok National Park', description: 'Selva tropical en el sur de Tailandia', lat: 8.9167, lon: 98.5333 },
      { name: 'Khao Yai National Park', description: 'Selva y cascadas al noreste de Bangkok', lat: 14.4167, lon: 101.3667 },
      { name: 'Islas Similan', description: 'Archipiélago en el mar de Andamán', lat: 8.6500, lon: 97.6333 },
      { name: 'Doi Inthanon', description: 'El punto más alto de Tailandia', lat: 18.5833, lon: 98.4833 },
    ],
  },
};

export function getPoiFallback(country: string, type: string, limit: number): PoiFallback[] {
  const typeData = FALLBACK_POIS[type];
  if (!typeData) return [];
  const countryData = typeData[country.toLowerCase()];
  if (!countryData) return [];
  return countryData.slice(0, limit);
}

export function getAvailableFallbackCountries(type: string): string[] {
  const typeData = FALLBACK_POIS[type];
  if (!typeData) return [];
  return Object.keys(typeData);
}
