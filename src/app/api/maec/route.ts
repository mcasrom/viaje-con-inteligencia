import { NextRequest, NextResponse } from 'next/server';
import { getMAECData, getAllMAECAlerts } from '@/lib/scraper/maec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const alerts = searchParams.get('alerts');

  try {
    if (alerts === 'true') {
      const allAlerts = await getAllMAECAlerts();
      return NextResponse.json({ alerts: allAlerts });
    }

    if (country) {
      const data = await getMAECData(country);
      if (!data) {
        return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Parámetro country o alerts requerido' }, { status: 400 });
  } catch (error) {
    console.error('MAEC API error:', error);
    return NextResponse.json({ error: 'Error al obtener datos MAEC' }, { status: 500 });
  }
}