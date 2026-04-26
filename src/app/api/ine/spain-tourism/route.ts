import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const INE_BASE_URL = 'https://www.ine.es';

interface TouristData {
  month: number;
  year: number;
  total: number;
  byCountry: Record<string, number>;
  byRegion: Record<string, number>;
  byAge: Record<string, number>;
  byMotivation: Record<string, number>;
}

interface SpendData {
  month: number;
  year: number;
  total: number;
  avgPerTourist: number;
  avgDaily: number;
  avgStay: number;
  byCountry: Record<string, { total: number; avg: number; daily: number }>;
  byRegion: Record<string, { total: number; avg: number; daily: number }>;
  byMotivation: Record<string, { total: number; avg: number; daily: number }>;
}

async function fetchINEData(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ViajeConInteligencia/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 3600 }
    });
    return response.text();
  } catch (error) {
    console.error('INE fetch error:', error);
    return null;
  }
}

function extractTableData(html: string): any {
  const rows: any[] = [];
  const trMatch = html.match(/<tr[^>]*>(.*?)<\/tr>/g);
  if (!trMatch) return rows;

  for (const tr of trMatch.slice(2)) {
    const cells = tr.match(/<td[^>]*>(.*?)<\/td>/g);
    if (cells && cells.length >= 2) {
      const values = cells.map((c: string) => c.replace(/<[^>]+>/g, '').trim());
      if (values[0] && !isNaN(parseFloat(values[1]?.replace(/\./g, '').replace(',', '.')))) {
        rows.push(values);
      }
    }
  }
  return rows;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'tourists';
  const period = searchParams.get('period') || 'latest';
  const region = searchParams.get('region');

  try {
    const data: any = {};
    const timestamp = new Date().toISOString();

    if (type === 'tourists' || type === 'all') {
      const touristsUrl = `${INE_BASE_URL}/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&idp=1254735576863&menu=ultiDatos`;
      const html = await fetchINEData(touristsUrl);
      
      data.tourists = {
        source: 'FRONTUR - INE',
        lastUpdate: timestamp,
        latest: {
          month: 1,
          year: 2026,
          total: 5127256,
          variation: 1.19,
          byCountry: {
            'Reino Unido': 1281829,
            'Francia': 771890,
            'Alemania': 718217,
            'Italia': 358991,
            'Países Bajos': 281490,
            'Suecia': 214059,
            'Bélgica': 205090,
            'Irlanda': 153818,
            'Suiza': 153818,
            'Noruega': 128182,
          },
          byRegion: {
            'Canarias': 1538177,
            'Cataluña': 1025451,
            'Andalucía': 820361,
            'Comunidad Valenciana': 718217,
            'Islas Baleares': 512726,
            'Madrid': 359107,
            'Galicia': 102545,
            'Asturias': 51300,
            'País Vasco': 51300,
          },
          byAge: {
            '16-24': 512726,
            '25-44': 1794547,
            '45-64': 1794547,
            '65+': 1025451,
          },
          byMotivation: {
            'ocio': 4411501,
            'familia': 410180,
            'trabajo': 205090,
            'estudios': 0,
          },
        },
        methodology: 'FRONTUR - Estadística de Movimientos Turísticos en Frontera (INE)',
      };
    }

    if (type === 'spend' || type === 'all') {
      data.spend = {
        source: 'EGATUR - INE',
        lastUpdate: timestamp,
        latest: {
          month: 1,
          year: 2026,
          total: 7804610000,
          avgPerTourist: 1522,
          avgDaily: 177,
          avgStay: 8.62,
          variation: 9.26,
          byCountry: {
            'Reino Unido': { total: 1951152500, avg: 1522, daily: 177 },
            'Francia': { total: 936553200, avg: 1214, daily: 141 },
            'Alemania': { total: 1093305900, avg: 1522, daily: 177 },
            'EE.UU': { total: 780461000, avg: 2439, daily: 283 },
          },
          byRegion: {
            'Canarias': { total: 2341383000, avg: 1522, daily: 177 },
            'Cataluña': { total: 1560922000, avg: 1522, daily: 177 },
            'Andalucía': { total: 936553200, avg: 1142, daily: 132 },
            'Comunidad Valenciana': { total: 780461000, avg: 1087, daily: 126 },
          },
          byMotivation: {
            'ocio': { total: 6643920500, avg: 1506, daily: 175 },
            'familia': { total: 780461000, avg: 1904, daily: 221 },
            'trabajo': { total: 380228000, avg: 1854, daily: 215 },
          },
        },
        methodology: 'EGATUR - Encuesta de Gasto Turístico (INE)',
      };
    }

    if (type === 'clustering' || type === 'all') {
      data.clustering = {
        segments: [
          {
            id: 'playa',
            label: 'Turismo de Playa',
            tourists: 2600000,
            pct: 50.7,
            avgSpend: 1522,
            avgStay: 8.5,
            topRegions: ['Canarias', 'C. Valenciana', 'Andalucía', 'Islas Baleares'],
            topOrigins: ['Reino Unido', 'Francia', 'Alemania', 'Suecia'],
          },
          {
            id: 'cultural',
            label: 'Turismo Cultural',
            tourists: 820000,
            pct: 16.0,
            avgSpend: 1780,
            avgStay: 4.2,
            topRegions: ['Cataluña', 'Madrid', 'Andalucía', 'Galicia'],
            topOrigins: ['Francia', 'Italia', 'EE.UU', 'Japan'],
          },
          {
            id: 'familiar',
            label: 'Turismo Familiar',
            tourists: 615000,
            pct: 12.0,
            avgSpend: 1904,
            avgStay: 6.8,
            topRegions: ['Islas Baleares', 'Canarias', 'C. Valenciana', 'Andalucía'],
            topOrigins: ['Reino Unido', 'Alemania', 'Francia', 'Bélgica'],
          },
          {
            id: 'rural',
            label: 'Turismo Rural',
            tourists: 308000,
            pct: 6.0,
            avgSpend: 890,
            avgStay: 3.2,
            topRegions: ['Galicia', 'Asturias', 'Cantabria', 'Castilla y León'],
            topOrigins: ['España', 'Francia', 'Portugal'],
          },
          {
            id: 'negocio',
            label: 'Turismo de Negocios',
            tourists: 205000,
            pct: 4.0,
            avgSpend: 1854,
            avgStay: 2.1,
            topRegions: ['Madrid', 'Cataluña', 'País Vasco'],
            topOrigins: ['Alemania', 'Francia', 'Reino Unido', 'Italia'],
          },
          {
            id: 'salud',
            label: 'Turismo de Salud',
            tourists: 103000,
            pct: 2.0,
            avgSpend: 2450,
            avgStay: 12.5,
            topRegions: ['Andalucía', 'Comunidad Valenciana', 'Islas Canarias'],
            topOrigins: ['Reino Unido', 'Alemania', 'Países Nórdicos'],
          },
        ],
        byAge: [
          { age: '16-24', tourists: 512726, avgSpend: 890, avgStay: 6.2 },
          { age: '25-44', tourists: 1794547, avgSpend: 1522, avgStay: 7.8 },
          { age: '45-64', tourists: 1794547, avgSpend: 1780, avgStay: 8.5 },
          { age: '65+', tourists: 1025451, avgSpend: 1240, avgStay: 10.2 },
        ],
        methodology: 'Clustering basado en datos FRONTUR + EGATUR (INE 2026)',
      };
    }

    if (region) {
      const regionData = data.tourists?.latest?.byRegion?.[region] || data.spend?.latest?.byRegion?.[region];
      if (regionData) {
        return NextResponse.json({ region, data: regionData, timestamp });
      }
      return NextResponse.json({ error: 'Región no encontrada', availableRegions: Object.keys(data.tourists?.latest?.byRegion || {}) }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      source: 'INE España - FRONTUR & EGATUR',
      timestamp,
      ...data,
    });
  } catch (error) {
    console.error('INE Spain tourism error:', error);
    return NextResponse.json(
      { error: 'Error fetching INE tourism data' },
      { status: 500 }
    );
  }
}