'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Star, Shield, TrendingUp, Clock, ExternalLink, Loader2, Sparkles, Plane, DollarSign, Heart, AlertCircle, BookOpen, Utensils, Camera, Compass, Globe, CheckCircle } from 'lucide-react';
import { paisesData } from '@/data/paises';
import { travelAttributes as clusteringAttrs } from '@/data/clustering';

const INTEREST_ROUTES: Record<string, { label: string; emoji: string; routes: string[]; apiPreferencia?: string }> = {
  playa: { label: 'Playa', emoji: '🏖️', routes: ['faros', 'costa'], apiPreferencia: 'playa' },
  cultural: { label: 'Cultura', emoji: '🏛️', routes: ['molinos', 'patrimonio'], apiPreferencia: 'cultural' },
  naturaleza: { label: 'Naturaleza', emoji: '🏔️', routes: ['murcia', 'norte', 'pirineos'], apiPreferencia: 'naturaleza' },
  gastronomia: { label: 'Gastronomía', emoji: '🍽️', routes: ['vino', 'norte'], apiPreferencia: 'cultural' },
  vino: { label: 'Vino', emoji: '🍷', routes: ['vino'], apiPreferencia: 'cultural' },
  aventura: { label: 'Aventura', emoji: '🧗', routes: ['pirineos', 'murcia', 'norte'], apiPreferencia: 'naturaleza' },
};

const ROUTES_INFO: Record<string, { name: string; desc: string; color: string; icon: string }> = {
  molinos: { name: 'Ruta de los Molinos', desc: 'La Mancha, 450km', color: 'from-amber-600 to-orange-600', icon: '🌬️' },
  faros: { name: 'Ruta de los Faros', desc: 'Costa España, 2100km', color: 'from-cyan-600 to-blue-600', icon: '🌅' },
  murcia: { name: 'Ruta de Murcia', desc: 'Interior, 280km', color: 'from-emerald-600 to-teal-600', icon: '🏔️' },
  vino: { name: 'Rutas del Vino', desc: '8 regiones DO, 1200km', color: 'from-red-600 to-rose-600', icon: '🍷' },
  pirineos: { name: 'Ruta de Nieve', desc: 'Pirineos, 350km', color: 'from-blue-600 to-indigo-600', icon: '🏔️' },
  costa: { name: 'Best Beaches', desc: 'Costa del Sol, 300km', color: 'from-yellow-500 to-orange-600', icon: '🏖️' },
  norte: { name: 'Gran Ruta Verde', desc: 'Costa Cantábrica, 800km', color: 'from-green-600 to-emerald-600', icon: '🌲' },
  patrimonio: { name: 'Ciudades Patrimonio', desc: 'Centro, 600km', color: 'from-purple-600 to-violet-600', icon: '🏛️' },
};

const countryItineraries: Record<string, { title: string; days: { day: number; title: string; activities: string[] }[]; tips: string[]; budget: string; bestTime: string; transport: string; highlights: string[] }> = {
  ma: {
    title: 'Itinerario clásico por Marruecos — 7 días',
    bestTime: 'Marzo-Mayo o Sept-Nov (evita verano extremo)',
    budget: '40-80€/día (medio) • 150€+ (premium)',
    transport: 'Tren ONCF entre ciudades, grands taxis, buses CTM',
    highlights: ['Marrakech (zoco, Jemaa el-Fnaa)', 'Desierto Sahara (Merzouga)', 'Chefchaouen (ciudad azul)', 'Fez (medina más grande del mundo)', 'Essaouira (pueblo costero)'],
    tips: ['Regatear en zocos es esperado — empieza al 50% del precio pedido', 'No beber agua del grifo, solo embotellada', 'Vestir con modestia fuera de zonas turísticas', 'Dirhams no se pueden cambiar fuera de Marruecos — cambia al salir'],
    days: [
      { day: 1, title: 'Marrakech — Llegada y primer contacto', activities: ['Llegada al aeropuerto Menara, traslado a Riad en Medina', 'Almuerzo en terraza con vistas a la Koutobia', 'Paseo por Jemaa el-Fnaa: narradores, músicos, puestos', 'Cena en restaurante tradicional con tajine'] },
      { day: 2, title: 'Marrakech — Zoco y monumentos', activities: ['Visita al Palacio Bahia (09:00, antes de multitudes)', 'Jardines de la Menara y olivares', 'Exploración del zoco: curtidurías, especias, alfombras', 'Almuerzo en café del barrio judío (Mellah)', 'Visita a la Mezquita Koutobia (exterior)', 'Atardecer desde terraza de Riad'] },
      { day: 3, title: 'Marrakech → Fez (viaje al interior)', activities: ['Salida temprana en tren/grand taxi hacia Fez (4-5h)', 'Parada en Meknes: Bab Mansour y granero real', 'Llegada a Fez, check-in en Riad de la Medina', 'Primer paseo por la medina de Fez (laberíntica)', 'Cena con pastela en restaurante con música andalusí'] },
      { day: 4, title: 'Fez — La joya cultural', activities: ['Visita a la Al-Qarawiyyin (biblioteca más antigua del mundo)', 'Taller de curtido de cuero en Chouara', 'Callejear por los zocos: cerámica, metal, textiles', 'Almuerzo en funduq (posada tradicional)', 'Visita al Palacio Real (Dar el-Makhzen)', 'Tour nocturno por la medina iluminada'] },
      { day: 5, title: 'Fez → Chefchaouen (la ciudad azul)', activities: ['Salida hacia Chefchaouen (3.5h por montañas del Rif)', 'Llegada y paseo por las calles azules', 'Almuerzo con tagine de cordero y ciruelas', 'Visita a la kasbah y museo etnográfico', 'Fotografía al atardecer desde el mirador español', 'Noche tranquila en la medina'] },
      { day: 6, title: 'Chefchaouen → Tanger → Essaouira', activities: ['Mañana libre en Chefchaouen (compras de artesanía)', 'Viaje a Tanger (2h) por la costa mediterránea', 'Parada en Tanger: Café Hafa, Gran Socco', 'Continuar a Essaouira por la costa atlántica (5h)', 'Paseo por la medina costera de Essaouira', 'Cena de pescado fresco en el puerto'] },
      { day: 7, title: 'Essaouira — Costa y despedida', activities: ['Amanecer en la playa de Essaouira', 'Visita al puerto: barcos azules, secado de sardinas', 'Paseo por las murallas portuguesas (Skala)', 'Surf o paseo a caballo por la playa', 'Almuerzo con langosta fresca en el puerto', 'Traslado al aeropuerto de Marrakech (3h) o regreso'] },
    ],
  },
  fr: {
    title: 'Itinerario clásico por Francia — 7 días',
    bestTime: 'Abril-Junio o Sept-Oct (evita agosto en París)',
    budget: '80-150€/día (medio) • 250€+ (premium)',
    transport: 'TGV entre ciudades, metro en París, regional TER',
    highlights: ['París (Torre Eiffel, Louvre, Montmartre)', 'Versalles (palacio y jardines)', 'Lyon (capital gastronómica)', 'Mont Saint-Michel'],
    tips: ['Museum Pass de París ahorra si visitas 3+ museos', 'Reserva restaurante con semanas de antelación en Lyon', 'Evita taxis en aeropuertos — RER/Orlyval son más económicos', 'Propina no obligatoria (service compris) pero appreciated'],
    days: [
      { day: 1, title: 'París — Llegada y primer paseo', activities: ['Llegada a CDG/Orly, RER al centro', 'Check-in en hotel (quartier Latin o Marais)', 'Paseo por la Île de la Cité: Notre-Dame, Sainte-Chapelle', 'Cena en bistró del Barrio Latino'] },
      { day: 2, title: 'París — Monumentos icónicos', activities: ['09:00 Torre Eiffel (reserva previa para subir)', 'Paseo por Champ de Mars hacia Trocadéro', 'Crucero por el Sena (1h, panorámico)', 'Almuerzo en Café de Flore (Saint-Germain)', 'Museo del Louvre (ala principal: Mona Lisa, Venus de Milo)', 'Montmartre al atardecer: Sacré-Cœur, Place du Tertre'] },
      { day: 3, title: 'París — Versalles y cultura', activities: ['Tren RER C a Versalles (30min)', 'Palacio de Versalles: State Apartments, Hall of Mirrors', 'Jardines de Versalles: fuentes musicales (domingos)', 'Almuerzo en mercado de Versalles', 'Regreso a París, Musée d\'Orsay (Impresionistas)', 'Cena en barrio Marais'] },
      { day: 4, title: 'París → Lyon (TGV 2h)', activities: ['Mañana: barrio Le Marais (shopping, Place des Vosges)', 'TGV a Lyon Part-Dieu', 'Check-in en hotel (Presqu\'île o Vieux Lyon)', 'Paseo por Vieux Lyon: traboules, catedral St-Jean', 'Cena en bouchon lyonnais (cocina tradicional)'] },
      { day: 5, title: 'Lyon — Capital gastronómica', activities: ['Mercado de Les Halles de Lyon Paul Bocuse', 'Colina de Fourvière: basílica y vistas panorámicas', 'Almuerzo con quenelles y saucisson de Lyon', 'Parc de la Tête d\'Or (lago, rosaleda)', 'Tour gastronómico: degustación de quesos y vinos', 'Cena en restaurante con estrella Michelin'] },
      { day: 6, title: 'Lyon → Mont Saint-Michel', activities: ['Tren a Pontorson con transbordo en Rennes', 'Llegada a Mont Saint-Michel', 'Visita a la abadía (subida por calle principal)', 'Almuerzo con ostras y sidra normanda', 'Paseo por la bahía con guía (mareas)', 'Noche en hotel en la isla o alrededores'] },
      { day: 7, title: 'Mont Saint-Michel → París — Regreso', activities: ['Amanecer en la bahía (marea baja, foto icónica)', 'Último paseo por la abadía', 'Regreso a París (tren ~3.5h)', 'Tarde libre: compras en Galeries Lafayette', 'Cena de despedida en crucero por el Sena'] },
    ],
  },
  it: {
    title: 'Itinerario clásico por Italia — 7 días',
    bestTime: 'Abril-Mayo o Sept-Oct (evita julio-agosto)',
    budget: '70-130€/día (medio) • 200€+ (premium)',
    transport: 'Trenes Frecciarossa/Italo entre ciudades, vaporetto en Venecia',
    highlights: ['Roma (Coliseo, Vaticano, Fontana di Trevi)', 'Florencia (Uffizi, Duomo, Ponte Vecchio)', 'Venecia (San Marcos, Rialto, Murano)'],
    tips: ['Roma Pass incluye transporte y 2 museos', 'Nunca comer cerca del Coliseo (turístico y caro)', 'Reserva Uffizi y Coliseo online con semanas de antelación', 'En Venecia: come donde comen los locales (Cannaregio)'],
    days: [
      { day: 1, title: 'Roma — Llegada y centro histórico', activities: ['Llegada a Fiumicino, Leonardo Express a Termini', 'Check-in en hotel (Trastevere o Centro Storico)', 'Paseo: Fontana di Trevi, Panteón, Piazza Navona', 'Cena en trattoria de Trastevere'] },
      { day: 2, title: 'Roma — Antigüedad', activities: ['08:30 Coliseo (reserva previa, primera hora)', 'Foro Romano y Palatino', 'Almuerzo en Monti (barrio hipster)', 'Basilica di San Pietro in Vincoli (Moisés de Miguel Ángel)', 'Piazza del Popolo y Villa Borghese', 'Atardecer en Gianicolo (vistas panorámicas)'] },
      { day: 3, title: 'Roma — Vaticano', activities: ['07:30 Museos del Vaticano (abren 09:00, ir temprano)', 'Capilla Sixtina y Basílica de San Pedro', 'Almuerzo en Borgo Pio (cerca del Vaticano)', 'Castel Sant\'Angelo', 'Tarde libre: shopping Via del Corso', 'Cena en Testaccio (barrio gastronómico)'] },
      { day: 4, title: 'Roma → Florencia (Tren 1.5h)', activities: ['Tren Frecciarossa a Florencia SMN', 'Check-in, Duomo: Brunelleschi y cúpula', 'Ponte Vecchio y Palazzo Vecchio', 'Almuerzo con bistecca alla fiorentina', 'Galería Uffizi (Botticelli, Da Vinci, Caravaggio)', 'Piazzale Michelangelo al atardecer (vistas)'] },
      { day: 5, title: 'Florencia — Arte y Toscana', activities: ['Mercado de San Lorenzo: cuero, artesanía', 'Galería Accademia: David de Miguel Ángel', 'Almuerzo con lampredotto (street food local)', 'Excursión a Siena o Pisa (tren regional 1-1.5h)', 'Regreso a Florencia, paseo nocturno por el centro', 'Cena en osteria con vino Chianti'] },
      { day: 6, title: 'Florencia → Venecia (Tren 2h)', activities: ['Tren Italo a Venecia Santa Lucia', 'Vaporetto al hotel (Grand Canal)', 'Piazza San Marcos: Basílica, Campanile, Palacio Ducal', 'Almuerzo con cicchetti en Rialto', 'Paseo por barrios Dorsoduro y Cannaregio', 'Góndola al atardecer (o traghetti económico)'] },
      { day: 7, title: 'Venecia — Islas y despedida', activities: ['Excursión a Murano (vidrio soplado) y Burano (casas coloridas)', 'Almuerzo con risotto al nero di seppia en Burano', 'Regreso a Venecia, última caminata', 'Shopping: máscaras, vidrio de Murano', 'Traslado al aeropuerto Marco Polo'] },
    ],
  },
  pt: {
    title: 'Itinerario clásico por Portugal — 7 días',
    bestTime: 'Marzo-Junio o Sept-Oct',
    budget: '50-100€/día (medio) • 150€+ (premium)',
    transport: 'Tren Alfa Pendular, metro en Lisboa/Oporto, tranvía',
    highlights: ['Lisboa (Alfama, Belém, Sintra)', 'Oporto (Ribeira, bodegas, Duero)', 'Sintra (Palacio da Pena)'],
    tips: ['Lisboa Card incluye transporte y museos', 'Prueba pastel de nata en Belém (fábrica original)', 'Oporto: cata de vino de Oporto en Vila Nova de Gaia', 'Sintra: ve entre semana, fin de semana imposible'],
    days: [
      { day: 1, title: 'Lisboa — Alfama y Baixa', activities: ['Llegada al aeropuerto, metro al centro', 'Check-in en hotel (Chiado o Bairro Alto)', 'Paseo por Alfama: castillo de São Jorge, miradouros', 'Almuerzo con bacalhau en tasca local', 'Tranvía 28 por el centro histórico', 'Cena con fado en restaurante de Alfama'] },
      { day: 2, title: 'Lisboa — Belém y modernidad', activities: ['Torre de Belém y Monasterio dos Jerónimos', 'Pastéis de Belém (original desde 1837)', 'Museo de Coches o MAAT', 'Almuerzo en Mercado da Ribeira (Time Out)', 'Parque das Nações: Oceanário, teleférico', 'Cena en Parque das Nações'] },
      { day: 3, title: 'Sintra — Día mágico', activities: ['Tren de Rossio a Sintra (40min)', 'Palacio da Pena (llegar a las 09:00)', 'Quinta da Regaleira: pozos iniciáticos y jardines', 'Almuerzo con travesseiros en Sintra', 'Cabo da Roca: punto más occidental de Europa', 'Playa de Cascais al atardecer'] },
      { day: 4, title: 'Lisboa → Oporto (Tren 3h)', activities: ['Mañana libre en Lisboa (shopping Chiado)', 'Tren Alfa Pendular a Oporto', 'Check-in en hotel (Ribeira o Cedofeita)', 'Paseo por la Ribeira: puente Dom Luís', 'Cena con francesinha (sándwich típico)'] },
      { day: 5, title: 'Oporto — Ciudad y vino', activities: ['Estación São Bento: azulejos', 'Librería Lello (reserva previa)', 'Clerigos Tower: vistas panorámicas', 'Almuerzo en Mercado do Bolhão', 'Cruce a Vila Nova de Gaia: cata en bodega de Oporto', 'Crucero por los 6 puentes del Duero'] },
      { day: 6, title: 'Oporto — Duero o costa', activities: ['Excursión al Valle del Duero (tren o tour)', 'Viñedos en terrazas, almuerzo en quinta', 'Regreso a Oporto, praia da Foz do Douro', 'Atardecer en la costa atlántica', 'Cena de despedida con marisco'] },
      { day: 7, title: 'Oporto — Despedida', activities: ['Mercado de Matosinhos: pescado fresco', 'Jardines del Palácio de Cristal', 'Últimas compras: azulejos, vino de Oporto', 'Traslado al aeropuerto'] },
    ],
  },
  jp: {
    title: 'Itinerario clásico por Japón — 10 días',
    bestTime: 'Marzo-Mayo (cerezo) o Sept-Nov (otoño)',
    budget: '100-200€/día (medio) • 300€+ (premium)',
    transport: 'JR Pass (Shinkansen), metro en Tokio/Osaka, autobuses locales',
    highlights: ['Tokio (Shibuya, Senso-ji, Akihabara)', 'Kioto (templos, Arashiyama, Fushimi Inari)', 'Osaka (street food, castillo)', 'Nara (ciervos, Todai-ji)'],
    tips: ['JR Pass 7 días se amortiza con Tokio-Kioto ida y vuelta', 'Suica/PASMO para transporte local en todo el país', 'Comebini (7-Eleven, Lawson, FamilyMart) son buenos y baratos', 'Onsen: lava antes de entrar, sin tatuajes visibles'],
    days: [
      { day: 1, title: 'Tokio — Llegada y Shibuya', activities: ['Llegada a Narita/Haneda, Narita Express a Tokio', 'Check-in en hotel (Shinjuku o Shibuya)', 'Cruce de Shibuya: el más famoso del mundo', 'Cena con ramen en Ichiran (experiencia individual)', 'Paseo nocturno por Shibuya: Hachiko, Center Gai'] },
      { day: 2, title: 'Tokio — Tradición y modernidad', activities: ['Templo Senso-ji en Asakusa (temprano)', 'Cruza el río Sumida: Tokyo Skytree', 'Almuerzo con sushi en Tsukiji Outer Market', 'Akihabara: electrónica, anime, manga', 'Harajuku: Takeshita Street, cultura kawaii', 'Meiji Jingu: santuario en el bosque'] },
      { day: 3, title: 'Tokio — Cultura y vistas', activities: ['Museo Nacional de Tokio (Ueno)', 'Parque Ueno: templos, lago, cerezos', 'Almuerzo con tempura en Nihonbashi', 'Ginza: shopping, galerías, arquitectura', 'TeamLab Borderless (arte digital inmersivo)', 'Cena con yakitori en Omoide Yokocho'] },
      { day: 4, title: 'Tokio → Kioto (Shinkansen 2.5h)', activities: ['Shinkansen a Kioto (compra ekiben en la estación)', 'Check-in en ryokan (posada tradicional)', 'Fushimi Inari: 10,000 torii (al atardecer)', 'Almuerzo con tofu en Higashiyama', 'Calle Gion: geishas y maikos', 'Cena kaiseki (alta cocina japonesa)'] },
      { day: 5, title: 'Kioto — Templos y jardines', activities: ['Kinkaku-ji (Templo Dorado)', 'Ryoan-ji: jardín zen de piedras', 'Almuerzo con soba en la zona', 'Arashiyama: bosque de bambú, templo Tenryu-ji', 'Puente Togetsukyo sobre el río Hozu', 'Atardecer en el mirador de Arashiyama'] },
      { day: 6, title: 'Kioto → Nara → Osaka', activities: ['Tren a Nara (45min): Parque de los Ciervos', 'Todai-ji: Gran Buda de bronce (15m)', 'Almuerzo con mochi en Nara', 'Tren a Osaka (40min)', 'Dotonbori: carteles neón, street food', 'Cena con takoyaki y okonomiyaki'] },
      { day: 7, title: 'Osaka — Gastronomía y castillo', activities: ['Castillo de Osaka y parque', 'Almuerzo en Kuromon Ichiba Market', 'Acuario Kaiyukan (uno de los mejores del mundo)', 'Shinsekai: barrio retro con Tsutenkaku Tower', 'Paseo por Umeda: shopping, vistas desde Sky Building', 'Cena de despedida en Dotonbori'] },
      { day: 8, title: 'Osaka → Tokio — Regreso', activities: ['Shinkansen de regreso a Tokio', 'Mañana libre: compras de último momento', 'Akihabara o Nakano Broadway (souvenirs)', 'Última cena: teppanyaki o sukiyaki', 'Traslado al aeropuerto para vuelo'] },
    ],
  },
};

interface MLRecommendation {
  routeId: string;
  route: { name: string; desc: string; color: string; icon: string };
  score: number;
  reason: string;
  source: 'api' | 'local';
}

function DestinosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destino = searchParams.get('destino');
  const fechas = searchParams.get('fechas');
  const interes = searchParams.get('interes');
  const presupuesto = searchParams.get('presupuesto') || 'medio';

  const [mlRecommendations, setMlRecommendations] = useState<MLRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const paisData = destino ? paisesData[destino] : null;
  const matchedRoutes = interes ? INTEREST_ROUTES[interes]?.routes || [] : [];
  const isSpain = destino === 'es';

  // Fetch ML recommendations from API (only for Spain)
  useEffect(() => {
    if (!interes || !isSpain) return;

    setLoading(true);
    const apiPreferencia = INTEREST_ROUTES[interes]?.apiPreferencia || 'cultural';

    fetch(`/api/ai/recommend?preferencia=${apiPreferencia}&presupuesto=${presupuesto}&duracion=7&limit=5`)
      .then(res => res.json())
      .then(data => {
        if (data.recommendations && data.recommendations.length > 0) {
          const apiRecommendations: MLRecommendation[] = data.recommendations
            .filter((r: any) => {
              return matchedRoutes.some(routeId => {
                const routeInfo = ROUTES_INFO[routeId];
                return routeInfo && r.nombre?.toLowerCase().includes(routeInfo.name.toLowerCase().split(' ')[0]);
              });
            })
            .map((r: any, idx: number) => ({
              routeId: matchedRoutes[idx % matchedRoutes.length] || 'vino',
              route: ROUTES_INFO[matchedRoutes[idx % matchedRoutes.length]] || ROUTES_INFO['vino'],
              score: Math.min(98, 85 + Math.floor((data.recommendations.length - idx) * 3)),
              reason: `${r.nombre} ${r.bandera || ''} • Riesgo: ${r.nivelRiesgo || 'bajo'}`,
              source: 'api',
            }));

          if (apiRecommendations.length > 0) {
            setMlRecommendations(apiRecommendations);
          } else {
            setMlRecommendations(calculateLocalScores(matchedRoutes, interes));
          }
        } else {
          setMlRecommendations(calculateLocalScores(matchedRoutes, interes));
        }
      })
      .catch(() => {
        setMlRecommendations(calculateLocalScores(matchedRoutes, interes));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [interes, presupuesto, isSpain]);

  const calculateLocalScores = (routes: string[], int: string): MLRecommendation[] => {
    return routes
      .map((routeId) => {
        const route = ROUTES_INFO[routeId];
        if (!route) return null;

        let score = 70;
        let reason = 'Buena opción general';

        if (int === 'vino' && routeId === 'vino') { score = 98; reason = 'Match perfecto con tu interés'; }
        else if (int === 'gastronomia' && routeId === 'vino') { score = 92; reason = 'Excelente maridaje gastronómico'; }
        else if (int === 'playa' && routeId === 'faros') { score = 95; reason = 'Ruta costera ideal'; }
        else if (int === 'playa' && routeId === 'costa') { score = 96; reason = 'Las mejores playas'; }
        else if (int === 'cultural' && routeId === 'molinos') { score = 90; reason = 'Patrimonio histórico único'; }
        else if (int === 'cultural' && routeId === 'patrimonio') { score = 94; reason = 'Ciudades UNESCO'; }
        else if (int === 'naturaleza' && routeId === 'norte') { score = 91; reason = 'Naturaleza exuberante'; }
        else if (int === 'aventura' && routeId === 'pirineos') { score = 95; reason = 'Deportes de montaña'; }

        return { routeId, route, score, reason, source: 'local' as const };
      })
      .filter(Boolean) as MLRecommendation[];
  };

  const countryItin = destino ? countryItineraries[destino] : null;
  const attrs = destino ? clusteringAttrs[destino] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">✈️ Tu Viaje con Inteligencia</h1>
          <p className="text-emerald-100 text-lg">
            {paisData ? `${paisData.bandera} Análisis completo de ${paisData.nombre}` : 'Descubre tu destino ideal'}
          </p>
          {fechas && (
            <div className="flex items-center justify-center gap-2 mt-3 text-emerald-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fechas seleccionadas: {fechas}</span>
            </div>
          )}
        </div>

        {paisData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">Nivel de Riesgo</h3>
              </div>
              <div className={`text-2xl font-bold ${
                paisData.nivelRiesgo === 'sin-riesgo' ? 'text-emerald-400' :
                paisData.nivelRiesgo === 'bajo' ? 'text-amber-400' :
                paisData.nivelRiesgo === 'medio' ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {paisData.nivelRiesgo === 'sin-riesgo' ? '🟢 Sin riesgo' :
                 paisData.nivelRiesgo === 'bajo' ? '🟡 Riesgo bajo' :
                 paisData.nivelRiesgo === 'medio' ? '🟠 Riesgo medio' :
                 '🔴 Riesgo alto'}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">Mejor Época</h3>
              </div>
              <p className="text-slate-300">{countryItin ? countryItin.bestTime : paisData.turisticos?.temporadaAlta?.slice(0, 4).join(', ') || 'Todo el año'}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white">Destinos Top</h3>
              </div>
              <p className="text-slate-300">{countryItin ? countryItin.highlights.slice(0, 2).join(' • ') : paisData.turisticos?.destinosPopulares?.slice(0, 3).join(', ') || 'Varios'}</p>
            </div>
          </div>
        )}

        {/* SPAIN: Show Spanish routes */}
        {isSpain && matchedRoutes.length > 0 && interes && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Rutas recomendadas por IA para {INTEREST_ROUTES[interes]?.emoji} {INTEREST_ROUTES[interes]?.label}
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2 text-slate-400" />}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(loading ? [] : mlRecommendations)
                .sort((a, b) => b.score - a.score)
                .map(({ routeId, route, score, reason, source }) => (
                  <Link key={routeId} href={`/rutas?route=${routeId}`}>
                    <div className={`relative bg-gradient-to-r ${route.color} rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all group`}>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star className={`w-3 h-3 ${score >= 90 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        <span className={`font-bold text-sm ${score >= 90 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {score}% Match
                        </span>
                      </div>

                      {source === 'api' && (
                        <div className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-medium">IA</span>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <span className="text-3xl bg-white/10 p-2 rounded-lg">{route.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{route.name}</h3>
                          <p className="text-white/80 text-sm mt-1">{route.desc}</p>
                          
                          <div className="mt-3 flex items-center gap-2 text-xs text-white/70 bg-black/10 px-2 py-1 rounded-full inline-flex">
                            <span>🤖</span>
                            <span>{reason}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-white/60">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}

              {loading && (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-400">Calculando recomendaciones con IA...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NON-SPAIN: Show country-specific itinerary */}
        {!isSpain && paisData && countryItin && (
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-emerald-400" />
                {countryItin.title}
              </h2>
              <Link href={`/analisis?destino=${destino}`} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Ver ficha completa →
              </Link>
            </div>

            {/* Quick info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Presupuesto</h3>
                </div>
                <p className="text-slate-300 text-sm">{countryItin.budget}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Transporte</h3>
                </div>
                <p className="text-slate-300 text-sm">{countryItin.transport}</p>
              </div>
            </div>

            {/* Day-by-day itinerary */}
            <div className="space-y-3">
              {countryItin.days.map((day) => (
                <details key={day.day} className="group bg-slate-800 rounded-xl border border-slate-700 overflow-hidden" open={day.day <= 2}>
                  <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-700/50 transition-colors list-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      day.day === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' :
                      day.day === 2 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base">{day.title}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{day.activities.length} actividades</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                    <ul className="space-y-2 mt-2">
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>

            {/* Highlights */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border border-emerald-500/20">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Imprescindibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {countryItin.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Consejos prácticos
              </h3>
              <ul className="space-y-2">
                {countryItin.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-amber-400 flex-shrink-0">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Non-Spain without itinerary data: show basic info + link to analisis */}
        {!isSpain && paisData && !countryItin && (
          <div className="mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
              <Compass className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Itinerario detallado disponible</h3>
              <p className="text-slate-400 text-sm mb-4">
                Para {paisData.nombre}, consulta la ficha completa con itinerario día a día, presupuesto y recomendaciones.
              </p>
              <Link href={`/analisis?destino=${destino}`} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all">
                <BookOpen className="w-4 h-4" />
                Ver ficha de viaje →
              </Link>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/rutas"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-lg font-medium transition-all"
          >
            <Clock className="w-5 h-5" />
            Explorar todas las rutas temáticas
          </Link>
        </div>

        {!paisData && !interes && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Destinos Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(paisesData).slice(0, 12).map((p) => (
                <Link
                  key={p.codigo}
                  href={`/destinos?destino=${p.codigo}`}
                  className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-all border border-slate-700"
                >
                  <span className="text-3xl">{p.bandera}</span>
                  <p className="text-white font-medium mt-2 text-sm">{p.nombre}</p>
                  <p className="text-slate-400 text-xs mt-1">{p.capital}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DestinosClient() {
  return (
    <Suspense>
      <DestinosContent />
    </Suspense>
  );
}
