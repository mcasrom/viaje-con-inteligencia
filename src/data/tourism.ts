// Top 20 países más visitados - datos OMT/UNWTO 2024
export const tourismData: Record<string, TourismStats> = {
  FR: { arrivals: 102000000, receipts: 65000000000, year: 2024, source: 'UNWTO' },
  ES: { arrivals: 93800000, receipts: 92000000000, year: 2024, source: 'UNWTO' },
  US: { arrivals: 72400000, receipts: 175000000000, year: 2024, source: 'UNWTO' },
  TR: { arrivals: 60600000, receipts: 43000000000, year: 2024, source: 'UNWTO' },
  IT: { arrivals: 57800000, receipts: 48000000000, year: 2024, source: 'UNWTO' },
  MX: { arrivals: 45000000, receipts: 28000000000, year: 2024, source: 'UNWTO' },
  GB: { arrivals: 37500000, receipts: 52000000000, year: 2024, source: 'UNWTO' },
  JP: { arrivals: 36900000, receipts: 34000000000, year: 2024, source: 'UNWTO' },
  DE: { arrivals: 36000000, receipts: 48000000000, year: 2024, source: 'UNWTO' },
  GR: { arrivals: 35500000, receipts: 20000000000, year: 2024, source: 'UNWTO' },
  TH: { arrivals: 32000000, receipts: 46000000000, year: 2024, source: 'UNWTO' },
  CN: { arrivals: 29000000, receipts: 55000000000, year: 2024, source: 'UNWTO' },
  AT: { arrivals: 31000000, receipts: 22000000000, year: 2024, source: 'UNWTO' },
  PT: { arrivals: 25000000, receipts: 22000000000, year: 2024, source: 'UNWTO' },
  NL: { arrivals: 20000000, receipts: 18000000000, year: 2024, source: 'UNWTO' },
  CA: { arrivals: 23000000, receipts: 20000000000, year: 2024, source: 'UNWTO' },
  PL: { arrivals: 21000000, receipts: 14000000000, year: 2024, source: 'UNWTO' },
  HR: { arrivals: 17000000, receipts: 12000000000, year: 2024, source: 'UNWTO' },
  SE: { arrivals: 13000000, receipts: 6800000000, year: 2024, source: 'UNWTO' },
  CH: { arrivals: 14000000, receipts: 18000000000, year: 2024, source: 'UNWTO' },
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

export function getAllTourismData(): TourismStats[] {
  return Object.values(tourismData);
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

export function getTopDestinations(limit: number = 10): { code: string; stats: TourismStats }[] {
  return Object.entries(tourismData)
    .sort((a, b) => b[1].arrivals - a[1].arrivals)
    .slice(0, limit)
    .map(([code, stats]) => ({ code, stats }));
}