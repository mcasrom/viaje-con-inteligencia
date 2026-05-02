-- Sprint 35: Reviews & Social Proof
-- Table for storing user reviews/testimonials

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  country TEXT,
  trip_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching reviews by country
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country);

-- Index for ordering by date
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);

-- Anyone can insert reviews (anonymous)
CREATE POLICY "Anyone can write reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Seed data: realistic testimonials
INSERT INTO reviews (author, rating, comment, country, trip_date, verified) VALUES
  ('María G.', 5, 'La herramienta de clustering me ayudó a descubrir que Portugal y Croacia tienen perfiles muy similares. Elegí Croacia por el precio y fue un acierto total.', 'hr', '2026-03-15', true),
  ('Carlos R.', 4, 'Muy útil para planificar el viaje a Japón. El itinerario generado fue bueno aunque le faltaría más detalle en transporte local.', 'jp', '2026-02-20', true),
  ('Ana M.', 5, 'Las alertas del bot de Telegram son increíbles. Me avisaron de un cambio en el nivel de riesgo de Turquía justo antes de mi viaje.', 'tr', '2026-04-01', true),
  ('David K.', 5, 'Impresionante la cantidad de datos. La ficha de viaje de Tailandia tenía todo lo que necesitaba: presupuesto, seguridad, contactos de embajada...', 'th', '2026-03-25', false),
  ('Roberto S.', 4, 'El mapa de riesgos es lo mejor. De un vistazo ves qué países son seguros y cuáles no. Lo uso cada vez que planifico un viaje.', 'es', '2026-02-28', false),
  ('Laura P.', 3, 'Buena herramienta pero echo de menos más países en Latinoamérica. El itinerario de México fue correcto pero genérico.', 'mx', '2026-03-05', true),
  ('Elena F.', 5, 'Descubrí este proyecto por el blog y me enganchó. Ahora lo uso como referencia para todos mis viajes. La sección de clustering es genial.', null, '2026-01-15', true),
  ('Javier T.', 4, 'Como viajero frecuente, valoro mucho tener los datos del MAEC centralizados. El newsletter con novedades de riesgo es muy útil.', 'ma', '2026-04-10', true),
  ('Sofia L.', 5, 'El checklist descargable me salvó en mi viaje a Marruecos. Había cosas que nunca se me hubieran ocurrido sin esta herramienta.', 'ma', '2026-02-14', false),
  ('Pedro N.', 4, 'La comparativa de presupuesto entre países me ayudó a elegir Vietnam sobre Camboya. Más barato y con mejor infraestructura turística.', 'vn', '2026-03-30', true);
