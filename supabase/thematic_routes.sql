CREATE TABLE IF NOT EXISTS thematic_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cultural', 'costero', 'interior')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'moderado', 'dificil')),
  total_distance INTEGER NOT NULL,
  total_driving_time NUMERIC(5,1) NOT NULL,
  data JSONB NOT NULL,
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wine_seasons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  months TEXT[] NOT NULL,
  crowd_level TEXT NOT NULL CHECK (crowd_level IN ('bajo', 'medio', 'alto')),
  price_multiplier NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  notes TEXT
);

INSERT INTO wine_seasons (name, months, crowd_level, price_multiplier, notes)
SELECT name, months, crowd_level, price_multiplier, notes
FROM (
  VALUES
    ('Vendimia', ARRAY['Septiembre', 'Octubre'], 'alto', 1.3, 'Actividades de vendimia, experiencia autentica'),
    ('Invierno', ARRAY['Diciembre', 'Enero', 'Febrero'], 'bajo', 0.8, 'Bodegas tranquilas, mejores precios'),
    ('Primavera', ARRAY['Marzo', 'Abril', 'Mayo'], 'medio', 1.0, 'Tiempo moderado, paisajes verdes'),
    ('Verano', ARRAY['Junio', 'Julio', 'Agosto'], 'alto', 1.2, 'Catas al aire libre, temperaturas altas')
) AS t(name, months, crowd_level, price_multiplier, notes)
WHERE NOT EXISTS (SELECT 1 FROM wine_seasons);

INSERT INTO thematic_routes (id, name, short_name, category, difficulty, total_distance, total_driving_time, data)
SELECT 'molinos', 'Ruta de los Molinos de La Mancha', 'Ruta Molinos', 'cultural', 'facil', 450, 8, jsonb_build_object(
  'description', 'Itinerario por los molinos de viento mas emblematicos de La Mancha, desde Alcala de Henares hasta Albacete',
  'image', '/images/rutas/molinos-la-mancha.jpg',
  'region', 'nacional',
  'bestSeason', jsonb_build_array('Abril', 'Mayo', 'Septiembre', 'Octubre'),
  'roadType', 'mixto',
  'avgDailyCost', jsonb_build_object('bajo', 80, 'medio', 150, 'alto', 300),
  'mlFeatures', jsonb_build_object('popularityScore', 7.5, 'safetyScore', 9.5, 'valueScore', 8.5),
  'segments', jsonb_build_array(
    jsonb_build_object('id', 1, 'name', 'Madrid - Mota del Cuervo', 'from', 'Madrid', 'to', 'Mota del Cuervo', 'distance', 180, 'drivingTime', 2, 'locations', jsonb_build_array('Alcala de Henares', 'Alcala de Chivert', 'Mota del Cuervo')),
    jsonb_build_object('id', 2, 'name', 'Mota del Cuervo - Campo de Criptana', 'from', 'Mota del Cuervo', 'to', 'Campo de Criptana', 'distance', 55, 'drivingTime', 1, 'locations', jsonb_build_array('Mota del Cuervo', 'Campo de Criptana')),
    jsonb_build_object('id', 3, 'name', 'Campo de Criptana - Consuegra', 'from', 'Campo de Criptana', 'to', 'Consuegra', 'distance', 70, 'drivingTime', 1.5, 'locations', jsonb_build_array('Campo de Criptana', 'Consuegra')),
    jsonb_build_object('id', 4, 'name', 'Consuegra - Almagro', 'from', 'Consuegra', 'to', 'Almagro', 'distance', 80, 'drivingTime', 1.5, 'locations', jsonb_build_array('Consuegra', 'Almagro')),
    jsonb_build_object('id', 5, 'name', 'Almagro - Cuenca', 'from', 'Almagro', 'to', 'Cuenca', 'distance', 90, 'drivingTime', 1.5, 'locations', jsonb_build_array('Almagro', 'Cuenca')),
    jsonb_build_object('id', 6, 'name', 'Cuenca - Albacete', 'from', 'Cuenca', 'to', 'Albacete', 'distance', 120, 'drivingTime', 2, 'locations', jsonb_build_array('Cuenca', 'Albacete'))
  ),
  'locations', jsonb_build_array(
    jsonb_build_object('name', 'Alcala de Henares', 'province', 'Madrid', 'region', 'Comunidad de Madrid', 'coordinates', jsonb_build_array(40.4828, -3.3644), 'description', 'Ciudad cervantina con importante patrimonio histórico', 'highlights', jsonb_build_array('Casa de Cervantes', 'Centro histórico', 'Universidad'), 'visitTime', 2),
    jsonb_build_object('name', 'Alcala de Chivert', 'province', 'Albacete', 'region', 'Castilla-La Mancha', 'coordinates', jsonb_build_array(39.2667, -1.8833), 'description', 'Municipio de La Mancha con molinos históricos', 'highlights', jsonb_build_array('Molinos de viento', 'Paraje natural', 'Vistas panorámicas'), 'visitTime', 3)
  )
)
WHERE NOT EXISTS (SELECT 1 FROM thematic_routes WHERE id = 'molinos');

INSERT INTO thematic_routes (id, name, short_name, category, difficulty, total_distance, total_driving_time, data)
SELECT 'faros', 'Ruta de los Faros de España', 'Ruta Faros', 'costero', 'moderado', 2100, 30, jsonb_build_object(
  'description', 'Recorre la costa española desur a norte visitando los faros mas emblemáticos, desde Huelva hasta Gerona',
  'image', '/images/rutas/faros-espana.jpg',
  'region', 'nacional',
  'bestSeason', jsonb_build_array('Mayo', 'Junio', 'Septiembre', 'Octubre'),
  'roadType', 'autovia',
  'avgDailyCost', jsonb_build_object('bajo', 90, 'medio', 180, 'alto', 400),
  'mlFeatures', jsonb_build_object('popularityScore', 8.5, 'safetyScore', 9.0, 'valueScore', 7.0),
  'segments', jsonb_build_array(
    jsonb_build_object('id', 1, 'name', 'Huelva - Cadiz', 'from', 'Huelva', 'to', 'Cadiz', 'distance', 240, 'drivingTime', 3, 'locations', jsonb_build_array('Faro de Puntaumbria')),
    jsonb_build_object('id', 2, 'name', 'Cadiz - Malaga', 'from', 'Cadiz', 'to', 'Malaga', 'distance', 260, 'drivingTime', 3, 'locations', jsonb_build_array('Faro de Trafalgar', 'Faro de Tarifa')),
    jsonb_build_object('id', 3, 'name', 'Malaga - Almeria', 'from', 'Malaga', 'to', 'Almeria', 'distance', 280, 'drivingTime', 3, 'locations', jsonb_build_array('Faro de Malaga', 'Faro de Almeria')),
    jsonb_build_object('id', 4, 'name', 'Almeria - Valencia', 'from', 'Almeria', 'to', 'Valencia', 'distance', 450, 'drivingTime', 5, 'locations', jsonb_build_array('Faro de Cabo de Gata', 'Faro de Valencia')),
    jsonb_build_object('id', 5, 'name', 'Valencia - Castellon', 'from', 'Valencia', 'to', 'Castellon', 'distance', 160, 'drivingTime', 2, 'locations', jsonb_build_array('Faro de Oropesa', 'Faro de Vinaros')),
    jsonb_build_object('id', 6, 'name', 'Castellon - Tarragona', 'from', 'Castellon', 'to', 'Tarragona', 'distance', 180, 'drivingTime', 2.5, 'locations', jsonb_build_array('Faro de Vinaros', 'Faro de Tarragona')),
    jsonb_build_object('id', 7, 'name', 'Tarragona - Gerona', 'from', 'Tarragona', 'to', 'Gerona', 'distance', 280, 'drivingTime', 3.5, 'locations', jsonb_build_array('Faro de Barcelona', 'Faro de Cap de Creus', 'Faro de Begur'))
  ),
  'locations', jsonb_build_array(
    jsonb_build_object('name', 'Faro de Puntaumbria', 'province', 'Huelva', 'region', 'Andalucia', 'coordinates', jsonb_build_array(37.2227, -6.9284), 'description', 'Faro en el limite de Castilla', 'highlights', jsonb_build_array('Playa Puntaumbria', 'Paraje natural', 'Atardeceres'), 'visitTime', 2),
    jsonb_build_object('name', 'Faro de Trafalgar', 'province', 'Cadiz', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.1858, -6.0346), 'description', 'Faro cerca de la batalla de Trafalgar', 'highlights', jsonb_build_array('Playa de Zahora', 'Torre de Trafalgar', 'Gastronomía'), 'visitTime', 2),
    jsonb_build_object('name', 'Faro de Tarifa', 'province', 'Cadiz', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.0142, -5.6061), 'description', 'Punto mas al sur de peninsula', 'highlights', jsonb_build_array('Mirador del Estrecho', 'Kitesurf', 'Isla de las Palomas'), 'visitTime', 4),
    jsonb_build_object('name', 'Faro de Malaga', 'province', 'Malaga', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.6893, -4.4266), 'description', 'Faro en la ciudad de Malaga', 'highlights', jsonb_build_array('Alcazaba', 'Muelle Uno', 'Museo Picasso'), 'visitTime', 3),
    jsonb_build_object('name', 'Faro de Almeria', 'province', 'Almeria', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.8343, -2.4633), 'description', 'Faro en el Cabo de Gata', 'highlights', jsonb_build_array('Cabo de Gata', 'Playa de los Muertos', 'Desierto'), 'visitTime', 3),
    jsonb_build_object('name', 'Faro de Cabo de Gata', 'province', 'Almeria', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.7208, -2.1138), 'description', 'Faro en elparque natural', 'highlights', jsonb_build_array('Parque Natural', 'Playas virgenes', 'Fauna marina'), 'visitTime', 4),
    jsonb_build_object('name', 'Faro de Valencia', 'province', 'Valencia', 'region', 'Comunidad Valenciana', 'coordinates', jsonb_build_array(39.4438, -0.3133), 'description', 'Faro en la ciudad de Valencia', 'highlights', jsonb_build_array('Ciudad de las Artes', 'Playa de la Malvarrosa', 'Historic center'), 'visitTime', 3),
    jsonb_build_object('name', 'Faro de Oropesa', 'province', 'Castellon', 'region', 'Comunidad Valenciana', 'coordinates', jsonb_build_array(40.0921, 0.1313), 'description', 'Faro en la Costa de Azahar', 'highlights', jsonb_build_array('Playa de Oropesa', 'Castillo', 'Palmeral'), 'visitTime', 2),
    jsonb_build_object('name', 'Faro de Vinaros', 'province', 'Castellon', 'region', 'Comunidad Valenciana', 'coordinates', jsonb_build_array(40.4706, 0.4751), 'description', 'Faro en el limite con Tarragona', 'highlights', jsonb_build_array('Puerto', 'Playa del Fortin', 'Gastronomia'), 'visitTime', 2),
    jsonb_build_object('name', 'Faro de Tarragona', 'province', 'Tarragona', 'region', 'Cataluna', 'coordinates', jsonb_build_array(41.1147, 1.2589), 'description', 'Faro en la ciudad romana', 'highlights', jsonb_build_array('Anfiteatro', 'Catedral', 'Casco antiguo'), 'visitTime', 3),
    jsonb_build_object('name', 'Faro de Barcelona', 'province', 'Barcelona', 'region', 'Cataluna', 'coordinates', jsonb_build_array(41.3687, 2.1949), 'description', 'Faro en Montjuic', 'highlights', jsonb_build_array('Sagrada Familia', 'Park Guell', 'Barrio Gotico'), 'visitTime', 4),
    jsonb_build_object('name', 'Faro de Cap de Creus', 'province', 'Girona', 'region', 'Cataluna', 'coordinates', jsonb_build_array(42.3257, 3.3032), 'description', 'Punto mas al este de peninsula', 'highlights', jsonb_build_array('Paraje de Cadaques', 'Dali museum', 'Cala'), 'visitTime', 4),
    jsonb_build_object('name', 'Faro de Begur', 'province', 'Costa Brava', 'region', 'Cataluna', 'coordinates', jsonb_build_array(41.9547, 3.2078), 'description', 'Faro en la Costa Brava', 'highlights', jsonb_build_array('Calas', 'Castillo', 'Gastronomia'), 'visitTime', 3)
  )
)
WHERE NOT EXISTS (SELECT 1 FROM thematic_routes WHERE id = 'faros');

INSERT INTO thematic_routes (id, name, short_name, category, difficulty, total_distance, total_driving_time, data)
SELECT 'murcia', 'Interior de Murcia: Caravaca, Calasparra, Moratalla', 'Ruta Murcia', 'interior', 'facil', 280, 6, jsonb_build_object(
  'description', 'Ruta por el interior de la Region de Murcia, descubriendo pueblos monumentales, gastronomia y naturaleza',
  'image', '/images/rutas/murcia-interior.jpg',
  'region', 'nacional',
  'bestSeason', jsonb_build_array('Marzo', 'Abril', 'Mayo', 'Octubre', 'Noviembre'),
  'roadType', 'carretera_nacional',
  'avgDailyCost', jsonb_build_object('bajo', 70, 'medio', 130, 'alto', 250),
  'mlFeatures', jsonb_build_object('popularityScore', 6.0, 'safetyScore', 9.5, 'valueScore', 9.0),
  'segments', jsonb_build_array(
    jsonb_build_object('id', 1, 'name', 'Murcia - Cartagena', 'from', 'Murcia', 'to', 'Cartagena', 'distance', 70, 'drivingTime', 1, 'locations', jsonb_build_array('Murcia', 'Cartagena')),
    jsonb_build_object('id', 2, 'name', 'Cartagena - Caravaca', 'from', 'Cartagena', 'to', 'Caravaca de la Cruz', 'distance', 90, 'drivingTime', 1.5, 'locations', jsonb_build_array('Cartagena', 'Caravaca de la Cruz')),
    jsonb_build_object('id', 3, 'name', 'Caravaca - Calasparra', 'from', 'Caravaca de la Cruz', 'to', 'Calasparra', 'distance', 40, 'drivingTime', 0.75, 'locations', jsonb_build_array('Caravaca de la Cruz', 'Calasparra')),
    jsonb_build_object('id', 4, 'name', 'Calasparra - Moratalla', 'from', 'Calasparra', 'to', 'Moratalla', 'distance', 35, 'drivingTime', 0.75, 'locations', jsonb_build_array('Calasparra', 'Moratalla')),
    jsonb_build_object('id', 5, 'name', 'Moratalla - Lorca', 'from', 'Moratalla', 'to', 'Lorca', 'distance', 45, 'drivingTime', 1, 'locations', jsonb_build_array('Moratalla', 'Lorca')),
    jsonb_build_object('id', 6, 'name', 'Lorca - Murcia', 'from', 'Lorca', 'to', 'Murcia', 'distance', 85, 'drivingTime', 1.5, 'locations', jsonb_build_array('Lorca', 'Cieza', 'Murcia'))
  ),
  'locations', jsonb_build_array(
    jsonb_build_object('name', 'Murcia', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(37.9833, -1.1167), 'description', 'Capital del Reino de Murcia', 'highlights', jsonb_build_array('Cathedral', 'Real Casino', 'Museo'), 'visitTime', 4),
    jsonb_build_object('name', 'Cartagena', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(37.6000, -0.9833), 'description', 'Ciudad Romana y Naval', 'highlights', jsonb_build_array('Teatro Romano', 'Castillo', 'Museo ARQ'), 'visitTime', 5),
    jsonb_build_object('name', 'Caravaca de la Cruz', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(38.1050, -2.1233), 'description', 'Ciudad Santa, fiestas de interes turistico internacional', 'highlights', jsonb_build_array('Santuario de la Vera Cruz', 'Castillo', 'Fiestas'), 'visitTime', 5),
    jsonb_build_object('name', 'Calasparra', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(38.2333, -1.8500), 'description', 'Rio y arrozales', 'highlights', jsonb_build_array('Castillo', 'Rice fields', 'River canoeing'), 'visitTime', 3),
    jsonb_build_object('name', 'Moratalla', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(38.1833, -2.0333), 'description', 'Cruz de caravaca', 'highlights', jsonb_build_array('Castillo', 'Nature', 'Gastronomia'), 'visitTime', 3),
    jsonb_build_object('name', 'Lorca', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(37.6833, -1.7000), 'description', 'Ciudad del Sol', 'highlights', jsonb_build_array('Castillo', 'Apostol', 'Parque'), 'visitTime', 3),
    jsonb_build_object('name', 'Cieza', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(38.2500, -1.4000), 'description', 'Tierras de frutales y naturaleza', 'highlights', jsonb_build_array('Eras', 'Senderismo', 'Fruta'), 'visitTime', 2),
    jsonb_build_object('name', 'Yecla', 'province', 'Murcia', 'region', 'Region de Murcia', 'coordinates', jsonb_build_array(38.6167, -1.1167), 'description', 'Ciudad del vino', 'highlights', jsonb_build_array('Museo del vino', 'Yecca city', 'Bodegas'), 'visitTime', 3)
  )
)
WHERE NOT EXISTS (SELECT 1 FROM thematic_routes WHERE id = 'murcia');

INSERT INTO thematic_routes (id, name, short_name, category, difficulty, total_distance, total_driving_time, data)
SELECT 'vino', 'Rutas del Vino de España', 'Ruta Vino', 'cultural', 'facil', 1200, 18, jsonb_build_object(
  'description', 'Recorre las principale regions vinicolas de Espana: Rioja, Ribera del Duero, Rias Baixas, Penedes, Jumilla y mas',
  'image', '/images/rutas/vino-espana.jpg',
  'region', 'nacional',
  'bestSeason', jsonb_build_array('Marzo', 'Abril', 'Mayo', 'Septiembre', 'Octubre', 'Noviembre'),
  'roadType', 'autovia',
  'avgDailyCost', jsonb_build_object('bajo', 80, 'medio', 150, 'alto', 350),
  'mlFeatures', jsonb_build_object('popularityScore', 7.0, 'safetyScore', 9.5, 'valueScore', 8.5),
  'segments', jsonb_build_array(
    jsonb_build_object('id', 1, 'name', 'La Rioja - Haro', 'from', 'Logrono', 'to', 'Haro', 'distance', 45, 'drivingTime', 0.5, 'locations', jsonb_build_array('Logrono', 'Haro', 'Briones')),
    jsonb_build_object('id', 2, 'name', 'Rioja - Ribera del Duero', 'from', 'Haro', 'to', 'Aranda de Duero', 'distance', 180, 'drivingTime', 2, 'locations', jsonb_build_array('San Asensio', 'Aranda de Duero')),
    jsonb_build_object('id', 3, 'name', 'Ribera del Duero - Rias Baixas', 'from', 'Aranda de Duero', 'to', 'Cambados', 'distance', 450, 'drivingTime', 5, 'locations', jsonb_build_array('Penafiel', 'Cambados')),
    jsonb_build_object('id', 4, 'name', 'Rias Baixas - Penedes', 'from', 'Cambados', 'to', 'Sant Sadurni', 'distance', 900, 'drivingTime', 10, 'locations', jsonb_build_array('Sant Sadurni')),
    jsonb_build_object('id', 5, 'name', 'Penedes - Jumilla', 'from', 'Sant Sadurni', 'to', 'Jumilla', 'distance', 550, 'drivingTime', 6, 'locations', jsonb_build_array('Jumilla'))
  ),
  'locations', jsonb_build_array(
    jsonb_build_object('name', 'La Rioja', 'province', 'La Rioja', 'region', 'Rioja', 'coordinates', jsonb_build_array(42.4687, -2.4456), 'description', 'Laregion vinicola mas prestigiosa de Espana', 'highlights', jsonb_build_array('Bodegas Haro', 'Barrio de la Laurel', 'Museo del Vino'), 'visitTime', 4),
    jsonb_build_object('name', 'Ribera del Duero', 'province', 'Burgos', 'region', 'Castilla y Leon', 'coordinates', jsonb_build_array(41.6708, -3.6892), 'description', 'Vinos tintos intensos de alta montana', 'highlights', jsonb_build_array('Vega Sicilia', 'Aranda de Duero', 'Museo del Vino'), 'visitTime', 4),
    jsonb_build_object('name', 'Rias Baixas', 'province', 'Pontevedra', 'region', 'Galicia', 'coordinates', jsonb_build_array(42.5644, -8.8133), 'description', 'Albariño, vino blanco rafinado', 'highlights', jsonb_build_array('Cambados', 'Albariño', 'Museo del Vino'), 'visitTime', 3),
    jsonb_build_object('name', 'Penedes', 'province', 'Barcelona', 'region', 'Cataluna', 'coordinates', jsonb_build_array(41.4250, -1.7833), 'description', 'Capital del Cava, DO 100% ecologica', 'highlights', jsonb_build_array('Cavas', 'Freixenet', 'Barcelonacerca'), 'visitTime', 3),
    jsonb_build_object('name', 'Jumilla', 'province', 'Murcia', 'region', 'Murcia', 'coordinates', jsonb_build_array(38.4833, -1.0833), 'description', 'Monastrell potente,mejor precio', 'highlights', jsonb_build_array('Borra', 'Juan Gil', 'Bodegasauthenticas'), 'visitTime', 3),
    jsonb_build_object('name', 'Montilla-Moriles', 'province', 'Cordoba', 'region', 'Andalucia', 'coordinates', jsonb_build_array(37.6000, -4.6333), 'description', 'Vinos generosos uniques', 'highlights', jsonb_build_array('Fino', 'Oloroso', 'Pedro Ximenez'), 'visitTime', 3),
    jsonb_build_object('name', 'Ronda', 'province', 'Malaga', 'region', 'Andalucia', 'coordinates', jsonb_build_array(36.7333, -5.1500), 'description', 'Vinos de montana en ciudad romantica', 'highlights', jsonb_build_array('Bodegas Gutierrez', 'Tajo', 'Viñedosmontana'), 'visitTime', 2),
    jsonb_build_object('name', 'Txakoli Pais Vasco', 'province', 'Gipuzkoa', 'region', 'Pais Vasco', 'coordinates', jsonb_build_array(43.3167, -1.9333), 'description', 'Vino atlantico unico', 'highlights', jsonb_build_array('Txakoli', 'Getaria', 'Hondarribia'), 'visitTime', 2)
  ),
  'wineRegions', jsonb_build_array(
    jsonb_build_object('name', 'Haro', 'do', 'DOCa Rioja', 'province', 'La Rioja', 'coordinates', jsonb_build_array(42.5778, -2.9319), 'description', 'Capital del vino Rioja con mas de 60 bodegas', 'wines', jsonb_build_array('Rioja Reserva', 'Rioja Gran Reserva'), 'topWineries', jsonb_build_array('Bilbao', 'Muga', 'Rodolfo', 'Carchoir'), 'visitTime', 4, 'avgTastingPrice', 25, 'requiresAppointment', false),
    jsonb_build_object('name', 'Logrono', 'do', 'DOCa Rioja', 'province', 'La Rioja', 'coordinates', jsonb_build_array(42.4687, -2.4456), 'description', 'Ciudad con calle Laurel de tapas y bodegas historicas', 'wines', jsonb_build_array('Rioja Crianza', 'Rioja Reserva'), 'topWineries', jsonb_build_array('Marques de Riscal', 'Ontaion'), 'visitTime', 3, 'avgTastingPrice', 20, 'requiresAppointment', false),
    jsonb_build_object('name', 'Briones', 'do', 'DOCa Rioja', 'province', 'La Rioja', 'coordinates', jsonb_build_array(42.5167, -2.7833), 'description', 'Pueblo con Museo del Vino dinamizado', 'wines', jsonb_build_array('Rioja Reserva', 'Rioja Blanco'), 'topWineries', jsonb_build_array('CVNE', 'Darien'), 'visitTime', 2, 'avgTastingPrice', 18, 'requiresAppointment', false),
    jsonb_build_object('name', 'San Asensio', 'do', 'DOCa Rioja', 'province', 'La Rioja', 'coordinates', jsonb_build_array(42.4167, -2.7833), 'description', 'Tradicion vinicola desde 1879', 'wines', jsonb_build_array('Rioja Reserva', 'Rioja Gran Reserva'), 'topWineries', jsonb_build_array('Ontaion', 'Vina Lanciano'), 'visitTime', 2, 'avgTastingPrice', 22, 'requiresAppointment', true),
    jsonb_build_object('name', 'Aranda de Duero', 'do', 'DO Ribera del Duero', 'province', 'Burgos', 'coordinates', jsonb_build_array(41.6708, -3.6892), 'description', 'Centrovinicola con mas de 100 bodegas', 'wines', jsonb_build_array('Ribera del Duero Reserva', 'Ribera del Duero Gran Reserva'), 'topWineries', jsonb_build_array('Vega Sicilia', 'Pingus', 'Dominio de Pingus'), 'visitTime', 4, 'avgTastingPrice', 30, 'requiresAppointment', true),
    jsonb_build_object('name', 'Roa de Duero', 'do', 'DO Ribera del Duero', 'province', 'Burgos', 'coordinates', jsonb_build_array(41.6833, -3.9333), 'description', 'Pueblo medieval con vistas al rio', 'wines', jsonb_build_array('Ribera del Duero Reserva'), 'topWineries', jsonb_build_array('Aalto', 'Pago de los Capellanes'), 'visitTime', 2, 'avgTastingPrice', 18, 'requiresAppointment', false),
    jsonb_build_object('name', 'Penafiel', 'do', 'DO Ribera del Duero', 'province', 'Valladolid', 'coordinates', jsonb_build_array(41.5944, -4.1128), 'description', 'Museo del Vino y Castillo', 'wines', jsonb_build_array('Ribera del Duero Reserva', 'Rosado'), 'topWineries', jsonb_build_array('Protos', 'Arrode'), 'visitTime', 3, 'avgTastingPrice', 15, 'requiresAppointment', false),
    jsonb_build_object('name', 'Soria', 'do', 'DO Ribera del Duero', 'province', 'Soria', 'coordinates', jsonb_build_array(41.9833, -2.4667), 'description', 'Zona menos mas旅游, vinos unicos', 'wines', jsonb_build_array('Ribera del Duero'), 'topWineries', jsonb_build_array('Numanthia'), 'visitTime', 3, 'avgTastingPrice', 20, 'requiresAppointment', true),
    jsonb_build_object('name', 'Cambados', 'do', 'DO Rias Baixas', 'province', 'Pontevedra', 'coordinates', jsonb_build_array(42.5644, -8.8133), 'description', 'Capital del Albariño con Museo del Vino', 'wines', jsonb_build_array('Albariño', 'Albariño Espumoso'), 'topWineries', jsonb_build_array('Santiago Ruiz', 'Perez Cambados', 'Fillaboa'), 'visitTime', 3, 'avgTastingPrice', 15, 'requiresAppointment', false),
    jsonb_build_object('name', 'Sanxenxo', 'do', 'DO Rias Baixas', 'province', 'Pontevedra', 'coordinates', jsonb_build_array(42.4000, -8.8000), 'description', 'Zona costera con bodegas cerca del mar', 'wines', jsonb_build_array('Albariño', 'Rio'), 'topWineries', jsonb_build_array('Galiciauto', 'Adega Valdamor'), 'visitTime', 2, 'avgTastingPrice', 12, 'requiresAppointment', false),
    jsonb_build_object('name', 'Meis', 'do', 'DO Rias Baixas', 'province', 'Pontevedra', 'coordinates', jsonb_build_array(42.5167, -8.5833), 'description', 'Valle del Salnes, epicentro del Albariño', 'wines', jsonb_build_array('Albariño'), 'topWineries', jsonb_build_array('Martin Codax', 'Paraje'), 'visitTime', 2, 'avgTastingPrice', 14, 'requiresAppointment', false),
    jsonb_build_object('name', 'Ribadumia', 'do', 'DO Rias Baixas', 'province', 'Pontevedra', 'coordinates', jsonb_build_array(42.4833, -8.7500), 'description', 'Bodegas centenarios', 'wines', jsonb_build_array('Albariño', 'Treixadura'), 'topWineries', jsonb_build_array('Lagar de Cervera', 'Vina代数'), 'visitTime', 2, 'avgTastingPrice', 16, 'requiresAppointment', false),
    jsonb_build_object('name', 'Sant Sadurni d', 'do', 'DO Penedes', 'province', 'Barcelona', 'coordinates', jsonb_build_array(41.4250, -1.7833), 'description', 'Capital del Cava, primera DO 100% ecologica del mundo', 'wines', jsonb_build_array('Cava', 'Cava Reserva', 'Cava Gran Reserva'), 'topWineries', jsonb_build_array('Freixenet', 'Codorniu', 'Segura'), 'visitTime', 3, 'avgTastingPrice', 18, 'requiresAppointment', false),
    jsonb_build_object('name', 'Subirats', 'do', 'DO Penedes', 'province', 'Barcelona', 'coordinates', jsonb_build_array(41.4500, -1.9333), 'description', 'Castillos y viñedos', 'wines', jsonb_build_array('Cava', 'Vino Blanco'), 'topWineries', jsonb_build_array('Juvi & Camps', 'M举杯'), 'visitTime', 2, 'avgTastingPrice', 20, 'requiresAppointment', false),
    jsonb_build_object('name', 'El Pla del Penedes', 'do', 'DO Penedes', 'province', 'Barcelona', 'coordinates', jsonb_build_array(41.3667, -1.7500), 'description', 'Paisajes de viñedos cerca Barcelona', 'wines', jsonb_build_array('Cava Brut', 'Penedes Blanco'), 'topWineries', jsonb_build_array('Albet i Noya', 'Miquel Pons'), 'visitTime', 2, 'avgTastingPrice', 15, 'requiresAppointment', false),
    jsonb_build_object('name', 'Jumilla', 'do', 'DO Jumilla', 'province', 'Murcia', 'coordinates', jsonb_build_array(38.4833, -1.0833), 'description', 'DO con vinos tintos potentes, clima unico', 'wines', jsonb_build_array('Jumilla Monastrell', 'Jumilla Reserva'), 'topWineries', jsonb_build_array('Borra', 'Juan Gil', 'Volver'), 'visitTime', 3, 'avgTastingPrice', 12, 'requiresAppointment', false),
    jsonb_build_object('name', 'Yecla', 'do', 'DO Yecla', 'province', 'Murcia', 'coordinates', jsonb_build_array(38.6167, -1.1167), 'description', 'Vinos tintos con identidad propia', 'wines', jsonb_build_array('Yecla Monastrell'), 'topWineries', jsonb_build_array('Castillo de Jumilla', 'Barahonda'), 'visitTime', 2, 'avgTastingPrice', 10, 'requiresAppointment', false)
  )
)
WHERE NOT EXISTS (SELECT 1 FROM thematic_routes WHERE id = 'vino');

CREATE INDEX IF NOT EXISTS idx_thematic_routes_category ON thematic_routes(category);
CREATE INDEX IF NOT EXISTS idx_thematic_routes_difficulty ON thematic_routes(difficulty);
