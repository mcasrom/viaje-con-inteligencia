import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { getWBIPC } from '@/lib/scraper/wb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countries = searchParams.get('countries')?.split(',') || ['es', 'fr', 'de'];

  try {
    const results = await Promise.all(
      countries.map(async (code) => {
        const codeLower = code.toLowerCase();
        const pais = paisesData[codeLower];
        const ipcData = await getWBIPC(code.toUpperCase());
        
        return {
          code: codeLower,
          nombre: pais?.nombre || code,
          bandera: pais?.bandera || '🏳️',
          capital: pais?.capital || '-',
          nivelRiesgo: pais?.nivelRiesgo || '-',
          moneda: pais?.moneda || '-',
          idioma: pais?.idioma || '-',
          ipc: ipcData?.ipc || null,
          ipcNivel: ipcData?.nivel || null,
          region: ipcData?.region || '-',
        };
      })
    );

    return NextResponse.json({
      countries: results,
      compared: results.map(r => r.code),
      source: { ipc: 'World Bank 2024', riesgo: 'MAEC' },
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compare error:', error);
    return NextResponse.json({ error: 'Error al comparar países' }, { status: 500 });
  }
}