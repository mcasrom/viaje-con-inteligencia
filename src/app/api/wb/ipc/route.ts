import { NextRequest, NextResponse } from 'next/server';
import { getWBIPC, getAllWBIPC } from '@/lib/scraper/wb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const all = searchParams.get('all');

  try {
    if (all === 'true') {
      const data = await getAllWBIPC();
      return NextResponse.json({ ipc: data });
    }

    if (country) {
      const data = await getWBIPC(country.toUpperCase());
      if (!data) {
        return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Parámetro country o all requerido' }, { status: 400 });
  } catch (error) {
    console.error('WB IPC API error:', error);
    return NextResponse.json({ error: 'Error al obtener IPC' }, { status: 500 });
  }
}