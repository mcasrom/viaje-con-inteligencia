import { createLogger } from '@/lib/logger';
import { getTodosLosPaises } from '@/data/paises';
import { supabaseAdmin } from '@/lib/supabase-admin';

const log = createLogger('DailyTG');

const TIPS = [
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
];

const RISK_EMOJI: Record<string, string> = {
  'sin-riesgo': '🟢',
  'bajo': '🟡',
  'medio': '🟠',
  'alto': '🔴',
  'muy-alto': '⚫',
};

const RISK_LABELS: Record<string, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
};

function getTipOfDay(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[dayOfYear % TIPS.length];
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
}

export async function buildDailyPost(): Promise<DailyPost | null> {
  try {
    const paises = getTodosLosPaises().filter(p => p.visible !== false && p.nivelRiesgo);
    if (paises.length === 0) return null;

    const seed = getSeed();
    const countryIndex = seed % paises.length;
    const pais = paises[countryIndex];

    const riskEmoji = RISK_EMOJI[pais.nivelRiesgo] || '❓';
    const riskLabel = RISK_LABELS[pais.nivelRiesgo] || pais.nivelRiesgo;

    return {
      text: [
        `🌍 *País del día: ${pais.nombre}*`,
        ``,
        `${riskEmoji} Riesgo: *${riskLabel}*`,
        `📍 ${pais.continente} · ${pais.capital || ''}`,
        `🔗 https://www.viajeinteligencia.com/pais/${pais.codigo}`,
        ``,
        getTipOfDay(),
      ].join('\n'),
      countryEmoji: pais.bandera || '🌍',
      countryName: pais.nombre,
      riskEmoji,
      riskLabel,
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
