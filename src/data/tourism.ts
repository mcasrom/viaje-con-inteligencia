export const tourismData: Record<string, TourismStats> = {
  ES: { arrivals: 85000000, receipts: 92000000000, year: 2024, source: 'OWID' },
  US: { arrivals: 67000000, receipts: 175000000000, year: 2024, source: 'OWID' },
  FR: { arrivals: 100000000, receipts: 65000000000, year: 2024, source: 'OWID' },
  IT: { arrivals: 57000000, receipts: 48000000000, year: 2024, source: 'OWID' },
  TR: { arrivals: 55000000, expenses: 43000000000, year: 2024, source: 'OWID' },
  MX: { arrivals: 42000000, receipts: 28000000000, year: 2024, source: 'OWID' },
  GB: { arrivals: 38000000, receipts: 52000000000, year: 2024, source: 'OWID' },
  DE: { arrivals: 33000000, receipts: 48000000000, year: 2024, source: 'OWID' },
  GR: { arrivals: 33000000, receipts: 20000000000, year: 2024, source: 'OWID' },
  AT: { arrivals: 31000000, receipts: 22000000000, year: 2024, source: 'OWID' },
  PT: { arrivals: 25000000, receipts: 22000000000, year: 2024, source: 'OWID' },
  NL: { arrivals: 20000000, receipts: 18000000000, year: 2024, source: 'OWID' },
  TH: { arrivals: 28000000, receipts: 46000000000, year: 2024, source: 'OWID' },
  JP: { arrivals: 25000000, receipts: 34000000000, year: 2024, source: 'OWID' },
  CN: { arrivals: 29000000, receipts: 55000000000, year: 2024, source: 'OWID' },
  AU: { arrivals: 9500000, receipts: 22000000000, year: 2024, source: 'OWID' },
  CA: { arrivals: 23000000, receipts: 20000000000, year: 2024, source: 'OWID' },
  BR: { arrivals: 6600000, receipts: 6100000000, year: 2024, source: 'OWID' },
  AR: { arrivals: 5700000, receipts: 4900000000, year: 2024, source: 'OWID' },
  CL: { arrivals: 4500000, receipts: 3800000000, year: 2024, source: 'OWID' },
  CO: { arrivals: 4000000, receipts: 4100000000, year: 2024, source: 'OWID' },
  IN: { arrivals: 18000000, receipts: 28000000000, year: 2024, source: 'OWID' },
  VN: { arrivals: 16000000, receipts: 24000000000, year: 2024, source: 'OWID' },
  EG: { arrivals: 14000000, receipts: 10000000000, year: 2024, source: 'OWID' },
  MA: { arrivals: 13000000, receipts: 8500000000, year: 2024, source: 'OWID' },
  ID: { arrivals: 16000000, receipts: 19000000000, year: 2024, source: 'OWID' },
  KR: { arrivals: 11000000, receipts: 14000000000, year: 2024, source: 'OWID' },
  MY: { arrivals: 26000000, receipts: 25000000000, year: 2024, source: 'OWID' },
  SG: { arrivals: 18000000, receipts: 24000000000, year: 2024, source: 'OWID' },
  PH: { arrivals: 5400000, receipts: 4200000000, year: 2024, source: 'OWID' },
  CH: { arrivals: 12000000, receipts: 18000000000, year: 2024, source: 'OWID' },
  SE: { arrivals: 7500000, receipts: 6800000000, year: 2024, source: 'OWID' },
  NO: { arrivals: 5600000, receipts: 5500000000, year: 2024, source: 'OWID' },
  DK: { arrivals: 14000000, receipts: 10000000000, year: 2024, source: 'OWID' },
  FI: { arrivals: 4500000, receipts: 3800000000, year: 2024, source: 'OWID' },
  IE: { arrivals: 11000000, receipts: 9000000000, year: 2024, source: 'OWID' },
  CZ: { arrivals: 12000000, receipts: 6200000000, year: 2024, source: 'OWID' },
  HU: { arrivals: 9000000, receipts: 4500000000, year: 2024, source: 'OWID' },
  PL: { arrivals: 21000000, receipts: 14000000000, year: 2024, source: 'OWID' },
  HR: { arrivals: 17000000, receipts: 12000000000, year: 2024, source: 'OWID' },
  RO: { arrivals: 3500000, receipts: 2500000000, year: 2024, source: 'OWID' },
  RU: { arrivals: 24000000, receipts: 18000000000, year: 2024, source: 'OWID' },
  UA: { arrivals: 3000000, receipts: 2500000000, year: 2024, source: 'OWID' },
  ZA: { arrivals: 10000000, receipts: 9000000000, year: 2024, source: 'OWID' },
  KE: { arrivals: 2000000, receipts: 1500000000, year: 2024, source: 'OWID' },
  TZ: { arrivals: 1500000, receipts: 1100000000, year: 2024, source: 'OWID' },
  GH: { arrivals: 1300000, receipts: 900000000, year: 2024, source: 'OWID' },
  TN: { arrivals: 9000000, receipts: 4500000000, year: 2024, source: 'OWID' },
  DZ: { arrivals: 2500000, receipts: 1200000000, year: 2024, source: 'OWID' },
};

export interface TourismStats {
  arrivals: number;
  receipts?: number;
  expenses?: number;
  year: number;
  source: string;
}

export function getTourismStats(countryCode: string): TourismStats | null {
  return tourismData[countryCode.toUpperCase()] || null;
}

export function formatTourismStats(stats: TourismStats): string {
  const arrivals = stats.arrivals >= 1000000 
    ? `${(stats.arrivals / 1000000).toFixed(1)}M` 
    : stats.arrivals.toLocaleString();
  
  const receipts = stats.receipts 
    ? `$${(stats.receipts / 1000000000).toFixed(1)}B` 
    : stats.expenses 
      ? `$${(stats.expenses / 1000000000).toFixed(1)}B` 
      : 'N/A';
  
  return `Llegadas: ${arrivals} turistas (${stats.year}) | Ingresos: ${receipts}`;
}