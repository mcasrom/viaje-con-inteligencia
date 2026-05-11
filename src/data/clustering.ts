import { paisesData, DatoPais, NivelRiesgo } from './paises';
import { GPI_DATA } from './indices';

const COORD_ES: [number, number] = [40.4168, -3.7038];

export const ineTourismData: Record<string, { arrivals: number; pernoctaciones: number; estanciaMedia: number; source: string }> = {
  es: { arrivals: 85000000, pernoctaciones: 272000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  fr: { arrivals: 100000000, pernoctaciones: 430000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  us: { arrivals: 67000000, pernoctaciones: 450000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  it: { arrivals: 57000000, pernoctaciones: 210000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
  tr: { arrivals: 55000000, pernoctaciones: 190000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  mx: { arrivals: 42000000, pernoctaciones: 142000000, estanciaMedia: 6.5, source: 'INE/UNWTO' },
  gb: { arrivals: 38000000, pernoctaciones: 143000000, estanciaMedia: 7.1, source: 'INE/UNWTO' },
  de: { arrivals: 33000000, pernoctaciones: 98000000, estanciaMedia: 5.8, source: 'INE/UNWTO' },
  gr: { arrivals: 33000000, pernoctaciones: 95000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  pt: { arrivals: 25000000, pernoctaciones: 82000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  th: { arrivals: 28000000, pernoctaciones: 98000000, estanciaMedia: 10.2, source: 'INE/UNWTO' },
  jp: { arrivals: 25000000, pernoctaciones: 90000000, estanciaMedia: 8.5, source: 'INE/UNWTO' },
  cn: { arrivals: 29000000, pernoctaciones: 105000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  in: { arrivals: 18000000, pernoctaciones: 52000000, estanciaMedia: 11.5, source: 'INE/UNWTO' },
  eg: { arrivals: 14000000, pernoctaciones: 42000000, estanciaMedia: 9.2, source: 'INE/UNWTO' },
  ma: { arrivals: 13000000, pernoctaciones: 38000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  au: { arrivals: 9500000, pernoctaciones: 38000000, estanciaMedia: 10.2, source: 'INE/UNWTO' },
  ca: { arrivals: 23000000, pernoctaciones: 76000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  br: { arrivals: 6600000, pernoctaciones: 21000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  ar: { arrivals: 5700000, pernoctaciones: 15000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  kr: { arrivals: 17500000, pernoctaciones: 52000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
  vn: { arrivals: 16000000, pernoctaciones: 48000000, estanciaMedia: 9.5, source: 'INE/UNWTO' },
  id: { arrivals: 15500000, pernoctaciones: 52000000, estanciaMedia: 10.5, source: 'INE/UNWTO' },
  nl: { arrivals: 22000000, pernoctaciones: 72000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  ch: { arrivals: 6200000, pernoctaciones: 19000000, estanciaMedia: 7.2, source: 'INE/UNWTO' },
  pl: { arrivals: 21000000, pernoctaciones: 65000000, estanciaMedia: 6.2, source: 'INE/UNWTO' },
  se: { arrivals: 7000000, pernoctaciones: 21000000, estanciaMedia: 6.5, source: 'INE/UNWTO' },
  no: { arrivals: 6400000, pernoctaciones: 18500000, estanciaMedia: 6.2, source: 'INE/UNWTO' },
  hr: { arrivals: 17000000, pernoctaciones: 52000000, estanciaMedia: 7.5, source: 'INE/UNWTO' },
  at: { arrivals: 31000000, pernoctaciones: 105000000, estanciaMedia: 7.8, source: 'INE/UNWTO' },
  cz: { arrivals: 12000000, pernoctaciones: 38000000, estanciaMedia: 6.8, source: 'INE/UNWTO' },
};

// Update tourism data dynamically (called from API routes with Supabase data)
export function updateTourismData(data: Record<string, { arrivals: number; pernoctaciones: number; estanciaMedia: number; source: string }>) {
  Object.assign(ineTourismData, data);
}

export function isTourismDataDynamic(): boolean {
  return Object.values(ineTourismData).some(d => d.source === 'INE-live');
}

export interface DestinationFeatures {
  code: string;
  nombre: string;
  bandera: string;
  arrivals: number;
  receipts: number;
  stayAvg?: number;
  tourismSource?: string;
  riskScore: number;
  riskLevel: number;
  ipc: number;
  gpiScore: number | null;
  clima: string;
  idiomaEspanol: boolean;
  continente: string;
  distanciaES: number;
}

function haversineDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371;
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getRiskScore(nivelRiesgo: NivelRiesgo): number {
  const map: Record<NivelRiesgo, number> = {
    'sin-riesgo': 1,
    'bajo': 2,
    'medio': 3,
    'alto': 4,
    'muy-alto': 5,
  };
  return map[nivelRiesgo] || 3;
}

function getIpcNumber(ipcStr: string): number {
  return parseFloat(ipcStr.replace('%', '')) || 5;
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

const espanolHabla: Record<string, boolean> = {
  es: true, mx: true, ar: true, co: true, cl: true, pe: true, ve: true,
  uy: true, py: true, bo: true, gt: true, sv: true, hn: true, ni: true,
  cr: true, pa: true, do: true, cu: true, ec: true, gq: true, ph: true,
};

export type TravelPreference = 'playa' | 'cultural' | 'naturaleza' | 'familiar';

export interface TravelAttributes {
  playa: number;
  cultural: number;
  naturaleza: number;
  familiar: number;
  mejorEpoca: string[];
  duracionOptima: number;
}

export const travelAttributes: Record<string, TravelAttributes> = {
  es: { playa: 9, cultural: 9, naturaleza: 8, familiar: 9, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  fr: { playa: 6, cultural: 10, naturaleza: 7, familiar: 8, mejorEpoca: ['Jun', 'Jul', 'Sep'], duracionOptima: 5 },
  it: { playa: 8, cultural: 10, naturaleza: 7, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  pt: { playa: 9, cultural: 7, naturaleza: 7, familiar: 9, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  gr: { playa: 9, cultural: 8, naturaleza: 6, familiar: 7, mejorEpoca: ['Mayo', 'Jun', 'Jul'], duracionOptima: 7 },
  tr: { playa: 9, cultural: 8, naturaleza: 6, familiar: 7, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 10 },
  us: { playa: 7, cultural: 8, naturaleza: 8, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 14 },
  mx: { playa: 10, cultural: 9, naturaleza: 7, familiar: 9, mejorEpoca: ['Nov', 'Dic', 'Mar'], duracionOptima: 10 },
  br: { playa: 9, cultural: 6, naturaleza: 9, familiar: 7, mejorEpoca: ['Dic', 'Jan', 'Feb'], duracionOptima: 10 },
  ar: { playa: 5, cultural: 8, naturaleza: 6, familiar: 7, mejorEpoca: ['Mar', 'Apr', 'Oct'], duracionOptima: 14 },
  jp: { playa: 5, cultural: 10, naturaleza: 9, familiar: 7, mejorEpoca: ['Mar', 'Apr', 'Oct'], duracionOptima: 10 },
  th: { playa: 10, cultural: 7, naturaleza: 9, familiar: 6, mejorEpoca: ['Nov', 'Dic', 'Feb'], duracionOptima: 14 },
  vn: { playa: 7, cultural: 7, naturaleza: 9, familiar: 6, mejorEpoca: ['Nov', 'Dic', 'Feb'], duracionOptima: 14 },
  id: { playa: 10, cultural: 6, naturaleza: 9, familiar: 6, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 14 },
  au: { playa: 9, cultural: 6, naturaleza: 9, familiar: 8, mejorEpoca: ['Dic', 'Jan', 'Feb'], duracionOptima: 14 },
  nz: { playa: 7, cultural: 5, naturaleza: 10, familiar: 8, mejorEpoca: ['Dic', 'Jan', 'Feb'], duracionOptima: 14 },
  ma: { playa: 9, cultural: 7, naturaleza: 6, familiar: 8, mejorEpoca: ['Mar', 'Apr', 'Mayo'], duracionOptima: 7 },
  eg: { playa: 6, cultural: 10, naturaleza: 8, familiar: 6, mejorEpoca: ['Oct', 'Nov', 'Mar'], duracionOptima: 7 },
  za: { playa: 7, cultural: 6, naturaleza: 9, familiar: 7, mejorEpoca: ['Oct', 'Nov', 'Mar'], duracionOptima: 10 },
  gb: { playa: 4, cultural: 9, naturaleza: 6, familiar: 7, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 5 },
  de: { playa: 3, cultural: 8, naturaleza: 7, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  ca: { playa: 5, cultural: 6, naturaleza: 10, familiar: 9, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 14 },
  cn: { playa: 5, cultural: 9, naturaleza: 7, familiar: 6, mejorEpoca: ['Apr', 'Mayo', 'Oct'], duracionOptima: 10 },
  in: { playa: 5, cultural: 10, naturaleza: 8, familiar: 5, mejorEpoca: ['Oct', 'Nov', 'Feb'], duracionOptima: 14 },
  hr: { playa: 8, cultural: 7, naturaleza: 7, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  cz: { playa: 2, cultural: 9, naturaleza: 6, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 5 },
  pl: { playa: 2, cultural: 8, naturaleza: 7, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 7 },
  nl: { playa: 5, cultural: 8, naturaleza: 6, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 5 },
  ch: { playa: 3, cultural: 8, naturaleza: 10, familiar: 7, mejorEpoca: ['Dic', 'Jan', 'Feb'], duracionOptima: 7 },
};

const gpiMap: Record<string, number> = {};
for (const g of GPI_DATA) {
  gpiMap[g.code.toLowerCase()] = g.score;
}

export function getDestinationsWithFeatures(): DestinationFeatures[] {
  const destinations: DestinationFeatures[] = [];

  Object.values(paisesData).forEach((pais) => {
    if (pais.visible !== false) {
      const coords = pais.mapaCoordenadas;
      const ipcValue = getIpcNumber(pais.indicadores.ipc);
      const distancia = haversineDistance(COORD_ES, coords);
      const tourism = ineTourismData[pais.codigo.toLowerCase()];
      const turistas = tourism?.arrivals || 0;
      const gpiRaw = gpiMap[pais.codigo.toLowerCase()];

      destinations.push({
        code: pais.codigo,
        nombre: pais.nombre,
        bandera: pais.bandera,
        arrivals: turistas,
        receipts: tourism?.pernoctaciones || 0,
        stayAvg: tourism?.estanciaMedia || 7,
        tourismSource: tourism?.source || 'unknown',
        riskScore: 100 - (getRiskScore(pais.nivelRiesgo) * 20),
        riskLevel: getRiskScore(pais.nivelRiesgo),
        ipc: ipcValue,
        gpiScore: gpiRaw ? Math.round((4 - gpiRaw) / 3 * 1000) / 10 : null,
        clima: getClima(pais.continente),
        idiomaEspanol: espanolHabla[pais.codigo] || pais.idioma === 'Español',
        continente: pais.continente,
        distanciaES: distancia,
      });
    }
  });

  return destinations.sort((a, b) => b.arrivals - a.arrivals).slice(0, 95);
}

export const clusteringFeatures = [
  { name: 'riskScore', weight: 2, label: 'Seguridad' },
  { name: 'ipc', weight: 1.5, label: 'Coste vida' },
  { name: 'distanciaES', weight: 1, label: 'Distancia' },
  { name: 'arrivals', weight: 0.5, label: 'Turismo' },
  { name: 'gpiScore', weight: 1, label: 'Paz global' },
];

export function normalizeFeatures(destinations: DestinationFeatures[]): number[][] {
  const features = destinations.map(d => [
    d.riskScore,
    d.ipc,
    d.distanciaES / 15000,
    Math.log10(d.arrivals + 1) / 8,
    d.gpiScore ?? 50,
  ]);
  const weights = clusteringFeatures.map(f => f.weight);
  return features.map(f => f.map((v, i) => v * weights[i]));
}

export interface ClusterResult {
  cluster: number;
  label: string;
  description: string;
  destinations: string[];
  _centroid?: number[];
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

function getClusterLabel(features: number[]): string {
  const [risk, ipc, distancia, turismo] = features;
  
  // Distancia: <2000 = europeo cercano
  // IPC: >80 = caro, <60 = barato  
  // Turismo: >0.5 = popular
  if (distancia < 0.15 && distancia > 0) return 'Europa occidental';
  if (distancia < 0.3 && distancia >= 0.15) return 'Europa central';
  if (distancia < 0.5 && ipc < 50) return 'Europa oriental económico';
  if (ipc > 80) return 'Destinos premium';
  if (turismo > 0.5) return 'Turismo masivo';
  if (distancia > 0.7) return 'Larga distancia';
  return 'Destinos various';
}

function getClusterDescription(features: number[]): string {
  const [risk, ipc, distancia, turismo] = features;
  const parts: string[] = [];
  if (distancia < 0.2) parts.push('cerca');
  else if (distancia > 0.6) parts.push('lejano');
  if (ipc > 80) parts.push('caro');
  else if (ipc < 50) parts.push('económico');
  if (turismo > 0.5) parts.push('turístico');
  return parts.join(', ') || 'mixto';
}

const clusterColors = ['green', 'blue', 'orange', 'cyan', 'purple', 'pink'];

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

  // Calcularcentroidspromediopara labels
  const centroids: number[][] = Array(nClusters).fill(null).map(() => [0, 0, 0, 0]);
  const counts = Array(nClusters).fill(0);
  
  assignments.forEach((cluster, i) => {
    counts[cluster]++;
    features[i].forEach((f, j) => centroids[cluster][j] += f);
  });
  
  centroids.forEach((c, i) => {
    if (counts[i] > 0) c.forEach((_, j) => c[j] /= counts[i]);
  });

  return Object.entries(clusters).map(([clusterIdx, codes]) => {
    const cluster = parseInt(clusterIdx);
    const centroid = centroids[cluster];
    return {
      cluster,
      label: getClusterLabel(centroid),
      description: getClusterDescription(centroid),
      color: clusterColors[cluster % clusterColors.length],
      destinations: codes,
      _centroid: centroid.map((v: number) => Math.round(v * 100) / 100),
    };
  });
}

export interface ItineraryRecommendation {
  destination: string;
  score: number;
  reason: string;
  days: number;
  bestTime: string[];
  highlights: string[];
}

export interface TravelPreferences {
  preferencia: TravelPreference;
  presupuesto: 'bajo' | 'medio' | 'alto';
  duracion: number;
  desdeES: boolean;
}

export function getRecommendations(
  preferences: TravelPreferences,
  limit: number = 3
): ItineraryRecommendation[] {
  const destinations = getDestinationsWithFeatures();
  const preference = preferences.preferencia;
  const budget = preferences.presupuesto;
  
  const scored = destinations
    .filter(d => travelAttributes[d.code])
    .map(d => {
      const attrs = travelAttributes[d.code];
      const pais = paisesData[d.code];
      let score = 0;
      const highlights: string[] = [];
      
      const prefScore = {
        playa: attrs.playa,
        cultural: attrs.cultural,
        naturaleza: attrs.naturaleza,
        familiar: attrs.familiar,
      }[preference] || 5;
      
      score += prefScore * 3;
      
      if (prefScore >= 9) score += 20;
      else if (prefScore >= 7) score += 12;
      else if (prefScore >= 5) score += 5;
      
      if (budget === 'bajo') {
        if (d.ipc < 50) score += 15;
        else if (d.ipc < 70) score += 10;
        else if (d.ipc < 90) score += 5;
      } else if (budget === 'medio') {
        if (d.ipc >= 50 && d.ipc < 100) score += 12;
        else if (d.ipc >= 100) score += 5;
      } else {
        if (d.ipc >= 90) score += 15;
        else if (d.ipc >= 70) score += 8;
      }
      
      if (preferences.desdeES) {
        if (d.distanciaES < 2000) score += 10;
        else if (d.distanciaES < 5000) score += 6;
        else if (d.distanciaES < 10000) score += 3;
      }
      
      if (pais?.nivelRiesgo === 'sin-riesgo') score += 8;
      else if (pais?.nivelRiesgo === 'bajo') score += 4;
      else if (pais?.nivelRiesgo === 'medio') score -= 5;
      
      if (attrs.familiar >= 8) highlights.push('familiar');
      if (attrs.naturaleza >= 8) highlights.push('naturaleza');
      if (attrs.cultural >= 8) highlights.push('cultural');
      if (attrs.playa >= 8) highlights.push('playa');
      
      return {
        destination: d.code,
        score,
        reason: highlights.slice(0, 3).join(', ') || 'opción equilibrada',
        days: attrs.duracionOptima,
        bestTime: attrs.mejorEpoca,
        highlights,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored;
}

export interface SimilarResult {
  code: string;
  nombre: string;
  bandera: string;
  score: number;
  reason: string;
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
  if (Math.abs(target.riskScore - dest.riskScore) < 15) reasons.push('seguridad相似');
  if (Math.abs(target.ipc - dest.ipc) < 15) reasons.push('coste相似');
  if (target.continente === dest.continente) reasons.push('同一大洲');
  if (target.idiomaEspanol === dest.idiomaEspanol && dest.idiomaEspanol) reasons.push('西班牙语');
  return reasons.length > 0 ? reasons.join(', ') : 'perfil cercano';
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

export interface TourismKPI {
  arrivals: number;
  receipts: number;
  spendPerDay: number;
  stayAvg: number;
}

const turismoData: Record<string, TourismKPI> = {
  es: { arrivals: 85000000, receipts: 92000000000, spendPerDay: 85, stayAvg: 8 },
  fr: { arrivals: 100000000, receipts: 65000000000, spendPerDay: 75, stayAvg: 7 },
  us: { arrivals: 67000000, receipts: 175000000000, spendPerDay: 150, stayAvg: 10 },
  it: { arrivals: 57000000, receipts: 48000000000, spendPerDay: 80, stayAvg: 7 },
};

export function getTourismKPIs(): Record<string, TourismKPI> {
  return turismoData;
}

export function getTopDestinations(metric: string, limit: number = 10) {
  const destinations = getDestinationsWithFeatures();
  const sorted = [...destinations].sort((a, b) => {
    if (metric === 'arrivals') return b.arrivals - a.arrivals;
    if (metric === 'receipts') return b.receipts - b.receipts;
    return 0;
  });

  return sorted.slice(0, limit).map(d => ({
    code: d.code,
    nombre: d.nombre,
    bandera: d.bandera,
    arrivals: d.arrivals,
    receipts: d.receipts,
  }));
}
// Extensión travelAttributes - países adicionales
Object.assign(travelAttributes, {
  be: { playa: 3, cultural: 9, naturaleza: 5, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 4 },
  dk: { playa: 4, cultural: 8, naturaleza: 7, familiar: 8, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 5 },
  fi: { playa: 3, cultural: 7, naturaleza: 9, familiar: 7, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 7 },
  ie: { playa: 4, cultural: 8, naturaleza: 8, familiar: 7, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 5 },
  is: { playa: 2, cultural: 6, naturaleza: 10, familiar: 6, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 7 },
  hu: { playa: 3, cultural: 9, naturaleza: 6, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 4 },
  bg: { playa: 7, cultural: 7, naturaleza: 6, familiar: 7, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 7 },
  ee: { playa: 3, cultural: 8, naturaleza: 7, familiar: 7, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 4 },
  lt: { playa: 4, cultural: 7, naturaleza: 7, familiar: 7, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 4 },
  lv: { playa: 4, cultural: 7, naturaleza: 7, familiar: 7, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 4 },
  si: { playa: 3, cultural: 7, naturaleza: 9, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 5 },
  mt: { playa: 9, cultural: 8, naturaleza: 5, familiar: 8, mejorEpoca: ['Mayo', 'Jun', 'Oct'], duracionOptima: 5 },
  ae: { playa: 8, cultural: 7, naturaleza: 4, familiar: 7, mejorEpoca: ['Nov', 'Dic', 'Mar'], duracionOptima: 5 },
  sg: { playa: 6, cultural: 8, naturaleza: 6, familiar: 8, mejorEpoca: ['Feb', 'Mar', 'Apr'], duracionOptima: 5 },
  my: { playa: 8, cultural: 7, naturaleza: 8, familiar: 7, mejorEpoca: ['Mayo', 'Jun', 'Jul'], duracionOptima: 10 },
  ph: { playa: 10, cultural: 6, naturaleza: 8, familiar: 6, mejorEpoca: ['Nov', 'Dic', 'Mar'], duracionOptima: 14 },
  lk: { playa: 8, cultural: 8, naturaleza: 8, familiar: 6, mejorEpoca: ['Dic', 'Jan', 'Mar'], duracionOptima: 10 },
  cl: { playa: 6, cultural: 7, naturaleza: 9, familiar: 7, mejorEpoca: ['Nov', 'Dic', 'Mar'], duracionOptima: 14 },
  co: { playa: 7, cultural: 8, naturaleza: 9, familiar: 6, mejorEpoca: ['Dic', 'Jan', 'Jun'], duracionOptima: 10 },
  pe: { playa: 5, cultural: 10, naturaleza: 9, familiar: 6, mejorEpoca: ['Mayo', 'Jun', 'Sep'], duracionOptima: 14 },
  do: { playa: 10, cultural: 5, naturaleza: 6, familiar: 8, mejorEpoca: ['Nov', 'Dic', 'Apr'], duracionOptima: 7 },
  cu: { playa: 9, cultural: 8, naturaleza: 6, familiar: 6, mejorEpoca: ['Nov', 'Dic', 'Mar'], duracionOptima: 10 },
  pa: { playa: 7, cultural: 7, naturaleza: 8, familiar: 7, mejorEpoca: ['Dic', 'Jan', 'Mar'], duracionOptima: 7 },
  ec: { playa: 6, cultural: 7, naturaleza: 10, familiar: 6, mejorEpoca: ['Jun', 'Jul', 'Aug'], duracionOptima: 10 },
  ke: { playa: 6, cultural: 6, naturaleza: 10, familiar: 6, mejorEpoca: ['Jun', 'Jul', 'Sep'], duracionOptima: 10 },
  tz: { playa: 7, cultural: 5, naturaleza: 10, familiar: 6, mejorEpoca: ['Jun', 'Jul', 'Sep'], duracionOptima: 10 },
  gh: { playa: 6, cultural: 7, naturaleza: 7, familiar: 6, mejorEpoca: ['Nov', 'Dic', 'Jan'], duracionOptima: 7 },
  sa: { playa: 5, cultural: 8, naturaleza: 5, familiar: 5, mejorEpoca: ['Oct', 'Nov', 'Mar'], duracionOptima: 7 },
  jo: { playa: 4, cultural: 9, naturaleza: 7, familiar: 6, mejorEpoca: ['Mar', 'Apr', 'Oct'], duracionOptima: 7 },
  il: { playa: 6, cultural: 10, naturaleza: 6, familiar: 6, mejorEpoca: ['Mar', 'Apr', 'Oct'], duracionOptima: 7 },
});
