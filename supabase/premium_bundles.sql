CREATE TABLE IF NOT EXISTS premium_bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  intervalo TEXT DEFAULT 'mes',
  tipo TEXT DEFAULT 'subscription',
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS premium_addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  tipo TEXT DEFAULT 'one-time',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO premium_bundles (id, name, price, intervalo, tipo, features) VALUES
('mochilero-pro', 'Mochilero Pro', 9.99, 'mes', 'subscription', '[{"name": "Acceso completo IA", "description": "Chat ilimitado con IA de viajes", "included": true}, {"name": "Alertas OSINT", "description": "Alertas de seguridad en tiempo real", "included": true}, {"name": "TCI Avanzado", "description": "Indice de coste de viaje detallado", "included": true}, {"name": "PDF Manual Viajero", "description": "Guia personalizada descargable", "included": true}, {"name": "Newsletter Premium", "description": "Analisis semanal exclusivo", "included": true}, {"name": "Sin publicidad", "description": "Experiencia sin anuncios", "included": true}]'),
('mochilero-vip', 'Mochilero VIP', 19.99, 'mes', 'lifetime', '[{"name": "Todo Mochilero Pro", "included": true}, {"name": "Acceso vitalicio", "description": "Sin renovaciones", "included": true}, {"name": "API personalizada", "description": "Endpoints dedicados", "included": true}, {"name": "Soporte prioritario", "description": "Respuesta en <2h", "included": true}, {"name": "Features beta", "description": "Acceso anticipado a nuevas funciones", "included": true}]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();

INSERT INTO premium_addons (id, name, price, tipo, features) VALUES
('trip-emergency', 'Pack Emergencia Viaje', 4.99, 'one-time', ARRAY['Checklist emergencia personalizado', 'Guia PDF de seguridad', '1 mes de alertas OSINT', 'Telefono emergencia 24h', 'Alerta automatica de riesgo']),
('quick-departure', 'Salida Express', 2.99, 'one-time', ARRAY['Guia de visados', 'Optimizacion de vuelos', 'Checklist 24h', 'Mapa offline', 'Acceso IA 48h'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = NOW();
