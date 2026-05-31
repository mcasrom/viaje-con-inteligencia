import { createLogger } from '@/lib/logger';
import { getTodosLosPaises } from '@/data/paises';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NOMBRES_EN } from '@/data/nombres-en';

const log = createLogger('DailyTG');

const TIPS: Record<'es' | 'en', string[]> = {
  es: [
    '🧳 *Tips de viaje:* Lleva siempre una copia digital de tu pasaporte y visado en la nube. Si pierdes el original, la copia acelera la gestión en la embajada.',
    '🆘 *Tips de viaje:* Antes de viajar, guarda en tu móvil el número de la embajada de España y el teléfono de emergencias local (112 en UE, 911 en EEUU, etc.).',
    '💳 *Tips financieros:* Notifica a tu banco los días que vas a estar fuera. Lleva siempre dos tarjetas distintas (Visa + Mastercard) por si una falla.',
    '📋 *Tips de viaje:* Comprueba que tu pasaporte tiene al menos 6 meses de validez. Muchos países deniegan la entrada si caduca antes. Usa el radar del sistema para saber los requisitos.',
    '🌡️ *Tips de viaje:* Revisa la estacionalidad del destino. Temporada de lluvias, monzón o huracanes pueden arruinar un viaje. El TCI del sistema te da el momento óptimo.',
    '🏥 *Tips sanitarios:* Algunas vacunas requieren 4-6 semanas antes del viaje (fiebre amarilla, hepatitis, tifoidea). Consulta con sanidad exterior al menos 2 meses antes.',
    '📡 *Tips OSINT:* Activa las alertas del país destino una semana antes del viaje. Los cambios de riesgo del MAEC pueden ocurrir sin previo aviso.',
    '🚑 *Tips de viaje:* El seguro de viaje no es un lujo. Una evacuación médica puede costar >50.000€. Compara coberturas en el sistema.',
    '🌍 *Tips de viaje:* Si viajas a múltiples países en un solo viaje, el país más restrictivo determina los requisitos de entrada (visado, vacunas, pasaporte).',
    '📱 *Tips de viaje:* Descarga Google Maps offline y el Traductor de Google offline antes de salir. Sin roaming sigues teniendo mapas y traducciones.',
    '🔌 *Tips de viaje:* Lleva un adaptador universal y una regleta. Un solo enchufe del país de origen + regleta carga todo: móvil, portátil, power bank.',
    '📸 *Tips de viaje:* Haz foto de tu equipaje facturado antes de entregarlo. Si se pierde, tienes prueba visual para la reclamación.',
  ],
  en: [
    '🧳 *Travel tip:* Always keep a digital copy of your passport and visa in the cloud. If you lose the original, the copy speeds up embassy processing.',
    '🆘 *Travel tip:* Before traveling, save your embassy\'s number and local emergency phone (112 in EU, 911 in US, etc.) on your mobile.',
    '💳 *Financial tip:* Notify your bank about your travel dates. Always carry two different cards (Visa + Mastercard) in case one fails.',
    '📋 *Travel tip:* Check that your passport has at least 6 months validity. Many countries deny entry if it expires sooner. Use the system radar for requirements.',
    '🌡️ *Travel tip:* Check the destination\'s seasonality. Rainy season, monsoon or hurricanes can ruin a trip. The system\'s TCI gives you the optimal time.',
    '🏥 *Health tip:* Some vaccines require 4-6 weeks before travel (yellow fever, hepatitis, typhoid). Consult with travel health at least 2 months ahead.',
    '📡 *OSINT tip:* Activate alerts for your destination country one week before travel. MAEC risk changes can happen without warning.',
    '🚑 *Travel tip:* Travel insurance is not a luxury. Medical evacuation can cost >€50,000. Compare coverage in the system.',
    '🌍 *Travel tip:* If traveling to multiple countries in one trip, the most restrictive country determines entry requirements (visa, vaccines, passport).',
    '📱 *Travel tip:* Download Google Maps offline and Google Translate offline before leaving. Without roaming you still have maps and translations.',
    '🔌 *Travel tip:* Bring a universal adapter and a power strip. One outlet from your home country + strip charges everything: phone, laptop, power bank.',
    '📸 *Travel tip:* Take a photo of your checked luggage before handing it over. If it\'s lost, you have visual proof for the claim.',
  ],
};

const RISK_EMOJI: Record<string, string> = {
  'sin-riesgo': '🟢',
  'bajo': '🟡',
  'medio': '🟠',
  'alto': '🔴',
  'muy-alto': '⚫',
};

const RISK_LABELS: Record<'es' | 'en', Record<string, string>> = {
  es: { 'sin-riesgo': 'Sin riesgo', 'bajo': 'Bajo', 'medio': 'Medio', 'alto': 'Alto', 'muy-alto': 'Muy alto' },
  en: { 'sin-riesgo': 'No risk', 'bajo': 'Low', 'medio': 'Medium', 'alto': 'High', 'muy-alto': 'Very high' },
};

const CONTINENT_EN: Record<string, string> = {
  'Europa': 'Europe', 'Asia': 'Asia', 'Africa': 'Africa', 'América': 'Americas',
  'Oceanía': 'Oceania', 'Oriente Medio': 'Middle East', 'Caribe': 'Caribbean',
};

function getTipOfDay(lang: 'es' | 'en'): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[lang][dayOfYear % TIPS[lang].length];
}

function getSeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate();
}

export interface DailyPost {
  text: string;
  countryEmoji: string;
  countryName: string;
  riskEmoji: string;
  riskLabel: string;
  lang: 'es' | 'en';
}

export async function buildDailyPost(lang: 'es' | 'en' = 'es'): Promise<DailyPost | null> {
  try {
    const paises = getTodosLosPaises().filter(p => p.visible !== false && p.nivelRiesgo);
    if (paises.length === 0) return null;

    const seed = getSeed();
    const countryIndex = seed % paises.length;
    const pais = paises[countryIndex];

    const riskEmoji = RISK_EMOJI[pais.nivelRiesgo] || '❓';
    const riskLabel = RISK_LABELS[lang][pais.nivelRiesgo] || pais.nivelRiesgo;
    const countryName = lang === 'en'
      ? (NOMBRES_EN[pais.codigo] || pais.nombre)
      : pais.nombre;
    const continent = lang === 'en'
      ? (CONTINENT_EN[pais.continente] || pais.continente)
      : pais.continente;

    const header = lang === 'en' ? `🌍 *Country of the day: ${countryName}*` : `🌍 *País del día: ${countryName}*`;
    const riskLine = lang === 'en' ? `${riskEmoji} Risk: *${riskLabel}*` : `${riskEmoji} Riesgo: *${riskLabel}*`;
    const locationLine = `📍 ${continent} · ${pais.capital || ''}`;
    const urlLine = `🔗 https://www.viajeinteligencia.com/pais/${pais.codigo}`;

    return {
      text: [
        header,
        '',
        riskLine,
        locationLine,
        urlLine,
        '',
        getTipOfDay(lang),
      ].join('\n'),
      countryEmoji: pais.bandera || '🌍',
      countryName,
      riskEmoji,
      riskLabel,
      lang,
    };
  } catch (err) {
    log.error('Error building daily post', err);
    return null;
  }
}

export async function publishDailyPost(post: DailyPost): Promise<boolean> {
  try {
    const { publishToTelegramChannel } = await import('@/lib/social-publisher');
    const ok = await publishToTelegramChannel(post.text);
    if (ok) log.info('Daily post published');
    return ok;
  } catch (err) {
    log.error('Error publishing daily post', err);
    return false;
  }
}
