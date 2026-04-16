import { NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { generateRiskChangeAlert } from '@/lib/alerts-system';
import { NivelRiesgo } from '@/data/paises';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

interface RiskChange {
  code: string;
  oldRisk: NivelRiesgo;
  newRisk: NivelRiesgo;
}

const lastKnownRisks: Record<string, NivelRiesgo> = {};

async function sendToChannel(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('[Alert Check] Error:', error);
    return false;
  }
}

function checkForChanges(): RiskChange[] {
  const changes: RiskChange[] = [];
  
  for (const [code, pais] of Object.entries(paisesData)) {
    if (lastKnownRisks[code] && lastKnownRisks[code] !== pais.nivelRiesgo) {
      changes.push({
        code,
        oldRisk: lastKnownRisks[code],
        newRisk: pais.nivelRiesgo,
      });
    }
    lastKnownRisks[code] = pais.nivelRiesgo;
  }
  
  return changes;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Verificando alertas...');
    
    const changes = checkForChanges();
    
    if (changes.length > 0) {
      console.log(`[Cron] ${changes.length} cambios detectados`);
      
      for (const change of changes) {
        const alertMsg = generateRiskChangeAlert(change.code, change.oldRisk, change.newRisk);
        await sendToChannel(alertMsg);
      }
      
      return NextResponse.json({
        success: true,
        changes: changes.length,
        details: changes,
        timestamp: new Date().toISOString(),
      });
    }
    
    console.log('[Cron] Sin cambios detectados');
    return NextResponse.json({
      success: true,
      changes: 0,
      message: 'Sin cambios en niveles de riesgo',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
