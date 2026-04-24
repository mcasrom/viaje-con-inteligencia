import { NextResponse } from 'next/server';

const WORLD_BANK_API = 'https://api.worldbank.org/v2';

interface CountryData {
  code: string;
  name: string;
}

const TOURISM_INDICATORS: Record<string, { name: string; code: string }> = {
  arrivals: { name: 'Llegadas turistas internacionales', code: 'ST.INT.ARVL' },
  departures: { name: 'Salidas turistas internacionales', code: 'ST.INT.DPRT' },
  receipts: { name: 'Ingresos turismo (USD)', code: 'ST.INT.RCPT.CD' },
  expenditure: { name: 'Gasto turistas salientes (USD)', code: 'ST.INT.XPND.CD' },
  passengers: { name: 'Pasajeros aérea', code: 'IS.AIR.PSGR' },
  goods: { name: 'Carga aérea (toneladas)', code: 'IS.AIR.GOOD.MT.K1' },
  routes: { name: 'Rutas aéreas', code: 'IS.AIR.PSGR' },
};

const OTHER_INDICATORS: Record<string, { name: string; code: string }> = {
  gdp: { name: 'PIB (USD)', code: 'NY.GDP.MKTP.CD' },
  gdpPerCapita: { name: 'PIB per cápita', code: 'NY.GDP.PCAP.CD' },
  population: { name: 'Población', code: 'SP.POP.TOTL' },
  roads: { name: 'Carreteras (km)', code: 'IS.ROD.DNRS.KD' },
  railways: { name: 'Ferrocarriles (km)', code: 'IS.RRS.TOTL.KM' },
  mobileSubs: { name: 'Suscripciones móviles', code: 'IT.CEL.SETS.P2' },
  internetUsers: { name: 'Usuarios internet (%)', code: 'IT.NET.USER.ZS' },
  hdi: { name: 'Índice Desarrollo Humano', code: 'UNDP.HDI.XD' },
};

async function fetchWorldBankData(countryCode: string, indicator: string): Promise<any> {
  try {
    const url = `${WORLD_BANK_API}/country/${countryCode}/indicator/${indicator}?format=json&per_page=10&date=2015:${new Date().getFullYear()}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data[1] || null;
  } catch (error) {
    console.error(`Error fetching ${indicator}:`, error);
    return null;
  }
}

function formatValue(value: number, indicator: string): string {
  if (!value) return 'N/A';
  
  if (indicator === 'ST.INT.ARVL' || indicator === 'ST.INT.DPRT' || indicator === 'IS.AIR.PSGR') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }
  
  if (indicator === 'ST.INT.RCPT.CD' || indicator === 'ST.INT.XPND.CD' || indicator === 'NY.GDP.MKTP.CD') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}B`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value}`;
  }
  
  if (indicator === 'NY.GDP.PCAP.CD') return `$${value.toFixed(0)}`;
  
  if (indicator === 'SP.POP.TOTL') {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toString();
  }
  
  if (indicator === 'IS.ROD.DNRS.KD' || indicator === 'IS.RRS.TOTL.KM') {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K km`;
    return `${value} km`;
  }
  
  if (indicator === 'IT.CEL.SETS.P2' || indicator === 'IT.NET.USER.ZS') {
    return `${value.toFixed(1)}%`;
  }
  
  return value.toString();
}

function getLatestValue(data: any[]): { value: string; year: string } | null {
  if (!data || data.length === 0) return null;
  
  const validData = data.filter((d: any) => d.value !== null);
  if (validData.length === 0) return null;
  
  const latest = validData[0];
  return {
    value: formatValue(latest.value, latest.indicator?.id),
    year: latest.date || 'N/A'
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country')?.toLowerCase();
  const dataType = searchParams.get('type') || 'all';
  
  if (!countryCode) {
    return NextResponse.json({ error: 'Country code required' }, { status: 400 });
  }

  const indicators = dataType === 'tourism' 
    ? TOURISM_INDICATORS 
    : dataType === 'transport'
    ? OTHER_INDICATORS
    : { ... TOURISM_INDICATORS, ... OTHER_INDICATORS };

  const results: Record<string, any> = {};
  
  const promises = Object.entries(indicators).map(async ([key, { name, code }]) => {
    const data = await fetchWorldBankData(countryCode, code);
    const latest = getLatestValue(data);
    results[key] = {
      name,
      code,
      value: latest?.value || 'N/A',
      year: latest?.year || 'N/A',
      historical: data?.slice(0, 5).map((d: any) => ({
        year: d.date,
        value: formatValue(d.value, code)
      })) || []
    };
  });

  await Promise.all(promises);

  return NextResponse.json({
    country: countryCode,
    timestamp: new Date().toISOString(),
    source: 'World Bank API',
    sourceUrl: 'https://data.worldbank.org/',
    data: results
  });
}