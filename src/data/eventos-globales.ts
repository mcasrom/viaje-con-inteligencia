export interface GlobalEvent {
  name: string;
  country: string;
  flag: string;
  code: string;
  month: number;
  type: 'festival' | 'national' | 'cultural' | 'sports' | 'religious' | 'conference' | 'mega-event';
  description: string;
  impact: 'high' | 'medium' | 'low';
  priceImpact?: 'extreme' | 'high' | 'medium' | 'none';
  safetyNote?: string;
  istImpact?: number; // 0-35 puntos extra para el índice de saturación
}

export const GLOBAL_EVENTS: GlobalEvent[] = [
  // --- ENERO ---
  { name: 'Davos (Foro Económico Mundial)', country: 'Suiza', flag: '🇨🇭', code: 'ch', month: 1, type: 'conference', description: 'Cumbre global de líderes.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Cierres de calles y zonas restringidas.', istImpact: 30 },
  { name: 'Año Nuevo Chino (Lunar)', country: 'China', flag: '🇨🇳', code: 'cn', month: 1, type: 'cultural', description: 'La mayor migración humana del mundo.', impact: 'high', priceImpact: 'high', safetyNote: 'Transporte colapsado.', istImpact: 25 },

  // --- FEBRERO ---
  { name: 'Carnaval de Río', country: 'Brasil', flag: '🇧🇷', code: 'br', month: 2, type: 'festival', description: 'El mayor carnaval del mundo.', impact: 'high', priceImpact: 'high', safetyNote: 'Extrema precaución con robos.', istImpact: 30 },
  { name: 'Carnaval de Venecia', country: 'Italia', flag: '🇮🇹', code: 'it', month: 2, type: 'cultural', description: 'Máscaras y trajes históricos.', impact: 'high', priceImpact: 'high', istImpact: 30 },
  { name: 'MWC Barcelona (Mobile World Congress)', country: 'España', flag: '🇪🇸', code: 'es', month: 2, type: 'conference', description: 'El mayor evento tecnológico del mundo.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Hoteles al 200% de precio.', istImpact: 35 },
  { name: 'Mardi Gras', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 2, type: 'festival', description: 'Desfiles masivos en Nueva Orleans.', impact: 'high', priceImpact: 'high', istImpact: 20 },
  { name: 'Olimpiadas de Invierno 2026', country: 'Italia', flag: '🇮🇹', code: 'it', month: 2, type: 'mega-event', description: 'Milán-Cortina.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Seguridad reforzada.', istImpact: 35 },

  // --- MARZO ---
  { name: 'Holi', country: 'India', flag: '🇮🇳', code: 'in', month: 3, type: 'cultural', description: 'Festival de los colores.', impact: 'high', priceImpact: 'medium', istImpact: 15 },
  { name: 'Ramadán (Inicio aprox.)', country: 'Arabia Saudí', flag: '🇸🇦', code: 'sa', month: 3, type: 'religious', description: 'Mes sagrado.', impact: 'high', priceImpact: 'high', safetyNote: 'No comer/beber en público.', istImpact: 20 },
  { name: 'Fallas de Valencia', country: 'España', flag: '🇪🇸', code: 'es', month: 3, type: 'festival', description: 'Fuego, música y monumentos.', impact: 'high', priceImpact: 'high', istImpact: 25 },
  { name: 'St. Patrick\'s Day', country: 'Irlanda', flag: '🇮🇪', code: 'ie', month: 3, type: 'national', description: 'Celebración masiva.', impact: 'high', priceImpact: 'high', istImpact: 20 },

  // --- ABRIL ---
  { name: 'Songkran', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 4, type: 'cultural', description: 'Festival del agua.', impact: 'high', priceImpact: 'high', safetyNote: 'Alto índice de accidentes.', istImpact: 25 },
  { name: 'Semana Santa', country: 'España', flag: '🇪🇸', code: 'es', month: 4, type: 'religious', description: 'Procesiones y vacaciones.', impact: 'high', priceImpact: 'high', istImpact: 25 },
  { name: 'Cherry Blossom (Sakura)', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 4, type: 'cultural', description: 'Floración del cerezo.', impact: 'high', priceImpact: 'high', istImpact: 25 },

  // --- MAYO ---
  { name: 'Gran Premio de Mónaco (F1)', country: 'Mónaco', flag: '🇲🇨', code: 'mc', month: 5, type: 'sports', description: 'Evento más exclusivo de F1.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Precios x10.', istImpact: 35 },
  { name: 'Festival de Cannes', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 5, type: 'cultural', description: 'Festival Internacional de Cine.', impact: 'medium', priceImpact: 'high', istImpact: 15 },

  // --- JUNIO ---
  { name: 'Mundial de Fútbol 2026', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 6, type: 'mega-event', description: 'El mayor evento deportivo del mundo.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Saturación y estafas.', istImpact: 35 },
  { name: 'Glastonbury Festival', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 6, type: 'festival', description: 'Mayor festival de música.', impact: 'high', priceImpact: 'high', istImpact: 20 },
  { name: 'Inti Raymi', country: 'Perú', flag: '🇵🇪', code: 'pe', month: 6, type: 'cultural', description: 'Festival del Sol en Cusco.', impact: 'medium', priceImpact: 'high', istImpact: 20 },

  // --- JULIO ---
  { name: 'San Fermín', country: 'España', flag: '🇪🇸', code: 'es', month: 7, type: 'festival', description: 'Encierros de Pamplona.', impact: 'high', priceImpact: 'high', safetyNote: 'Riesgo físico y alcohol.', istImpact: 25 },
  { name: 'Gran Premio de Gran Bretaña (F1)', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 7, type: 'sports', description: 'Silverstone.', impact: 'high', priceImpact: 'high', istImpact: 15 },
  { name: 'Tour de France', country: 'Francia', flag: '🇫🇷', code: 'fr', month: 7, type: 'sports', description: 'Cierre de carreteras.', impact: 'medium', priceImpact: 'medium', safetyNote: 'Rutas alternativas.', istImpact: 10 },

  // --- AGOSTO ---
  { name: 'La Tomatina', country: 'España', flag: '🇪🇸', code: 'es', month: 8, type: 'festival', description: 'Batalla de tomates.', impact: 'high', priceImpact: 'medium', istImpact: 15 },
  { name: 'Obon', country: 'Japón', flag: '🇯🇵', code: 'jp', month: 8, type: 'cultural', description: 'Festival de los ancestros.', impact: 'medium', priceImpact: 'high', istImpact: 15 },
  { name: 'Edinburgh Fringe', country: 'Reino Unido', flag: '🇬🇧', code: 'gb', month: 8, type: 'cultural', description: 'Artes escénicas.', impact: 'medium', priceImpact: 'high', istImpact: 20 },

  // --- SEPTIEMBRE ---
  { name: 'Oktoberfest', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 9, type: 'festival', description: 'Cerveza en Múnich.', impact: 'high', priceImpact: 'extreme', safetyNote: 'Reserva con 6 meses.', istImpact: 35 },
  { name: 'Gran Premio de Italia (F1)', country: 'Italia', flag: '🇮🇹', code: 'it', month: 9, type: 'sports', description: 'Monza.', impact: 'high', priceImpact: 'high', istImpact: 15 },
  { name: 'Burning Man', country: 'EE.UU.', flag: '🇺🇸', code: 'us', month: 9, type: 'festival', description: 'Desierto de Nevada.', impact: 'medium', priceImpact: 'high', safetyNote: 'Condiciones extremas.', istImpact: 10 },

  // --- OCTUBRE ---
  { name: 'Web Summit', country: 'Portugal', flag: '🇵🇹', code: 'pt', month: 10, type: 'conference', description: 'Evento tecnológico en Lisboa.', impact: 'high', priceImpact: 'high', istImpact: 20 },
  { name: 'Gran Premio de México (F1)', country: 'México', flag: '🇲🇽', code: 'mx', month: 10, type: 'sports', description: 'Autódromo Hermanos Rodríguez.', impact: 'high', priceImpact: 'high', istImpact: 15 },
  { name: 'Día de Muertos', country: 'México', flag: '🇲🇽', code: 'mx', month: 10, type: 'cultural', description: 'Ofrendas.', impact: 'high', priceImpact: 'medium', istImpact: 15 },

  // --- NOVIEMBRE ---
  { name: 'Diwali', country: 'India', flag: '🇮🇳', code: 'in', month: 11, type: 'religious', description: 'Festival de las luces.', impact: 'high', priceImpact: 'medium', istImpact: 15 },
  { name: 'Loi Krathong', country: 'Tailandia', flag: '🇹🇭', code: 'th', month: 11, type: 'cultural', description: 'Linternas flotantes.', impact: 'medium', priceImpact: 'medium', istImpact: 15 },
  { name: 'Gran Premio de Abu Dabi (F1)', country: 'Emiratos Árabes', flag: '🇦🇪', code: 'ae', month: 11, type: 'sports', description: 'Cierre de temporada.', impact: 'high', priceImpact: 'extreme', istImpact: 25 },

  // --- DICIEMBRE ---
  { name: 'Mercados Navideños', country: 'Alemania', flag: '🇩🇪', code: 'de', month: 12, type: 'cultural', description: 'Christkindlmarkt.', impact: 'high', priceImpact: 'high', istImpact: 25 },
];
