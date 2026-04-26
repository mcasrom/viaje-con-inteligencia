import { NextRequest, NextResponse } from 'next/server';
import { getAllWBIPC } from '@/lib/scraper/wb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'asc';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const ipcData = await getAllWBIPC();
    
    const sorted = [...ipcData].sort((a, b) => 
      sort === 'asc' ? a.ipc - b.ipc : b.ipc - a.ipc
    ).slice(0, limit);

    return NextResponse.json({
      rankings: sorted,
      sort,
      total: sorted.length,
      source: 'World Bank 2024',
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Rankings error:', error);
    return NextResponse.json({ error: 'Error al obtener rankings' }, { status: 500 });
  }
}