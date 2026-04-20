import { paisesData, getPaisPorCodigo, NivelRiesgo } from '@/data/paises';
import { getAllPosts, PostMeta } from './posts';
import { getAllMAECAlerts } from './scraper/maec';

interface ChangeLog {
  fecha: string;
  pais: string;
  tipo: 'riesgo' | 'requisito' | 'info';
  descripcion: string;
  anterior?: string;
  nuevo?: string;
}

const changelog: ChangeLog[] = [];

export function registerChange(change: Omit<ChangeLog, 'fecha'>): void {
  changelog.push({
    ...change,
    fecha: new Date().toISOString(),
  });
  console.log(`[ChangeLog] ${change.pais}: ${change.descripcion}`);
}

export function getRecentChanges(days: number = 7): ChangeLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return changelog.filter(c => new Date(c.fecha) >= cutoff);
}

export function formatAlertMessage(pais: string, tipo: 'riesgo' | 'info' | 'urgente', mensaje: string): string {
  const emoji = {
    riesgo: '⚠️',
    info: 'ℹ️',
    urgente: '🚨',
  };
  
  return `${emoji[tipo]} *ALERTA: ${pais}*\n\n${mensaje}\n\n_Actualizado: ${new Date().toLocaleDateString('es-ES')}_\n\n🔗 https://viaje-con-inteligencia.vercel.app`;
}

export function generateRiskChangeAlert(
  paisCodigo: string,
  oldRisk: NivelRiesgo,
  newRisk: NivelRiesgo
): string {
  const pais = getPaisPorCodigo(paisCodigo);
  if (!pais) return '';
  
  const riskLabels: Record<NivelRiesgo, string> = {
    'sin-riesgo': 'Sin riesgo',
    'bajo': 'Riesgo bajo',
    'medio': 'Riesgo medio',
    'alto': 'Riesgo alto',
    'muy-alto': 'Riesgo muy alto',
  };
  
  const riskEmoji: Record<NivelRiesgo, string> = {
    'sin-riesgo': '🟢',
    'bajo': '🟡',
    'medio': '🟠',
    'alto': '🔴',
    'muy-alto': '⚫',
  };
  
  return `${riskEmoji[newRisk]} *CAMBIO DE RIESGO: ${pais.nombre}*\n\n` +
    `📊 Nivel anterior: ${riskEmoji[oldRisk]} ${riskLabels[oldRisk]}\n` +
    `📊 Nivel actual: ${riskEmoji[newRisk]} ${riskLabels[newRisk]}\n\n` +
    `${newRisk === 'alto' || newRisk === 'muy-alto' ? '🚨 Se desaconsejan viajes no esenciales.\n\n' : ''}` +
    `Verifica siempre en la web oficial del MAEC antes de viajar.\n\n` +
    `🔗 https://viaje-con-inteligencia.vercel.app/pais/${paisCodigo}`;
}

export const defaultAlerts = [
  {
    region: 'Europa',
    mensaje: 'Sin alertas activas para la zona Euro.',
    emoji: '🟢',
  },
  {
    region: 'América',
    mensaje: 'Verificar requisitos de entrada según país.',
    emoji: '🟡',
  },
  {
    region: 'Asia',
    mensaje: '某些地区需特别注意。Verificar alertas específicas.',
    emoji: '🟠',
  },
];

export async function generateWeeklyDigest(): Promise<string> {
  const paises = Object.values(paisesData);
  const altoRiesgo = paises.filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto');
  const recentPosts = getAllPosts({ sort: 'recent' }).slice(0, 5);
  
  let maecAlerts: { pais: string; nivelRiesgo: string }[] = [];
  try {
    maecAlerts = await getAllMAECAlerts();
  } catch (e) {
    console.error('[Newsletter] Error getting MAEC alerts:', e);
  }
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  let message = `📬 *RESUMEN SEMANAL - Viaje con Inteligencia*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📅 ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
  
  if (recentPosts.length > 0) {
    message += `📝 *Nuevos artículos esta semana:*\n`;
    recentPosts.forEach((post: PostMeta) => {
      const category = post.category || 'Artículo';
      message += `• ${post.title} [${category}]\n`;
    });
    message += `\n`;
  }
  
  if (altoRiesgo.length > 0 || maecAlerts.length > 0) {
    message += `⚠️ *Países con riesgo (MAEC en tiempo real):*\n`;
    const allRisk = [
      ...altoRiesgo.map(p => ({ pais: p.nombre, nivel: p.nivelRiesgo as string })),
      ...maecAlerts.map(a => ({ pais: a.pais, nivel: a.nivelRiesgo }))
    ];
    const uniqueRisk = allRisk.filter((v, i, a) => a.findIndex(t => t.pais === v.pais) === i);
    uniqueRisk.slice(0, 10).forEach(p => {
      const emoji = p.nivel === 'alto' || p.nivel === 'muy-alto' ? '🔴' : '🟠';
      message += `${emoji} ${p.pais}\n`;
    });
    message += `\n`;
  }
  
  message += `💡 *Consejo:*\n`;
  message += `Revisa siempre los requisitos en la web oficial del MAEC antes de viajar.\n\n`;
  message += `🔗 *Links útiles:*\n`;
  message += `📰 Blog: https://viaje-con-inteligencia.vercel.app/blog\n`;
  message += `🤖 Bot IA: @ViajeConInteligenciaBot\n`;
  message += `🗺️ Mapa: https://viaje-con-inteligencia.vercel.app\n\n`;
  message += `✨ *Viaja con inteligencia!*`;
  
  return message;
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

export function registerInitialData(): void {
  console.log(`[Init] Cargados ${Object.keys(paisesData).length} países`);
  console.log(`[Init] Alertas registradas: 0`);
}
