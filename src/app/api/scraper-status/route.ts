import { NextResponse } from 'next/server';
import { getScraperStatus } from '@/lib/scraper/audit';

export async function GET() {
  try {
    const status = getScraperStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estado de scrapers' },
      { status: 500 }
    );
  }
}
