export interface FallbackEvent {
  title: string;
  country: string;
  code: string;
  start_date: string;
  end_date: string | null;
  category: string;
  subcategory: string;
  impact_traveler: string;
  impact_note: string;
  city: string | null;
  source: string;
}

const monthDay = (m: number, d: number) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const monthDayEnd = (m: number, d: number, span: number) =>
  `2026-${String(m).padStart(2, '0')}-${String(Math.min(d + span, 31)).padStart(2, '0')}`;

export const EVENTS_FALLBACK: FallbackEvent[] = [
  // ===== ENERO =====
  { title: 'Davos (Foro Económico Mundial)', country: 'Suiza', code: 'ch', start_date: monthDay(1, 19), end_date: monthDay(1, 23), category: 'conference', subcategory: 'economic', impact_traveler: 'high', impact_note: 'Cierres de calles y precios extremos en hoteles', city: 'Davos', source: 'fallback' },
  { title: 'Año Nuevo Chino', country: 'China', code: 'cn', start_date: monthDay(1, 28), end_date: monthDay(2, 4), category: 'cultural', subcategory: 'festivity', impact_traveler: 'high', impact_note: 'La mayor migración humana del mundo. Transporte colapsado', city: null, source: 'fallback' },
  { title: 'Año Nuevo Chino (Singapur)', country: 'Singapur', code: 'sg', start_date: monthDay(1, 28), end_date: monthDay(1, 30), category: 'cultural', subcategory: 'festivity', impact_traveler: 'medium', impact_note: 'Festejos en calles principales', city: null, source: 'fallback' },
  { title: 'Año Nuevo Chino (Malasia)', country: 'Malasia', code: 'my', start_date: monthDay(1, 28), end_date: monthDay(1, 30), category: 'cultural', subcategory: 'festivity', impact_traveler: 'medium', impact_note: 'Celebraciones en KL y Penang', city: null, source: 'fallback' },
  { title: 'Australian Open', country: 'Australia', code: 'au', start_date: monthDay(1, 12), end_date: monthDay(1, 25), category: 'sports', subcategory: 'tournament', impact_traveler: 'high', impact_note: 'Alta demanda hotelera en Melbourne', city: 'Melbourne', source: 'fallback' },
  { title: 'Feria Internacional de Turismo FITUR', country: 'España', code: 'es', start_date: monthDay(1, 21), end_date: monthDay(1, 25), category: 'conference', subcategory: 'tourism', impact_traveler: 'medium', impact_note: 'Conglomeración turística en Madrid', city: 'Madrid', source: 'fallback' },

  // ===== FEBRERO =====
  { title: 'Carnaval de Río', country: 'Brasil', code: 'br', start_date: monthDay(2, 14), end_date: monthDay(2, 18), category: 'festival', subcategory: 'carnival', impact_traveler: 'high', impact_note: 'Saturación turística. Precaución con robos', city: 'Río de Janeiro', source: 'fallback' },
  { title: 'Carnaval de Venecia', country: 'Italia', code: 'it', start_date: monthDay(2, 7), end_date: monthDay(2, 17), category: 'festival', subcategory: 'carnival', impact_traveler: 'high', impact_note: 'Precios disparados en Venecia', city: 'Venecia', source: 'fallback' },
  { title: 'Carnaval de Barranquilla', country: 'Colombia', code: 'co', start_date: monthDay(2, 14), end_date: monthDay(2, 18), category: 'festival', subcategory: 'carnival', impact_traveler: 'medium', impact_note: 'Uno de los carnavales más grandes del mundo', city: 'Barranquilla', source: 'fallback' },
  { title: 'MWC (Mobile World Congress)', country: 'España', code: 'es', start_date: monthDay(2, 16), end_date: monthDay(2, 19), category: 'conference', subcategory: 'technology', impact_traveler: 'high', impact_note: 'Hoteles al 200% en Barcelona', city: 'Barcelona', source: 'fallback' },
  { title: 'Mardi Gras (Nueva Orleans)', country: 'EE.UU.', code: 'us', start_date: monthDay(2, 14), end_date: monthDay(2, 18), category: 'festival', subcategory: 'parade', impact_traveler: 'high', impact_note: 'Desfiles masivos en Nueva Orleans', city: 'Nueva Orleans', source: 'fallback' },
  { title: 'Super Bowl LX', country: 'EE.UU.', code: 'us', start_date: monthDay(2, 8), end_date: monthDay(2, 8), category: 'sports', subcategory: 'final', impact_traveler: 'high', impact_note: 'Evento deportivo más visto de EE.UU.', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Australia', country: 'Australia', code: 'au', start_date: monthDay(2, 1), end_date: monthDay(2, 3), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Alta demanda en Melbourne', city: 'Melbourne', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Baréin', country: 'Baréin', code: 'bh', start_date: monthDay(2, 15), end_date: monthDay(2, 17), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Afluencia de turistas', city: 'Sakhir', source: 'fallback' },

  // ===== MARZO =====
  { title: 'Holi (Festival de los Colores)', country: 'India', code: 'in', start_date: monthDay(3, 4), end_date: monthDay(3, 5), category: 'cultural', subcategory: 'festivity', impact_traveler: 'high', impact_note: 'Polvos de colores por todas partes. Transporte local colapsado', city: null, source: 'fallback' },
  { title: 'Fallas de Valencia', country: 'España', code: 'es', start_date: monthDay(3, 15), end_date: monthDay(3, 19), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Calles cortadas, petardos, alta demanda hotelera', city: 'Valencia', source: 'fallback' },
  { title: 'St. Patrick\'s Festival', country: 'Irlanda', code: 'ie', start_date: monthDay(3, 15), end_date: monthDay(3, 17), category: 'festival', subcategory: 'national', impact_traveler: 'high', impact_note: 'Desfile nacional en Dublín. Pubs a rebosar', city: 'Dublín', source: 'fallback' },
  { title: 'Ramadán (inicio)', country: 'Arabia Saudí', code: 'sa', start_date: monthDay(3, 1), end_date: monthDay(3, 29), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'No comer/beber en público. Horarios reducidos', city: null, source: 'fallback' },
  { title: 'Ramadán (Egipto)', country: 'Egipto', code: 'eg', start_date: monthDay(3, 1), end_date: monthDay(3, 29), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'Horarios comerciales reducidos', city: null, source: 'fallback' },
  { title: 'Ramadán (Emiratos Árabes)', country: 'Emiratos Árabes', code: 'ae', start_date: monthDay(3, 1), end_date: monthDay(3, 29), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'Jornada laboral reducida. No beber en público', city: null, source: 'fallback' },
  { title: 'Ramadán (Turquía)', country: 'Turquía', code: 'tr', start_date: monthDay(3, 1), end_date: monthDay(3, 29), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'Restaurantes cerrados hasta el iftar', city: null, source: 'fallback' },
  { title: 'Ramadán (Marruecos)', country: 'Marruecos', code: 'ma', start_date: monthDay(3, 1), end_date: monthDay(3, 29), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'Vida nocturna reducida', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de China', country: 'China', code: 'cn', start_date: monthDay(3, 22), end_date: monthDay(3, 24), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Alta demanda en Shanghái', city: 'Shanghái', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Japón', country: 'Japón', code: 'jp', start_date: monthDay(3, 29), end_date: monthDay(3, 31), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Afluencia en Suzuka', city: 'Suzuka', source: 'fallback' },
  { title: 'Coachella', country: 'EE.UU.', code: 'us', start_date: monthDay(3, 27), end_date: monthDay(3, 29), category: 'festival', subcategory: 'music', impact_traveler: 'high', impact_note: 'Fiesta masiva en el desierto. Hoteles agotados', city: 'Indio', source: 'fallback' },
  { title: 'Semana Santa (España)', country: 'España', code: 'es', start_date: monthDay(3, 30), end_date: monthDay(4, 5), category: 'religious', subcategory: 'holy_week', impact_traveler: 'high', impact_note: 'Procesiones y vacaciones. Ciudades abarrotadas', city: null, source: 'fallback' },
  { title: 'Semana Santa (Guatemala)', country: 'Guatemala', code: 'gt', start_date: monthDay(3, 30), end_date: monthDay(4, 5), category: 'religious', subcategory: 'holy_week', impact_traveler: 'high', impact_note: 'Alfombras de aserrín y procesiones masivas', city: 'Antigua', source: 'fallback' },
  { title: 'Semana Santa (México)', country: 'México', code: 'mx', start_date: monthDay(3, 30), end_date: monthDay(4, 5), category: 'religious', subcategory: 'holy_week', impact_traveler: 'high', impact_note: 'Vacaciones nacionales. Playas abarrotadas', city: null, source: 'fallback' },
  { title: 'Semana Santa (Perú)', country: 'Perú', code: 'pe', start_date: monthDay(3, 30), end_date: monthDay(4, 5), category: 'religious', subcategory: 'holy_week', impact_traveler: 'medium', impact_note: 'Procesiones en Cusco y Ayacucho', city: null, source: 'fallback' },

  // ===== ABRIL =====
  { title: 'Songkran (Año Nuevo Tailandés)', country: 'Tailandia', code: 'th', start_date: monthDay(4, 13), end_date: monthDay(4, 15), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Guerra de agua masiva. Alto índice de accidentes de tráfico', city: null, source: 'fallback' },
  { title: 'Cherry Blossom (Sakura)', country: 'Japón', code: 'jp', start_date: monthDay(4, 1), end_date: monthDay(4, 20), category: 'cultural', subcategory: 'natural', impact_traveler: 'high', impact_note: 'Temporada alta absoluta. Hoteles reservados con meses', city: null, source: 'fallback' },
  { title: 'Feria de Abril', country: 'España', code: 'es', start_date: monthDay(4, 19), end_date: monthDay(4, 25), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Sevilla abarrotada. Casetas y flamenco', city: 'Sevilla', source: 'fallback' },
  { title: 'Maratón de Londres', country: 'Reino Unido', code: 'gb', start_date: monthDay(4, 26), end_date: monthDay(4, 26), category: 'sports', subcategory: 'marathon', impact_traveler: 'medium', impact_note: 'Calles cortadas en el centro de Londres', city: 'Londres', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Arabia Saudí', country: 'Arabia Saudí', code: 'sa', start_date: monthDay(4, 5), end_date: monthDay(4, 7), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Gran evento en Yeda', city: 'Yeda', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Miami', country: 'EE.UU.', code: 'us', start_date: monthDay(4, 19), end_date: monthDay(4, 21), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Miami abarrotado. Fiesta alrededor del circuito', city: 'Miami', source: 'fallback' },

  // ===== MAYO =====
  { title: 'Gran Premio de Mónaco (F1)', country: 'Mónaco', code: 'mc', start_date: monthDay(5, 21), end_date: monthDay(5, 24), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Evento más exclusivo. Precios ×10. Yates y lujo', city: 'Montecarlo', source: 'fallback' },
  { title: 'Festival de Cannes', country: 'Francia', code: 'fr', start_date: monthDay(5, 13), end_date: monthDay(5, 24), category: 'festival', subcategory: 'film', impact_traveler: 'medium', impact_note: 'Estrellas de cine. Precios altos en la Costa Azul', city: 'Cannes', source: 'fallback' },
  { title: 'Final Champions League', country: 'Por definir', code: 'de', start_date: monthDay(5, 31), end_date: monthDay(5, 31), category: 'sports', subcategory: 'final', impact_traveler: 'high', impact_note: 'Miles de aficionados. Ciudad anfitriona colapsada', city: null, source: 'fallback' },
  { title: 'America\'s Cup (Regata)', country: 'España', code: 'es', start_date: monthDay(5, 1), end_date: monthDay(5, 31), category: 'sports', subcategory: 'sailing', impact_traveler: 'medium', impact_note: 'Uno de los eventos de vela más prestigiosos', city: 'Barcelona', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Emilia-Romaña', country: 'Italia', code: 'it', start_date: monthDay(5, 3), end_date: monthDay(5, 5), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Afluencia a Imola', city: 'Imola', source: 'fallback' },
  { title: 'Eid al-Fitr (fin de Ramadán)', country: 'Arabia Saudí', code: 'sa', start_date: monthDay(5, 1), end_date: monthDay(5, 3), category: 'religious', subcategory: 'islamic', impact_traveler: 'high', impact_note: 'Celebraciones masivas en todo el mundo islámico', city: null, source: 'fallback' },
  { title: 'Sailing: Vendée Globe (llegada)', country: 'Francia', code: 'fr', start_date: monthDay(5, 1), end_date: monthDay(5, 15), category: 'sports', subcategory: 'sailing', impact_traveler: 'low', impact_note: 'Regata oceánica en solitario. Llegada a Les Sables', city: 'Les Sables-d\'Olonne', source: 'fallback' },

  // ===== JUNIO =====
  { title: 'Mundial de Fútbol 2026', country: 'EE.UU.', code: 'us', start_date: monthDay(6, 11), end_date: monthDay(7, 19), category: 'sports', subcategory: 'tournament', impact_traveler: 'high', impact_note: 'Mayor evento deportivo del mundo. 48 selecciones. 16 sedes en 3 países', city: null, source: 'fallback' },
  { title: 'Mundial de Fútbol 2026 (México)', country: 'México', code: 'mx', start_date: monthDay(6, 11), end_date: monthDay(7, 19), category: 'sports', subcategory: 'tournament', impact_traveler: 'high', impact_note: 'Sedé mundialista con alta demanda turística', city: null, source: 'fallback' },
  { title: 'Mundial de Fútbol 2026 (Canadá)', country: 'Canadá', code: 'ca', start_date: monthDay(6, 11), end_date: monthDay(7, 19), category: 'sports', subcategory: 'tournament', impact_traveler: 'high', impact_note: 'Primera vez que Canadá alberga el Mundial', city: null, source: 'fallback' },
  { title: 'Glastonbury Festival', country: 'Reino Unido', code: 'gb', start_date: monthDay(6, 24), end_date: monthDay(6, 28), category: 'festival', subcategory: 'music', impact_traveler: 'high', impact_note: 'Mayor festival de música del Reino Unido. 200.000 asistentes', city: 'Pilton', source: 'fallback' },
  { title: 'Inti Raymi', country: 'Perú', code: 'pe', start_date: monthDay(6, 24), end_date: monthDay(6, 24), category: 'cultural', subcategory: 'festivity', impact_traveler: 'medium', impact_note: 'Festival del Sol en Sacsayhuamán. Turistas en Cusco', city: 'Cusco', source: 'fallback' },
  { title: 'Día D (80 aniversario)', country: 'Francia', code: 'fr', start_date: monthDay(6, 6), end_date: monthDay(6, 6), category: 'commemoration', subcategory: 'remembrance', impact_traveler: 'medium', impact_note: 'Ceremonias en Normandía. Carreteras cortadas', city: 'Normandía', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de España', country: 'España', code: 'es', start_date: monthDay(6, 7), end_date: monthDay(6, 9), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Afluencia a Montmeló (Barcelona)', city: 'Barcelona', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Canadá', country: 'Canadá', code: 'ca', start_date: monthDay(6, 14), end_date: monthDay(6, 16), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'GP de Montreal', city: 'Montreal', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Austria', country: 'Austria', code: 'at', start_date: monthDay(6, 28), end_date: monthDay(6, 30), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Ambiente festivo en Spielberg', city: 'Spielberg', source: 'fallback' },
  { title: 'Wimbledon', country: 'Reino Unido', code: 'gb', start_date: monthDay(6, 29), end_date: monthDay(7, 12), category: 'sports', subcategory: 'tournament', impact_traveler: 'high', impact_note: 'Torneo de tenis más prestigioso. Alta demanda en Londres', city: 'Londres', source: 'fallback' },
  { title: 'Rock in Rio', country: 'Brasil', code: 'br', start_date: monthDay(6, 5), end_date: monthDay(6, 14), category: 'festival', subcategory: 'music', impact_traveler: 'high', impact_note: 'Festival masivo en Río. 100.000 asistentes por día', city: 'Río de Janeiro', source: 'fallback' },

  // ===== JULIO =====
  { title: 'San Fermín', country: 'España', code: 'es', start_date: monthDay(7, 6), end_date: monthDay(7, 14), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Encierros de Pamplona. Riesgo físico y alcohol', city: 'Pamplona', source: 'fallback' },
  { title: 'Tomorrowland', country: 'Bélgica', code: 'be', start_date: monthDay(7, 17), end_date: monthDay(7, 26), category: 'festival', subcategory: 'music', impact_traveler: 'high', impact_note: 'Mayor festival de música electrónica. Boom, 400.000 asistentes', city: 'Boom', source: 'fallback' },
  { title: 'Tour de Francia', country: 'Francia', code: 'fr', start_date: monthDay(7, 4), end_date: monthDay(7, 26), category: 'sports', subcategory: 'cycling', impact_traveler: 'medium', impact_note: 'Cierre de carreteras durante 3 semanas', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Gran Bretaña', country: 'Reino Unido', code: 'gb', start_date: monthDay(7, 5), end_date: monthDay(7, 7), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Silverstone. 150.000 aficionados', city: 'Silverstone', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Hungría', country: 'Hungría', code: 'hu', start_date: monthDay(7, 19), end_date: monthDay(7, 21), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'GP de Budapest', city: 'Budapest', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Bélgica', country: 'Bélgica', code: 'be', start_date: monthDay(7, 26), end_date: monthDay(7, 28), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Spa-Francorchamps', city: 'Spa', source: 'fallback' },
  { title: 'Running of the Bulls (EE.UU.)', country: 'EE.UU.', code: 'us', start_date: monthDay(7, 12), end_date: monthDay(7, 14), category: 'festival', subcategory: 'cultural', impact_traveler: 'low', impact_note: 'Versión americana en Vegas', city: 'Las Vegas', source: 'fallback' },

  // ===== AGOSTO =====
  { title: 'La Tomatina', country: 'España', code: 'es', start_date: monthDay(8, 26), end_date: monthDay(8, 26), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Batalla de tomates. 20.000 personas en Buñol', city: 'Buñol', source: 'fallback' },
  { title: 'Obon (Festival de los Ancestros)', country: 'Japón', code: 'jp', start_date: monthDay(8, 13), end_date: monthDay(8, 16), category: 'cultural', subcategory: 'festivity', impact_traveler: 'medium', impact_note: 'Vacaciones nacionales. Transporte abarrotado', city: null, source: 'fallback' },
  { title: 'Edinburgh Fringe Festival', country: 'Reino Unido', code: 'gb', start_date: monthDay(8, 5), end_date: monthDay(8, 31), category: 'festival', subcategory: 'arts', impact_traveler: 'medium', impact_note: 'Mayor festival de artes escénicas del mundo', city: 'Edimburgo', source: 'fallback' },
  { title: 'Día de la Independencia de la India', country: 'India', code: 'in', start_date: monthDay(8, 15), end_date: monthDay(8, 15), category: 'holiday', subcategory: 'national', impact_traveler: 'high', impact_note: 'Fiesta nacional india. Desfiles y celebraciones', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Países Bajos', country: 'Países Bajos', code: 'nl', start_date: monthDay(8, 23), end_date: monthDay(8, 25), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Zandvoort. Ambiente naranja masivo', city: 'Zandvoort', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Italia', country: 'Italia', code: 'it', start_date: monthDay(8, 30), end_date: monthDay(9, 1), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Monza. Tifosi masivos', city: 'Monza', source: 'fallback' },
  { title: 'Sailing: Copa América (final)', country: 'España', code: 'es', start_date: monthDay(8, 1), end_date: monthDay(8, 31), category: 'sports', subcategory: 'sailing', impact_traveler: 'medium', impact_note: 'Final de la Copa América en Barcelona', city: 'Barcelona', source: 'fallback' },

  // ===== SEPTIEMBRE =====
  { title: 'Oktoberfest', country: 'Alemania', code: 'de', start_date: monthDay(9, 19), end_date: monthDay(10, 4), category: 'festival', subcategory: 'cultural', impact_traveler: 'high', impact_note: 'Reserva con 6 meses. Múnich colapsado', city: 'Múnich', source: 'fallback' },
  { title: 'Burning Man', country: 'EE.UU.', code: 'us', start_date: monthDay(9, 1), end_date: monthDay(9, 8), category: 'festival', subcategory: 'cultural', impact_traveler: 'medium', impact_note: 'Desierto de Nevada. Condiciones extremas', city: 'Black Rock Desert', source: 'fallback' },
  { title: 'Fiesta Nacional de México (Grito)', country: 'México', code: 'mx', start_date: monthDay(9, 15), end_date: monthDay(9, 16), category: 'holiday', subcategory: 'national', impact_traveler: 'high', impact_note: 'Fiesta nacional mexicana. Ciudades abarrotadas', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Azerbaiyán', country: 'Azerbaiyán', code: 'az', start_date: monthDay(9, 13), end_date: monthDay(9, 15), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Circuito callejero en Bakú', city: 'Bakú', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Singapur', country: 'Singapur', code: 'sg', start_date: monthDay(9, 20), end_date: monthDay(9, 22), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Carrera nocturna. Singapur abarrotado', city: 'Singapur', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Estados Unidos (Austin)', country: 'EE.UU.', code: 'us', start_date: monthDay(9, 27), end_date: monthDay(9, 29), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'COTA. Ambiente texano. 150.000 asistentes', city: 'Austin', source: 'fallback' },

  // ===== OCTUBRE =====
  { title: 'Web Summit', country: 'Portugal', code: 'pt', start_date: monthDay(10, 5), end_date: monthDay(10, 8), category: 'conference', subcategory: 'technology', impact_traveler: 'high', impact_note: '70.000 asistentes en Lisboa. Hoteles llenos', city: 'Lisboa', source: 'fallback' },
  { title: 'Día de Muertos', country: 'México', code: 'mx', start_date: monthDay(10, 31), end_date: monthDay(11, 2), category: 'cultural', subcategory: 'festivity', impact_traveler: 'high', impact_note: 'Ofrendas y desfiles. Turismo masivo', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de México', country: 'México', code: 'mx', start_date: monthDay(10, 25), end_date: monthDay(10, 27), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Ambiente increíble. Foro Sol lleno', city: 'Ciudad de México', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de São Paulo', country: 'Brasil', code: 'br', start_date: monthDay(10, 1), end_date: monthDay(10, 3), category: 'sports', subcategory: 'motorsport', impact_traveler: 'medium', impact_note: 'Interlagos. Afición apasionada', city: 'São Paulo', source: 'fallback' },
  { title: 'Maratón de Nueva York', country: 'EE.UU.', code: 'us', start_date: monthDay(10, 4), end_date: monthDay(10, 4), category: 'sports', subcategory: 'marathon', impact_traveler: 'medium', impact_note: 'Calles cortadas en Manhattan', city: 'Nueva York', source: 'fallback' },

  // ===== NOVIEMBRE =====
  { title: 'Diwali (Festival de las Luces)', country: 'India', code: 'in', start_date: monthDay(11, 14), end_date: monthDay(11, 18), category: 'religious', subcategory: 'hindu', impact_traveler: 'high', impact_note: 'Fuegos artificiales y luces por toda la India', city: null, source: 'fallback' },
  { title: 'Diwali (Singapur)', country: 'Singapur', code: 'sg', start_date: monthDay(11, 14), end_date: monthDay(11, 18), category: 'religious', subcategory: 'hindu', impact_traveler: 'medium', impact_note: 'Little India iluminada', city: null, source: 'fallback' },
  { title: 'Diwali (Nepal)', country: 'Nepal', code: 'np', start_date: monthDay(11, 14), end_date: monthDay(11, 18), category: 'religious', subcategory: 'hindu', impact_traveler: 'medium', impact_note: 'Tihar (versión nepalí de Diwali)', city: null, source: 'fallback' },
  { title: 'Loi Krathong (Festival de las Linternas)', country: 'Tailandia', code: 'th', start_date: monthDay(11, 23), end_date: monthDay(11, 25), category: 'cultural', subcategory: 'festivity', impact_traveler: 'high', impact_note: 'Linternas flotantes. Ciudades abarrotadas', city: null, source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Las Vegas', country: 'EE.UU.', code: 'us', start_date: monthDay(11, 20), end_date: monthDay(11, 22), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Carrera nocturna en el Strip de Las Vegas', city: 'Las Vegas', source: 'fallback' },
  { title: 'Fórmula 1: Gran Premio de Abu Dabi', country: 'Emiratos Árabes', code: 'ae', start_date: monthDay(11, 28), end_date: monthDay(11, 30), category: 'sports', subcategory: 'motorsport', impact_traveler: 'high', impact_note: 'Cierre de temporada. Gran premio nocturno', city: 'Abu Dabi', source: 'fallback' },
  { title: 'COP31 (Cumbre del Clima)', country: 'Australia', code: 'au', start_date: monthDay(11, 9), end_date: monthDay(11, 20), category: 'conference', subcategory: 'climate', impact_traveler: 'medium', impact_note: 'Cumbre climática de la ONU. Delegaciones mundiales', city: null, source: 'fallback' },

  // ===== DICIEMBRE =====
  { title: 'Mercados Navideños (Alemania)', country: 'Alemania', code: 'de', start_date: monthDay(12, 1), end_date: monthDay(12, 24), category: 'cultural', subcategory: 'christmas', impact_traveler: 'high', impact_note: 'Christkindlmarkt en Núremberg. Ciudades abarrotadas', city: null, source: 'fallback' },
  { title: 'Mercados Navideños (Viena)', country: 'Austria', code: 'at', start_date: monthDay(12, 1), end_date: monthDay(12, 24), category: 'cultural', subcategory: 'christmas', impact_traveler: 'medium', impact_note: 'Mercados navideños vieneses. Mucho turista', city: 'Viena', source: 'fallback' },
  { title: 'Año Nuevo en Sídney', country: 'Australia', code: 'au', start_date: monthDay(12, 31), end_date: monthDay(12, 31), category: 'festival', subcategory: 'new_year', impact_traveler: 'high', impact_note: 'Mayor espectáculo de fuegos artificiales del mundo', city: 'Sídney', source: 'fallback' },
  { title: 'Fiesta de Fin de Año (Times Square)', country: 'EE.UU.', code: 'us', start_date: monthDay(12, 31), end_date: monthDay(12, 31), category: 'festival', subcategory: 'new_year', impact_traveler: 'high', impact_note: 'Millones en Times Square. NYC colapsada', city: 'Nueva York', source: 'fallback' },
  { title: 'Navidad en el Vaticano', country: 'Vaticano', code: 'va', start_date: monthDay(12, 24), end_date: monthDay(12, 25), category: 'religious', subcategory: 'christmas', impact_traveler: 'high', impact_note: 'Misa del Gallo. Peregrinos de todo el mundo', city: 'Ciudad del Vaticano', source: 'fallback' },
  { title: 'Hogmanay (Año Nuevo Escocés)', country: 'Reino Unido', code: 'gb', start_date: monthDay(12, 30), end_date: monthDay(12, 31), category: 'festival', subcategory: 'new_year', impact_traveler: 'high', impact_note: 'Fiesta callejera masiva en Edimburgo', city: 'Edimburgo', source: 'fallback' },
];

export function getFallbackEvents(options?: {
  country?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): { data: FallbackEvent[]; count: number } {
  let filtered = EVENTS_FALLBACK;

  if (options?.country) {
    const code = options.country.toUpperCase();
    filtered = filtered.filter(e => e.code.toUpperCase() === code);
  }
  if (options?.category) {
    filtered = filtered.filter(e => e.category === options.category);
  }
  if (options?.startDate) {
    filtered = filtered.filter(e => e.start_date >= options.startDate!);
  }
  if (options?.endDate) {
    filtered = filtered.filter(e => e.start_date <= options.endDate!);
  }

  const count = filtered.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  const data = filtered.sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(offset, offset + limit);

  return { data, count };
}

export function getUpcomingFallbackEvents(country?: string, days = 30): { data: FallbackEvent[]; count: number } {
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  return getFallbackEvents({
    country,
    startDate: today,
    endDate: future,
    limit: 200,
  });
}
