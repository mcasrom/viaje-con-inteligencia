//import { paisesData } from './paises';

export interface DestinationFeatures {
  code: string;
  nombre: string;
  bandera: string;
  arrivals: number;
  receipts: number;
  riskScore: number;
  riskLevel: number;
  ipc: number;
  clima: string;
  idiomaEspanol: boolean;
  continente: string;
  distanciaES: number;
}

function getRiskScore(nivelRiesgo: string): number {
  const map: Record<string, number> = {
    'sin-riesgo': 1,
    'bajo': 2,
    'medio': 3,
    'alto': 4,
    'muy-alto': 5,
  };
  return map[nivelRiesgo] || 3;
}

function getClima(continente: string): string {
  const climas: Record<string, string> = {
    'Europa': 'templado',
    'Américas': 'tropical',
    'Asia': 'monzónico',
    'África': 'desertico',
    'Oceanía': 'tropical',
  };
  return climas[continente] || 'templado';
}

function getContinente(continente: string): string {
  return continente || 'Europa';
}

const distanciaES: Record<string, number> = {
  pt: 650, es: 0, fr: 1050, de: 1850, it: 1700, gb: 1750, nl: 1650,
  be: 1550, at: 1900, ch: 1450, gr: 2900, tr: 3900, ru: 4500, ua: 3800,
  us: 8900, ca: 8700, mx: 10200, br: 9800, ar: 11700, cl: 12000, co: 9500,
  jp: 10800, cn: 9800, in: 8500, th: 10500, vn: 10500, id: 12500, my: 11500,
  ph: 11500, au: 17000, nz: 19000, eg: 4000, ma: 1200, za: 7800, ke: 6500,
  dz: 1800, tn: 2100, ly: 2800, et: 5500, tz: 6800, gh: 4800,
  ng: 4300, np: 8200, lk: 9200, bd: 9100, pk: 7000, ir: 5800,
  iq: 5000, sa: 5500, ae: 6000, il: 4500, jo: 4300, lb: 4000, sy: 4300,
};

// Datos hardcodeados para evitar tree-shaking con paisesData
const paisesClustering: Record<string, { nombre: string; bandera: string; continente: string; nivelRiesgo: string }> = {
  es: { nombre: 'España', bandera: '🇪🇸', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  fr: { nombre: 'Francia', bandera: '🇫🇷', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  it: { nombre: 'Italia', bandera: '🇮🇹', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  gb: { nombre: 'Reino Unido', bandera: '🇬🇧', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  de: { nombre: 'Alemania', bandera: '🇩🇪', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  pt: { nombre: 'Portugal', bandera: '🇵🇹', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  gr: { nombre: 'Grecia', bandera: '🇬🇷', continente: 'Europa', nivelRiesgo: 'sin-riesgo' },
  us: { nombre: 'Estados Unidos', bandera: '🇺🇸', continente: 'Américas', nivelRiesgo: 'bajo' },
  ca: { nombre: 'Canadá', bandera: '🇨🇦', continente: 'Américas', nivelRiesgo: 'sin-riesgo' },
  mx: { nombre: 'México', bandera: '🇲🇽', continente: 'Américas', nivelRiesgo: 'bajo' },
  br: { nombre: 'Brasil', bandera: '🇧🇷', continente: 'Américas', nivelRiesgo: 'bajo' },
  ar: { nombre: 'Argentina', bandera: '🇦🇷', continente: 'Américas', nivelRiesgo: 'bajo' },
  jp: { nombre: 'Japón', bandera: '🇯🇵', continente: 'Asia', nivelRiesgo: 'sin-riesgo' },
  cn: { nombre: 'China', bandera: '🇨🇳', continente: 'Asia', nivelRiesgo: 'bajo' },
  th: { nombre: 'Tailandia', bandera: '🇹🇭', continente: 'Asia', nivelRiesgo: 'medio' },
  in: { nombre: 'India', bandera: '🇮🇳', continente: 'Asia', nivelRiesgo: 'medio' },
  vn: { nombre: 'Vietnam', bandera: '🇻🇳', continente: 'Asia', nivelRiesgo: 'bajo' },
  id: { nombre: 'Indonesia', bandera: '🇮🇩', continente: 'Asia', nivelRiesgo: 'bajo' },
  au: { nombre: 'Australia', bandera: '🇦🇺', continente: 'Oceanía', nivelRiesgo: 'sin-riesgo' },
  nz: { nombre: 'Nueva Zelanda', bandera: '🇳🇿', continente: 'Oceanía', nivelRiesgo: 'sin-riesgo' },
  eg: { nombre: 'Egipto', bandera: '🇪🇬', continente: 'África', nivelRiesgo: 'medio' },
  ma: { nombre: 'Marruecos', bandera: '🇲🇦', continente: 'África', nivelRiesgo: 'bajo' },
  za: { nombre: 'Sudáfrica', bandera: '🇿🇦', continente: 'África', nivelRiesgo: 'medio' },
  tr: { nombre: 'Turquía', bandera: '🇹🇷', continente: 'Asia', nivelRiesgo: 'bajo' },
};

const ipcData: Record<string, number> = {
  ch: 130, no: 125, us: 110, de: 105, at: 105, nl: 105, be: 104,
  se: 103, dk: 103, jp: 102, fi: 101, gb: 100, fr: 100, it: 98, ca: 97,
  es: 95, au: 95, nz: 93, sg: 90, ie: 88, pt: 85, gr: 82, cz: 80,
  kr: 78, mx: 75, pl: 72, hu: 70, ar: 65, br: 60, th: 55, cn: 52, in: 45,
  ma: 42, eg: 40, tr: 38, co: 35, cl: 32, vn: 30, id: 28, ph: 25,
};

const turismoData: Record<string, { arrivals: number; receipts: number; spendPerDay: number; stayAvg: number }> = {
  fr: { arrivals: 100000000, receipts: 65000000000, spendPerDay: 75, stayAvg: 7 },
  es: { arrivals: 85000000, receipts: 92000000000, spendPerDay: 85, stayAvg: 8 },
  us: { arrivals: 67000000, receipts: 175000000000, spendPerDay: 150, stayAvg: 10 },
  it: { arrivals: 57000000, receipts: 48000000000, spendPerDay: 80, stayAvg: 7 },
  tr: { arrivals: 55000000, receipts: 43000000000, spendPerDay: 50, stayAvg: 9 },
  mx: { arrivals: 42000000, receipts: 28000000000, spendPerDay: 45, stayAvg: 8 },
  gb: { arrivals: 38000000, receipts: 52000000000, spendPerDay: 95, stayAvg: 7 },
  de: { arrivals: 33000000, receipts: 48000000, spendPerDay: 90, stayAvg: 6 },
  gr: { arrivals: 33000000, receipts: 20000000, spendPerDay: 55, stayAvg: 8 },
  pt: { arrivals: 25000000, receipts: 22000000, spendPerDay: 50, stayAvg: 7 },
  th: { arrivals: 28000000, receipts: 46000000, spendPerDay: 45, stayAvg: 10 },
  jp: { arrivals: 25000000, receipts: 34000000, spendPerDay: 100, stayAvg: 9 },
  cn: { arrivals: 29000000, receipts: 55000000, spendPerDay: 60, stayAvg: 8 },
  in: { arrivals: 18000000, receipts: 28000000, spendPerDay: 35, stayAvg: 11 },
  eg: { arrivals: 14000000, receipts: 10000000, spendPerDay: 40, stayAvg: 9 },
  ma: { arrivals: 13000000, receipts: 8500000, spendPerDay: 35, stayAvg: 8 },
  au: { arrivals: 9500000, receipts: 22000000, spendPerDay: 85, stayAvg: 10 },
  ca: { arrivals: 23000000, receipts: 20000000, spendPerDay: 90, stayAvg: 8 },
  br: { arrivals: 6600000, receipts: 6100000, spendPerDay: 55, stayAvg: 10 },
  ar: { arrivals: 5700000, receipts: 4900000, spendPerDay: 50, stayAvg: 9 },
};

const espanolHabla: Record<string, boolean> = {
  es: true, mx: true, ar: true, co: true, cl: true, pe: true, ve: true,
  uy: true, py: true, bo: true, gt: true, sv: true, hn: true, ni: true,
  cr: true, pa: true, do: true, cu: true, ec: true, gq: true, ph: true,
};

export function getDestinationsWithFeatures(): DestinationFeatures[] {
  const destinations: DestinationFeatures[] = [];

  Object.entries(paisesClustering).forEach(([code, pais]) => {
    const tourism = turismoData[code] || { arrivals: 0, receipts: 0 };
    const ipc = ipcData[code] || 50;

    if (tourism.arrivals > 0 || code === 'es') {
      destinations.push({
        code,
        nombre: pais.nombre,
        bandera: pais.bandera,
        arrivals: tourism.arrivals,
        receipts: tourism.receipts,
        riskScore: 100 - (getRiskScore(pais.nivelRiesgo) * 20),
        riskLevel: getRiskScore(pais.nivelRiesgo),
        ipc,
        clima: getClima(pais.continente),
        idiomaEspanol: espanolHabla[code] || false,
        continente: getContinente(pais.continente),
        distanciaES: distanciaES[code] || 5000,
      });
    }
  });

  return destinations.sort((a, b) => b.arrivals - a.arrivals).slice(0, 50);
}

export interface SimilarResult {
  code: string;
  nombre: string;
  bandera: string;
  score: number;
  reason: string;
}

export function findSimilarDestinations(
  code: string,
  limit: number = 5
): SimilarResult[] {
  const destinations = getDestinationsWithFeatures();
  const target = destinations.find(d => d.code === code);
  
  if (!target) return [];
  
  const targetFeatures = normalizeSingle(destinations, target);
  
  const scored = destinations
    .filter(d => d.code !== code)
    .map(d => {
      const features = normalizeSingle(destinations, d);
      const score = 1 / (1 + euclideanDistance(targetFeatures, features));
      return { ...d, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(d => ({
      code: d.code,
      nombre: d.nombre,
      bandera: d.bandera,
      score: Math.round(d.score * 100) / 100,
      reason: getSimilarityReason(target, d),
    }));
  
  return scored;
}

function normalizeSingle(
  destinations: DestinationFeatures[],
  dest: DestinationFeatures
): number[] {
  return [
    dest.riskScore,
    dest.ipc,
    dest.distanciaES / 15000,
    Math.log10(dest.arrivals + 1) / 8,
  ];
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function getSimilarityReason(target: DestinationFeatures, dest: DestinationFeatures): string {
  const reasons: string[] = [];
  if (Math.abs(target.riskScore - dest.riskScore) < 15) reasons.push('seguridad similar');
  if (Math.abs(target.ipc - dest.ipc) < 15) reasons.push('coste similar');
  if (target.continente === dest.continente) reasons.push('mismo continente');
  if (target.idiomaEspanol === dest.idiomaEspanol && dest.idiomaEspanol) reasons.push('español');
  return reasons.length > 0 ? reasons.join(', ') : 'perfil cercano';
}

export const clusteringFeatures = [
  { name: 'riskScore', weight: 2, label: 'Seguridad' },
  { name: 'ipc', weight: 1.5, label: 'Coste vida' },
  { name: 'distanciaES', weight: 1, label: 'Distancia' },
  { name: 'arrivals', weight: 0.5, label: 'Turismo' },
];

export function normalizeFeatures(destinations: DestinationFeatures[]): number[][] {
  const features = destinations.map(d => [
    d.riskScore,
    d.ipc,
    d.distanciaES / 15000,
    Math.log10(d.arrivals + 1) / 8,
  ]);
  const weights = clusteringFeatures.map(f => f.weight);
  return features.map(f => f.map((v, i) => v * weights[i]));
}

export interface ClusterResult {
  cluster: number;
  label: string;
  description: string;
  destinations: string[];
}

function kMeansSimple(
  points: number[][],
  k: number,
  maxIterations: number = 20
): number[] {
  if (points.length < k) return points.map(() => 0);
  
  let centroids = points.slice(0, k).map(p => [...p]);
  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    assignments = points.map(point => {
      let minDist = Infinity;
      let cluster = 0;
      centroids.forEach((c, i) => {
        const dist = Math.sqrt(
          point.reduce((sum, v, j) => sum + Math.pow(v - c[j], 2), 0)
        );
        if (dist < minDist) {
          minDist = dist;
          cluster = i;
        }
      });
      return cluster;
    });

    const newCentroids: number[][] = Array(k)
      .fill(null)
      .map(() => Array(points[0].length).fill(0));
    const counts = new Array(k).fill(0);

    assignments.forEach((cluster, i) => {
      counts[cluster]++;
      points[i].forEach((v, j) => {
        newCentroids[cluster][j] += v;
      });
    });

    centroids = newCentroids.map((c, i) =>
      counts[i] > 0 ? c.map(v => v / counts[i]) : centroids[i]
    );
  }

  return assignments;
}

const clusterLabels = [
  { label: 'Economicos cercan', description: 'Coste bajo, cerca de España, riesgo bajo', color: 'green' },
  { label: 'Turisticos populares', description: 'Mucho turismo, buena infraestructura', color: 'blue' },
  { label: 'Exoticos aventura', description: 'Lejanos, riesgo medio-alto, experiencia unica', color: 'orange' },
  { label: 'Europeos cercanos', description: 'Europa, coste medio, muy seguros', color: 'cyan' },
  { label: 'Lujo caro', description: 'Coste alto, alta seguridad', color: 'purple' },
];

export function clusterDestinations(
  nClusters: number = 4
): ClusterResult[] {
  const destinations = getDestinationsWithFeatures();
  const features = normalizeFeatures(destinations);
  const assignments = kMeansSimple(features, nClusters);

  const clusters: Record<number, string[]> = {};
  assignments.forEach((cluster, i) => {
    if (!clusters[cluster]) clusters[cluster] = [];
    clusters[cluster].push(destinations[i].code);
  });

  return Object.entries(clusters).map(([cluster, codes]) => ({
    cluster: parseInt(cluster),
    label: clusterLabels[parseInt(cluster)]?.label || `Grupo ${cluster}`,
    description: clusterLabels[parseInt(cluster)]?.description || '',
    destinations: codes,
  }));
}

export interface TourismKPI {
  arrivals: number;
  receipts: number;
  spendPerDay: number;
  stayAvg: number;
}

export function getTourismKPIs(): Record<string, TourismKPI> {
  const kpis: Record<string, TourismKPI> = {};
  Object.entries(turismoData).forEach(([code, data]) => {
    kpis[code] = {
      arrivals: data.arrivals,
      receipts: data.receipts,
      spendPerDay: data.spendPerDay || Math.round(data.receipts / data.arrivals),
      stayAvg: data.stayAvg || 7,
    };
  });
  return kpis;
}

export function getTopDestinations(metric: string, limit: number = 10) {
  const destinations = getDestinationsWithFeatures();
  const sorted = [...destinations].sort((a, b) => {
    if (metric === 'arrivals') return b.arrivals - a.arrivals;
    if (metric === 'receipts') return b.receipts - a.receipts;
    if (metric === 'spendPerDay') {
      const aSpend = turismoData[a.code]?.spendPerDay || 0;
      const bSpend = turismoData[b.code]?.spendPerDay || 0;
      return bSpend - aSpend;
    }
    return 0;
  });

  return sorted.slice(0, limit).map(d => ({
    code: d.code,
    nombre: d.nombre,
    bandera: d.bandera,
    arrivals: d.arrivals,
    receipts: d.receipts,
    spendPerDay: turismoData[d.code]?.spendPerDay || 0,
    stayAvg: turismoData[d.code]?.stayAvg || 0,
  }));
}