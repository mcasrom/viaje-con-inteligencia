import { NextRequest, NextResponse } from 'next/server';
import { paisesData, NivelRiesgo } from '@/data/paises';
import { sendTelegramMessage } from '@/lib/telegram-channel';

export const dynamic = 'force-dynamic';

const ALERT_TYPES: Record<string, {emoji: string; color: string; priority: string}> = {
  risk_change: {
    emoji: '⚠️',
    color: 'red',
    priority: 'high'
  },
  security: {
    emoji: '🚨',
    color: 'red',
    priority: 'high'
  },
  weather: {
    emoji: '🌧️',
    color: 'yellow',
    priority: 'medium'
  },
  health: {
    emoji: '🏥',
    color: 'yellow',
    priority: 'medium'
  },
  info: {
    emoji: 'ℹ️',
    color: 'blue',
    priority: 'low'
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const type = searchParams.get('type');
  const days = parseInt(searchParams.get('days') || '7');

  if (country) {
    const pais = paisesData[country.toLowerCase()];
    if (!pais) {
      return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
    }
    return NextResponse.json({
      country: pais.codigo,
      nombre: pais.nombre,
      nivelRiesgo: pais.nivelRiesgo,
      ultimoInforme: pais.ultimoInforme,
      contactos: pais.contactos,
      recomendaciones: pais.requerimientos
    });
  }

  if (type === 'all') {
    const risky = Object.values(paisesData).filter(p => 
      p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto'
    );
    return NextResponse.json({
      total: Object.keys(paisesData).length,
      highRisk: Object.values(paisesData).filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto').length,
      countries: risky.map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        nivelRiesgo: p.nivelRiesgo,
        ultimaActualizacion: p.ultimoInforme
      }))
    });
  }

  return NextResponse.json({
    message: 'Usa /api/alerts?country=ES para ver alertas de un país',
    opciones: {
      country: 'Código de país (ej: ES, FR, MX)',
      type: 'all (países en riesgo)',
      days: 'Días de histórico (default 7)'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, type, message, title, sendToTelegram } = body;

    if (!countryCode || !message) {
      return NextResponse.json({ error: 'Faltan countryCode o message' }, { status: 400 });
    }

    const pais = paisesData[countryCode.toLowerCase()];
    if (!pais) {
      return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
    }

    const alertType = ALERT_TYPES[type] || ALERT_TYPES.info;
    const alertMessage = `${alertType.emoji} *${title || 'Alerta'} - ${pais.nombre}*\n\n${message}\n\n🔗 via @ViajeConInteligenciaBot`;

    if (sendToTelegram) {
      await sendTelegramMessage(alertMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta enviada',
      alert: {
        country: pais.nombre,
        type: type,
        message: message
      }
    });
  } catch (error) {
    console.error('Alerts error:', error);
    return NextResponse.json({ error: 'Error procesando alerta' }, { status: 500 });
  }
}