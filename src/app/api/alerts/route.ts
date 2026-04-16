import { NextRequest, NextResponse } from 'next/server';
import { sendRiskUpdate, sendCountryAlert, getBotInfo, getChannelInfo } from '@/lib/telegram-channel';
import { paisesData } from '@/data/paises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, countryCode } = body;

    switch (action) {
      case 'broadcast_risk':
        const sent = await sendRiskUpdate();
        return NextResponse.json({ 
          success: sent, 
          message: sent ? 'Alerta enviada al canal' : 'Error al enviar alerta'
        });

      case 'send_country_alert':
        if (!countryCode) {
          return NextResponse.json({ error: 'Country code required' }, { status: 400 });
        }
        const countrySent = await sendCountryAlert(countryCode);
        return NextResponse.json({ 
          success: countrySent,
          message: countrySent ? `Alerta de ${countryCode} enviada` : 'Error al enviar'
        });

      case 'test_bot':
        const botInfo = await getBotInfo();
        return NextResponse.json(botInfo);

      case 'test_channel':
        const channelInfo = await getChannelInfo();
        return NextResponse.json(channelInfo);

      case 'list_countries':
        return NextResponse.json({
          countries: Object.values(paisesData).map(p => ({
            code: p.codigo,
            name: p.nombre,
            risk: p.nivelRiesgo,
          })),
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          available: ['broadcast_risk', 'send_country_alert', 'test_bot', 'test_channel', 'list_countries']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/alerts',
    methods: ['POST'],
    actions: {
      broadcast_risk: 'Enviar actualización de riesgos al canal',
      send_country_alert: 'Enviar alerta de país específico',
      test_bot: 'Probar conexión con Bot API',
      test_channel: 'Ver info del canal',
      list_countries: 'Listar países disponibles',
    },
  });
}
