import { paisesData, getPaisPorCodigo, NivelRiesgo } from '@/data/paises';

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

export function generateWeeklyDigest(): string {
  const changes = getRecentChanges(7);
  const paises = Object.values(paisesData);
  const altoRiesgo = paises.filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto');
  
  let message = `📊 *INFORME SEMANAL - Viaje con Inteligencia*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📅 Del ${new Date().toLocaleDateString('es-ES')} - Semana ${getWeekNumber()}\n\n`;
  
  if (altoRiesgo.length > 0) {
    message += `⚠️ *Países con riesgo alto:*\n`;
    altoRiesgo.forEach(p => {
      const emoji = p.nivelRiesgo === 'muy-alto' ? '🔴' : '🟠';
      message += `${emoji} ${p.bandera} ${p.nombre}\n`;
    });
    message += `\n`;
  }
  
  if (changes.length > 0) {
    message += `🔄 *Cambios recientes:*\n`;
    changes.slice(0, 5).forEach(c => {
      message += `• ${c.pais}: ${c.descripcion}\n`;
    });
    message += `\n`;
  }
  
  message += `💡 *Consejo de la semana:*\n`;
  message += `Antes de viajar, verifica siempre los requisitos actualizados `;
  message += `en la web oficial del MAEC.\n\n`;
  message += `🤖 @ViajeConInteligenciaBot | 🌐 viaje-con-inteligencia.vercel.app`;
  
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
