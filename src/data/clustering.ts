import { paisesData } from './paises';

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
  PT: 650, ES: 0, FR: 1050, DE: 1850, IT: 1700, GB: 1750, NL: 1650,
  BE: 1550, AT: 1900, CH: 1450, GR: 2900, TR: 3900, RU: 4500, UA: 3800,
  US: 8900, CA: 8700, MX: 10200, BR: 9800, AR: 11700, CL: 12000, CO: 9500,
  JP: 10800, CN: 9800, IN: 8500, TH: 10500, VN: 10500, ID: 12500, MY: 11500,
  PH: 11500, AU: 17000, NZ: 19000, EG: 4000, MA: 1200, ZA: 7800, KE: 6500,
  DZ: 1800, TN: 2100, LY: 2800, ET: 5500, TZ: 6800, GH: 4800,
  NG: 4300, NP: 8200, LK: 9200, BD: 9100, PK: 7000, IR: 5800,
  IQ: 5000, SA: 5500, AE: 6000, IL: 4500, JO: 4300, LB: 4000, SY: 4300,
};

const ipcData: Record<string, number> = {
  CH: 130, NO: 125, US: 110, DE: 105, AT: 105, NL: 105, BE: 104,
  SE: 103, DK: 103, JP: 102, FI: 101, GB: 100, FR: 100, IT: 98, CA: 97,
  ES: 95, AU: 95, NZ: 93, SG: 90, IE: 88, PT: 85, GR: 82, CZ: 80,
  KR: 78, MX: 75, PL: 72, HU: 70, AR: 65, BR: 60, TH: 55, CN: 52, IN: 45,
  MA: 42, EG: 40, TR: 38, CO: 35, CL: 32, VN: 30, ID: 28, PH: 25,
};

const turismoData: Record<string, { arrivals: number; receipts: number }> = {
  ES: { arrivals: 85000000, receipts: 92000000000 },
  FR: { arrivals: 100000000, receipts: 65000000000 },
  US: { arrivals: 67000000, receipts: 175000000000 },
  IT: { arrivals: 57000000, receipts: 48000000000 },
  TR: { arrivals: 55000000, receipts: 43000000000 },
  MX: { arrivals: 42000000, receipts: 28000000000 },
  GB: { arrivals: 38000000, receipts: 52000000000 },
  DE: { arrivals: 33000000, receipts: 48000000000 },
  GR: { arrivals: 33000000, receipts: 20000000 },
  PT: { arrivals: 25000000, receipts: 22000000000 },
  TH: { arrivals: 28000000, receipts: 46000000000 },
  JP: { arrivals: 25000000, receipts: 34000000000 },
  CN: { arrivals: 29000000, receipts: 55000000000 },
  IN: { arrivals: 18000000, receipts: 28000000000 },
  EG: { arrivals: 14000000, receipts: 10000000000 },
  MA: { arrivals: 13000000, receipts: 8500000000 },
  AU: { arrivals: 9500000, receipts: 22000000000 },
  CA: { arrivals: 23000000, receipts: 20000000000 },
  BR: { arrivals: 6600000, receipts: 6100000000 },
  AR: { arrivals: 5700000, receipts: 4900000000 },
};

const espanolHabla: Record<string, boolean> = {
  ES: true, MX: true, AR: true, CO: true, CL: true, PE: true, VE: true,
  UY: true, PY: true, BO: true, GT: true, SV: true, HN: true, NI: true,
  CR: true, PA: true, DO: true, CU: true, EC: true, GQ: true, PH: true,
};

export function getDestinationsWithFeatures(): DestinationFeatures[] {
  const destinations: DestinationFeatures[] = [];

  Object.entries(paisesData).forEach(([code, pais]) => {
    const tourism = turismoData[code] || { arrivals: 0, receipts: 0 };
    const ipc = ipcData[code] || 50;

    if (tourism.arrivals > 0 || code === 'ES') {
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