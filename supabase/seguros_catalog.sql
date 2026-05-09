CREATE TABLE IF NOT EXISTS seguros_catalog (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  aseguradora TEXT NOT NULL,
  precio_min NUMERIC NOT NULL,
  precio_max NUMERIC NOT NULL,
  moneda TEXT DEFAULT 'EUR',
  web TEXT,
  afiliado TEXT,
  coberturas JSONB NOT NULL DEFAULT '{}',
  exclusiones TEXT[] DEFAULT '{}',
  recomendado_para TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seguros_perfiles (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  descripcion TEXT,
  cobertura_minima JSONB NOT NULL DEFAULT '{}'
);

INSERT INTO seguros_catalog (id, nombre, aseguradora, precio_min, precio_max, moneda, web, afiliado, coberturas, exclusiones, recomendado_para) VALUES
('iati-estandar', 'IATI Estandar', 'IATI Seguros', 49, 89, 'EUR', 'https://www.iatiseguros.com', 'https://www.iatiseguros.com/?afil=viajeinteligencia', '{"medica": 300000, "evacuacion": 500000, "cancelacion": 0, "repatriacion": true, "covid": false, "deportes_basicos": false, "deportes_aventura": false, "electronica": 0, "equipaje": 500, "responsabilidad_civil": false, "retraso_vuelo": false, "perdida_conexion": false}', ARRAY['Deportes de riesgo no cubiertos', 'Equipaje limitado', 'Sin cobertura COVID'], ARRAY['viaje_estandar', 'familia']),
('iati-plus', 'IATI Viajes Plus', 'IATI Seguros', 64, 119, 'EUR', 'https://www.iatiseguros.com', 'https://www.iatiseguros.com/?afil=viajeinteligencia', '{"medica": 500000, "evacuacion": 1000000, "cancelacion": 1500, "repatriacion": true, "covid": true, "deportes_basicos": true, "deportes_aventura": false, "electronica": 300, "equipaje": 1000, "responsabilidad_civil": true, "retraso_vuelo": true, "perdida_conexion": true}', ARRAY['Deportes de aventura no cubiertos'], ARRAY['riesgo_medio', 'deportes', 'larga_estancia']),
('iati-tope', 'IATI Top Ventas', 'IATI Seguros', 79, 149, 'EUR', 'https://www.iatiseguros.com', 'https://www.iatiseguros.com/?afil=viajeinteligencia', '{"medica": 1000000, "evacuacion": 2000000, "cancelacion": 3000, "repatriacion": true, "covid": true, "deportes_basicos": true, "deportes_aventura": true, "electronica": 500, "equipaje": 1500, "responsabilidad_civil": true, "retraso_vuelo": true, "perdida_conexion": true}', ARRAY['Algunos deportes extremos requieren consulta'], ARRAY['riesgo_alto', 'deportes_aventura']),
('chapka-cap', 'Chapka Cap 500', 'Chapka Assurances', 45, 75, 'EUR', 'https://www.chapka.com', 'https://www.chapka.com/?afil=viajeinteligencia', '{"medica": 500000, "evacuacion": 500000, "cancelacion": 0, "repatriacion": true, "covid": false, "deportes_basicos": false, "deportes_aventura": false, "electronica": 0, "equipaje": 500, "responsabilidad_civil": false, "retraso_vuelo": false, "perdida_conexion": false}', ARRAY['Sin cancelacion', 'Sin COVID', 'Sin deportes'], ARRAY['viaje_estandar', 'familia']),
('chapka-cap1000', 'Chapka Cap 1000', 'Chapka Assurances', 59, 99, 'EUR', 'https://www.chapka.com', 'https://www.chapka.com/?afil=viajeinteligencia', '{"medica": 1000000, "evacuacion": 1000000, "cancelacion": 1500, "repatriacion": true, "covid": true, "deportes_basicos": true, "deportes_aventura": false, "electronica": 200, "equipaje": 1000, "responsabilidad_civil": true, "retraso_vuelo": true, "perdida_conexion": false}', ARRAY['Deportes aventura no cubiertos'], ARRAY['riesgo_medio', 'deportes']),
('intermundial-mundial', 'InterMundial Mundial', 'InterMundial', 42, 72, 'EUR', 'https://www.intermundial.es', 'https://www.intermundial.es/?afil=viajeinteligencia', '{"medica": 300000, "evacuacion": 300000, "cancelacion": 1000, "repatriacion": true, "covid": false, "deportes_basicos": false, "deportes_aventura": false, "electronica": 0, "equipaje": 500, "responsabilidad_civil": false, "retraso_vuelo": false, "perdida_conexion": false}', ARRAY['Coberturas basicas', 'Sin COVID'], ARRAY['viaje_estandar']),
('axa-asistencia', 'AXA Asistencia Viaje', 'AXA Partners', 55, 95, 'EUR', 'https://www.axa.es', 'https://www.axa.es/?afil=viajeinteligencia', '{"medica": 500000, "evacuacion": 1000000, "cancelacion": 2000, "repatriacion": true, "covid": true, "deportes_basicos": true, "deportes_aventura": false, "electronica": 0, "equipaje": 1000, "responsabilidad_civil": true, "retraso_vuelo": true, "perdida_conexion": false}', ARRAY['Sin electronica'], ARRAY['riesgo_medio', 'larga_estancia']),
('mapfre-asistencia', 'Mapfre Asistencia Viaje', 'Mapfre', 48, 85, 'EUR', 'https://www.mapfre.es', 'https://www.mapfre.es/?afil=viajeinteligencia', '{"medica": 300000, "evacuacion": 500000, "cancelacion": 1000, "repatriacion": true, "covid": false, "deportes_basicos": true, "deportes_aventura": false, "electronica": 0, "equipaje": 500, "responsabilidad_civil": true, "retraso_vuelo": false, "perdida_conexion": false}', ARRAY['Sin COVID', 'Sin electronica'], ARRAY['viaje_estandar', 'familia']),
('allianz-care', 'Allianz Care Viaje', 'Allianz', 52, 88, 'EUR', 'https://www.allianz.es', 'https://www.allianz.es/?afil=viajeinteligencia', '{"medica": 500000, "evacuacion": 1000000, "cancelacion": 1500, "repatriacion": true, "covid": true, "deportes_basicos": true, "deportes_aventura": false, "electronica": 0, "equipaje": 1000, "responsabilidad_civil": true, "retraso_vuelo": false, "perdida_conexion": false}', ARRAY['Deportes aventura no cubiertos'], ARRAY['riesgo_medio', 'deportes'])
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  aseguradora = EXCLUDED.aseguradora,
  precio_min = EXCLUDED.precio_min,
  precio_max = EXCLUDED.precio_max,
  web = EXCLUDED.web,
  afiliado = EXCLUDED.afiliado,
  coberturas = EXCLUDED.coberturas,
  exclusiones = EXCLUDED.exclusiones,
  recomendado_para = EXCLUDED.recomendado_para,
  updated_at = NOW();

INSERT INTO seguros_perfiles (id, label, descripcion, cobertura_minima) VALUES
('viaje_estandar', 'Viaje estandar', 'Turismo, ciudad, sin actividades de riesgo', '{"medica": 300000, "evacuacion": 500000}'),
('riesgo_medio', 'Destino de riesgo medio', 'Pais con IRV >60', '{"medica": 500000, "evacuacion": 1000000}'),
('riesgo_alto', 'Destino de riesgo alto', 'Pais con IRV >70', '{"medica": 1000000, "evacuacion": 2000000}'),
('deportes', 'Viaje con deportes', 'Senderismo, trekking, deportes sin motor', '{"medica": 500000, "evacuacion": 1000000}'),
('deportes_aventura', 'Deportes de aventura', 'Buceo, esqui, moto, puenting, paracaidismo', '{"medica": 1000000, "evacuacion": 2000000}'),
('familia', 'Viaje familiar', 'Viaje con ninos o mayores', '{"medica": 500000, "evacuacion": 500000}'),
('larga_estancia', 'Larga estancia', 'Viaje >30 dias', '{"medica": 1000000, "evacuacion": 1000000}')
ON CONFLICT (id) DO NOTHING;
