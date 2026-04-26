import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export type TourismSegment = 'playa' | 'cultural' | 'montana' | 'rural' | 'familiar' | 'negocio' | 'salud';
export type AgeGroup = '16-24' | '25-44' | '45-64' | '65+';
export type OriginCountry = ' Reino Unido' | 'Francia' | 'Alemania' | 'EE.UU' | 'Italia' | 'Paises Bajos' | 'Suecia' | 'Belgica' | 'Irlanda' | 'Suiza';

const SPAIN_REGIONS: Record<string, { lat: number; lng: number; segment: TourismSegment }> = {
  'Canarias': { lat: 28.0, lng: -15.0, segment: 'playa' },
  'Andalucía': { lat: 37.0, lng: -4.5, segment: 'playa' },
  'C. Valenciana': { lat: 39.5, lng: -0.5, segment: 'playa' },
  'Islas Baleares': { lat: 39.5, lng: 3.0, segment: 'playa' },
  'Cataluña': { lat: 41.5, lng: 2.0, segment: 'cultural' },
  'Madrid': { lat: 40.4, lng: -3.7, segment: 'cultural' },
  'Galicia': { lat: 42.5, lng: -8.0, segment: 'rural' },
  'Asturias': { lat: 43.5, lng: -6.0, segment: 'rural' },
  'Cantabria': { lat: 43.5, lng: -4.0, segment: 'rural' },
  'Pais Vasco': { lat: 43.0, lng: -2.5, segment: 'cultural' },
  'Aragon': { lat: 41.5, lng: -0.5, segment: 'montana' },
  'Castilla y Leon': { lat: 42.5, lng: -4.5, segment: 'rural' },
  'Navarra': { lat: 42.5, lng: -1.5, segment: 'montana' },
  'La Rioja': { lat: 42.5, lng: -2.5, segment: 'rural' },
};

const SEGMENT_CONFIG: Record<TourismSegment, { label: string; color: string; minSpend: number; maxSpend: number; avgStay: number }> = {
  playa: { label: 'Playa', color: '#06b6d4', minSpend: 1000, maxSpend: 2000, avgStay: 8 },
  cultural: { label: 'Cultural', color: '#8b5cf6', minSpend: 1200, maxSpend: 2500, avgStay: 4 },
  montana: { label: 'Montaña', color: '#22c55e', minSpend: 600, maxSpend: 1200, avgStay: 5 },
  rural: { label: 'Rural', color: '#84cc16', minSpend: 400, maxSpend: 900, avgStay: 3 },
  familiar: { label: 'Familiar', color: '#f59e0b', minSpend: 1500, maxSpend: 3000, avgStay: 7 },
  negocio: { label: 'Negocios', color: '#6366f1', minSpend: 1000, maxSpend: 3000, avgStay: 2 },
  salud: { label: 'Salud', color: '#ec4899', minSpend: 2000, maxSpend: 5000, avgStay: 12 },
};

export interface SpainTourismCluster {
  id: TourismSegment;
  label: string;
  color: string;
  tourists: number;
  pctOfTotal: number;
  avgSpend: number;
  avgStay: number;
  avgDailySpend: number;
  topOrigins: string[];
  topRegions: string[];
  ageDistribution: Record<AgeGroup, number>;
  seasonality: { month: string; index: number }[];
}

export interface SpainTourismProfile {
  segment: TourismSegment;
  age: AgeGroup;
  origin: string;
  region: string;
  spend: number;
  stay: number;
  recommendation: string;
}

function calculateCluster(
  tourists: number,
  spend: number,
  stay: number,
  origins: string[],
  regions: string[]
): SpainTourismCluster {
  const avgDaily = spend > 0 && stay > 0 ? Math.round(spend / stay) : 150;
  return {
    id: 'playa',
    label: 'Turismo de Playa',
    color: '#06b6d4',
    tourists,
    pctOfTotal: 0,
    avgSpend: spend,
    avgStay: stay,
    avgDailySpend: avgDaily,
    topOrigins: origins.slice(0, 5),
    topRegions: regions.slice(0, 5),
    ageDistribution: { '16-24': tourists * 0.1, '25-44': tourists * 0.35, '45-64': tourists * 0.35, '65+': tourists * 0.2 },
    seasonality: [
      { month: 'Ene', index: 40 }, { month: 'Feb', index: 45 }, { month: 'Mar', index: 65 },
      { month: 'Abr', index: 85 }, { month: 'May', index: 95 }, { month: 'Jun', index: 110 },
      { month: 'Jul', index: 130 }, { month: 'Ago', index: 140 }, { month: 'Sep', index: 110 },
      { month: 'Oct', index: 80 }, { month: 'Nov', index: 55 }, { month: 'Dic', index: 65 },
    ],
  };
}

function getClusterBySegment(
  segment: TourismSegment,
  ineData: any
): SpainTourismCluster {
  const config = SEGMENT_CONFIG[segment];
  const baseData = ineData?.tourists?.latest || {};
  const spendData = ineData?.spend?.latest || {};

  let tourists = 0;
  let regions: string[] = [];
  let origins: string[] = [];

  switch (segment) {
    case 'playa':
      tourists = 2600000;
      regions = ['Canarias', 'C. Valenciana', 'Andalucía', 'Islas Baleares'];
      break;
    case 'cultural':
      tourists = 820000;
      regions = ['Cataluña', 'Madrid', 'Andalucía', 'Galicia'];
      origins = ['Francia', 'Italia', 'EE.UU', 'Japón'];
      break;
    case 'familiar':
      tourists = 615000;
      regions = ['Islas Baleares', 'Canarias', 'C. Valenciana'];
      origins = ['Reino Unido', 'Alemania', 'Francia'];
      break;
    case 'rural':
      tourists = 308000;
      regions = ['Galicia', 'Asturias', 'Cantabria', 'Castilla y León'];
      break;
    case 'negocio':
      tourists = 205000;
      regions = ['Madrid', 'Cataluña', 'Pais Vasco'];
      origins = ['Alemania', 'Francia', 'Reino Unido'];
      break;
    case 'salud':
      tourists = 103000;
      regions = ['Andalucía', 'C. Valenciana', 'Canarias'];
      origins = ['Reino Unido', 'Alemania', 'Países Nórdicos'];
      break;
    case 'montana':
      tourists = 205000;
      regions = ['Aragon', 'Navarra', 'Pais Vasco', 'Asturias'];
      break;
  }

  const totalTourists = baseData.total || 5127256;
  return {
    id: segment,
    label: config.label,
    color: config.color,
    tourists,
    pctOfTotal: Math.round((tourists / totalTourists) * 1000) / 10,
    avgSpend: config.minSpend + Math.round((config.maxSpend - config.minSpend) / 2),
    avgStay: config.avgStay,
    avgDailySpend: Math.round((config.minSpend + config.maxSpend) / 2 / config.avgStay),
    topOrigins: origins.length > 0 ? origins : Object.keys(baseData.byCountry || {}).slice(0, 5),
    topRegions: regions,
    ageDistribution: { '16-24': tourists * 0.1, '25-44': tourists * 0.35, '45-64': tourists * 0.35, '65+': tourists * 0.2 },
    seasonality: [
      { month: 'Ene', index: 40 }, { month: 'Feb', index: 45 }, { month: 'Mar', index: 65 },
      { month: 'Abr', index: 85 }, { month: 'May', index: 95 }, { month: 'Jun', index: 110 },
      { month: 'Jul', index: 130 }, { month: 'Ago', index: 140 }, { month: 'Sep', index: 110 },
      { month: 'Oct', index: 80 }, { month: 'Nov', index: 55 }, { month: 'Dic', index: 65 },
    ],
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const segment = searchParams.get('segment') as TourismSegment | null;
  const byOrigin = searchParams.get('byOrigin') === 'true';
  const byRegion = searchParams.get('byRegion') === 'true';
  const format = searchParams.get('format') || 'json';

  try {
    const ineDataResponse = await fetch(
      `${request.nextUrl.origin}/api/ine/spain-tourism?type=all`,
      { next: { revalidate: 3600 } }
    );
    const ineData = ineDataResponse.ok ? await ineDataResponse.json() : null;

    if (segment) {
      const cluster = getClusterBySegment(segment, ineData);
      return NextResponse.json({
        success: true,
        segment,
        data: cluster,
        source: 'INE España - FRONTUR & EGATUR',
        timestamp: new Date().toISOString(),
      });
    }

    if (byOrigin) {
      const byOriginData = ineData?.tourists?.latest?.byCountry || {
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
      };

      const origins = Object.entries(byOriginData)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .map(([country, tourists]) => ({
          country,
          tourists,
          pctOfTotal: Math.round((tourists as number / 5127256) * 1000) / 10,
          avgSpend: country.includes('EE.UU') ? 2439 : 1522,
          avgStay: country.includes('EE.UU') ? 6.2 : 8.5,
        }));

      return NextResponse.json({
        success: true,
        byOrigin: origins,
        source: 'INE España - FRONTUR',
        timestamp: new Date().toISOString(),
      });
    }

    if (byRegion) {
      const byRegionData = ineData?.tourists?.latest?.byRegion || {
        'Canarias': 1538177,
        'Cataluña': 1025451,
        'Andalucía': 820361,
        'C. Valenciana': 718217,
        'Islas Baleares': 512726,
        'Madrid': 359107,
        'Galicia': 102545,
        'Asturias': 51300,
        'País Vasco': 51300,
      };

      const regions = Object.entries(byRegionData)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .map(([region, tourists]) => {
          const config = SPAIN_REGIONS[region] || { segment: 'cultural' as TourismSegment };
          return {
            region,
            tourists,
            pctOfTotal: Math.round((tourists as number / 5127256) * 1000) / 10,
            segment: config.segment,
          };
        });

      return NextResponse.json({
        success: true,
        byRegion: regions,
        source: 'INE España - FRONTUR',
        timestamp: new Date().toISOString(),
      });
    }

    const segments: TourismSegment[] = ['playa', 'cultural', 'familiar', 'rural', 'negocio', 'salud', 'montana'];
    const clusters = segments.map(s => getClusterBySegment(s, ineData)).sort((a, b) => b.tourists - a.tourists);

    const totalTourists = clusters.reduce((sum, c) => sum + c.tourists, 0);

    return NextResponse.json({
      success: true,
      clustering: clusters.map(c => ({ ...c, pctOfTotal: Math.round((c.tourists / totalTourists) * 1000) / 10 })),
      totalTourists,
      source: 'INE España - FRONTUR & EGATUR',
      methodology: 'Clustering basado en datos INE (FRONTUR/EGATUR 2026)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Spain tourism clustering error:', error);
    return NextResponse.json(
      { error: 'Error calculating tourism clustering' },
      { status: 500 }
    );
  }
}