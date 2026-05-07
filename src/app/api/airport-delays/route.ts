import { NextResponse } from 'next/server';

const FLIGHTLABS_API_KEY = process.env.FLIGHTLABS_API_KEY || '';
const FLIGHTSTATS_API_KEY = process.env.FLIGHTSTATS_API_KEY || '';

const AIRPORT_NAMES_ES: Record<string, string> = {
  'MAD': 'Adolfo Suarez Madrid-Barajas',
  'BCN': 'Barcelona-El Prat',
  'AGP': 'Malaga-Costa del Sol',
  'ALC': 'Alicante-Elche',
  'PMI': 'Palma de Mallorca',
  'TFS': 'Tenerife Sur',
  'LPA': 'Gran Canaria',
  'VGO': 'Vigo',
  'OVD': 'Asturias',
  'BIO': 'Bilbao',
  'XRY': 'Jerez de la Frontera',
  'FUE': 'Fuerteventura',
  'GMZ': 'La Gomera',
  'SPC': 'La Palma',
  'LCG': 'La Coruna',
  'GRX': 'Granada',
  'IBZ': 'Ibiza',
  'LEI': 'Almeria',
  'VIT': 'Vitoria',
  'ZAZ': 'Zaragoza',
  'SVQ': 'Sevilla',
  'VLC': 'Valencia',
  'SDR': 'Santander',
  'RJL': 'Logrono',
  'HSK': 'Huesca',
};

const AIRPORT_NAMES_EU: Record<string, string> = {
  'LHR': 'London Heathrow',
  'LGW': 'London Gatwick',
  'MAN': 'Manchester',
  'LTN': 'London Luton',
  'EDI': 'Edinburgh',
  'GLA': 'Glasgow',
  'CDG': 'Paris Charles de Gaulle',
  'ORY': 'Paris Orly',
  'NCE': 'Nice',
  'LYS': 'Lyon',
  'MRS': 'Marseille',
  'BOD': 'Bordeaux',
  'FRA': 'Frankfurt',
  'MUC': 'Munich',
  'BER': 'Berlin Brandenburg',
  'HAM': 'Hamburg',
  'DUS': 'Dusseldorf',
  'CGN': 'Cologne',
  'AMS': 'Amsterdam Schiphol',
  'FCO': 'Rome Fiumicino',
  'MXP': 'Milan Malpensa',
  'LIS': 'Lisbon',
  'OPO': 'Porto',
  'VIE': 'Vienna',
  'CPH': 'Copenhagen',
  'OSL': 'Oslo',
  'ARN': 'Stockholm Arlanda',
  'BRU': 'Brussels',
  'ZRH': 'Zurich',
  'GVA': 'Geneva',
  'WAW': 'Warsaw',
  'PRG': 'Prague',
  'BUD': 'Budapest',
  'ATH': 'Athens',
};

const AIRPORT_NAMES_US: Record<string, string> = {
  'JFK': 'New York JFK',
  'LAX': 'Los Angeles',
  'ORD': 'Chicago O\'Hare',
  'DFW': 'Dallas Fort Worth',
  'DEN': 'Denver',
  'SFO': 'San Francisco',
  'SEA': 'Seattle',
  'LAS': 'Las Vegas',
  'MCO': 'Orlando',
  'MIA': 'Miami',
  'ATL': 'Atlanta',
  'BOS': 'Boston',
  'EWR': 'Newark',
  'IAH': 'Houston',
  'PHX': 'Phoenix',
  'DTW': 'Detroit',
  'MSP': 'Minneapolis',
};

const AIRPORTS_BY_COUNTRY: Record<string, string[]> = {
  'ES': ['MAD', 'BCN', 'AGP', 'ALC', 'PMI', 'TFS', 'LPA', 'BIO', 'SVQ', 'VLC'],
  'UK': ['LHR', 'LGW', 'MAN', 'LTN', 'EDI', 'GLA'],
  'FR': ['CDG', 'ORY', 'NCE', 'LYS', 'MRS', 'BOD'],
  'DE': ['FRA', 'MUC', 'BER', 'HAM', 'DUS', 'CGN'],
  'IT': ['FCO', 'MXP', 'NAP', 'VCE', 'BLQ'],
  'US': ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'MIA', 'ATL', 'BOS'],
  'ALL': ['MAD', 'BCN', 'LHR', 'CDG', 'FRA', 'AMS', 'JFK', 'LAX', 'ORD', 'MIA'],
};

function getAirportName(code: string): string {
  return AIRPORT_NAMES_ES[code] || AIRPORT_NAMES_EU[code] || AIRPORT_NAMES_US[code] || `${code} Airport`;
}

interface DelayData {
  code: string;
  iata: string;
  name: string;
  status: 'on_time' | 'delayed' | 'cancelled';
  departureDelay: number;
  arrivalDelay: number;
  lastUpdated: string;
  source: string;
}

async function fetchAeroDataBox(airportCode: string): Promise<DelayData | null> {
  if (!FLIGHTLABS_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://aerodatabox.p.rapidapi.com/airports/${airportCode}/onPerformance?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`,
      {
        headers: {
          'x-rapidapi-key': FLIGHTLABS_API_KEY,
          'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const onTimePercent = data.onTimePerformance?.percent || 85;
      const avgDelay = data.onTimePerformance?.delayAvg || 0;
      
      return {
        code: airportCode,
        iata: airportCode,
        name: getAirportName(airportCode),
        status: onTimePercent > 75 ? 'on_time' : onTimePercent > 50 ? 'delayed' : 'cancelled',
        departureDelay: Math.round(avgDelay),
        arrivalDelay: Math.round(avgDelay * 0.7),
        lastUpdated: new Date().toISOString(),
        source: 'AeroDataBox',
      };
    }
  } catch (e) {
    console.log('[AeroDataBox] Error fetching data:', e);
  }
  return null;
}

async function fetchFlightStats(airportCode: string): Promise<DelayData | null> {
  if (!FLIGHTSTATS_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://airport.api.flightsstats.com/v1/airports/${airportCode}/delays`,
      {
        headers: {
          'Authorization': `Bearer ${FLIGHTSTATS_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return {
        code: airportCode,
        iata: airportCode,
        name: data.name || getAirportName(airportCode),
        status: data.status || 'on_time',
        departureDelay: data.departureDelay || 0,
        arrivalDelay: data.arrivalDelay || 0,
        lastUpdated: new Date().toISOString(),
        source: 'FlightStats',
      };
    }
  } catch (e) {
    console.log('[FlightStats] Error fetching data:', e);
  }
  return null;
}

function generateMockDelays(airports: string[]): DelayData[] {
  const hour = new Date().getUTCHours();
  const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
  
  return airports.map(code => {
    const baseDelayChance = isPeakHour ? 0.4 : 0.25;
    const isDelayed = Math.random() < baseDelayChance;
    const delay = isDelayed ? Math.floor(Math.random() * 90) + 15 : 0;
    
    return {
      code,
      iata: code,
      name: getAirportName(code),
      status: delay > 60 ? 'cancelled' : isDelayed ? 'delayed' : 'on_time',
      departureDelay: delay,
      arrivalDelay: Math.floor(delay * 0.7),
      lastUpdated: new Date().toISOString(),
      source: 'Estimacion',
    };
  });
}

async function fetchDelaysForAirports(airports: string[]): Promise<DelayData[]> {
  const hasRealAPI = FLIGHTLABS_API_KEY || FLIGHTSTATS_API_KEY;
  
  if (!hasRealAPI) {
    return generateMockDelays(airports);
  }
  
  const results: DelayData[] = [];
  
  const promises = airports.map(async (code) => {
    let data = await fetchAeroDataBox(code);
    if (!data) {
      data = await fetchFlightStats(code);
    }
    return data;
  });
  
  const fetched = await Promise.allSettled(promises);
  
  for (let i = 0; i < airports.length; i++) {
    const result = fetched[i];
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    } else {
      results.push(generateMockDelays([airports[i]])[0]);
    }
  }
  
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'all';
  const format = searchParams.get('format') || 'json';

  const airports = AIRPORTS_BY_COUNTRY[country.toUpperCase()] || AIRPORTS_BY_COUNTRY['ALL'];

  const delays = await fetchDelaysForAirports(airports);
  
  if (format === 'text') {
    const lines = delays.map(d => 
      `${d.code}: ${d.status === 'on_time' ? 'En hora' : d.status === 'delayed' ? `Retraso ${d.departureDelay}min` : 'Cancelado'} - ${d.name}`
    );
    return NextResponse.json({ 
      text: lines.join('\n'),
      airports: delays.length,
    });
  }

  const summary = {
    total: delays.length,
    onTime: delays.filter(d => d.status === 'on_time').length,
    delayed: delays.filter(d => d.status === 'delayed').length,
    cancelled: delays.filter(d => d.status === 'cancelled').length,
    avgDelay: Math.round(
      delays.reduce((sum, d) => sum + d.departureDelay, 0) / delays.length
    ),
  };

  const source = FLIGHTLABS_API_KEY ? 'AeroDataBox' : FLIGHTSTATS_API_KEY ? 'FlightStats' : 'Estimacion';

  return NextResponse.json({
    summary,
    data: delays,
    source,
    timestamp: new Date().toISOString(),
  });
}
