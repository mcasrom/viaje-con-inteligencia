import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { generateRiskChangeAlert, generateWeeklyDigest } from '@/lib/alerts-system';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

async function sendToChannel(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log('[Channel] Credenciales no configuradas');
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
    console.error('[Channel] Error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, countryCode, oldRisk, newRisk, message } = body;

    switch (action) {
      case 'alert_risk_change':
        if (!countryCode || !oldRisk || !newRisk) {
          return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }
        const alertMessage = generateRiskChangeAlert(countryCode, oldRisk, newRisk);
        const sent = await sendToChannel(alertMessage);
        return NextResponse.json({ success: sent, message: alertMessage });

      case 'custom_alert':
        if (!message) {
          return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
        }
        const sentCustom = await sendToChannel(message);
        return NextResponse.json({ success: sentCustom });

      case 'weekly_digest':
        const digest = await generateWeeklyDigest();
        const sentDigest = await sendToChannel(digest);
        return NextResponse.json({ success: sentDigest });

      case 'list_high_risk':
        const altoRiesgo = Object.values(paisesData)
          .filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto')
          .map(p => ({
            code: p.codigo,
            name: p.nombre,
            risk: p.nivelRiesgo,
            capital: p.capital,
          }));
        return NextResponse.json({ countries: altoRiesgo });

      case 'get_country_status':
        if (!countryCode) {
          return NextResponse.json({ error: 'Código de país requerido' }, { status: 400 });
        }
        const pais = paisesData[countryCode];
        if (!pais) {
          return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
        }
        return NextResponse.json({
          code: pais.codigo,
          name: pais.nombre,
          risk: pais.nivelRiesgo,
          capital: pais.capital,
          continent: pais.continente,
          lastUpdate: pais.ultimoInforme,
        });

      case 'test_connection':
        const testMsg = `🧪 *Test de conexión*\n\n` +
          `Conexión con Viaje con Inteligencia: ✓\n` +
          `Fecha: ${new Date().toLocaleString('es-ES')}\n\n` +
          `🤖 @ViajeConInteligenciaBot`;
        const testSent = await sendToChannel(testMsg);
        return NextResponse.json({ success: testSent });

      default:
        return NextResponse.json({
          available_actions: [
            'alert_risk_change - Alertar cambio de riesgo',
            'custom_alert - Enviar alerta personalizada',
            'weekly_digest - Enviar digest semanal',
            'list_high_risk - Listar países alto riesgo',
            'get_country_status - Estado de un país',
            'test_connection - Probar conexión',
          ],
        });
    }
  } catch (error) {
    console.error('[/api/notifications] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  const altoRiesgo = Object.values(paisesData)
    .filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto');

  return NextResponse.json({
    endpoint: '/api/notifications',
    status: 'online',
    high_risk_countries: altoRiesgo.length,
    total_countries: Object.keys(paisesData).length,
    last_check: new Date().toISOString(),
  });
}
