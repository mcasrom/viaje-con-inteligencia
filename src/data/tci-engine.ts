import { paisesData } from './paises';
import { ineTourismData } from './clustering';
import { IPC_DATA } from './indices';

// Estacionalidad turística por mes (índice base 100)
// Fuente: patrones históricos de turismo en España
const SEASONALITY_MAP: Record<string, Record<string, number>> = {
  es: { '1': 40, '2': 45, '3': 65, '4': 85, '5': 100, '6': 120, '7': 140, '8': 145, '9': 110, '10': 80, '11': 55, '12': 50 },
  fr: { '1': 50, '2': 55, '3': 70, '4': 85, '5': 95, '6': 110, '7': 130, '8': 135, '9': 100, '10': 75, '11': 55, '12': 55 },
  it: { '1': 45, '2': 50, '3': 70, '4': 90, '5': 105, '6': 120, '7': 135, '8': 140, '9': 105, '10': 80, '11': 55, '12': 50 },
  pt: { '1': 45, '2': 50, '65': 85, '4': 90, '5': 105, '6': 120, '7': 135, '8': 140, '9': 105, '10': 80, '11': 55, '12': 50 },
  gr: { '1': 30, '2': 35, '3': 55, '4': 80, '5': 100, '6': 125, '7': 145, '8': 150, '9': 115, '10': 75, '11': 45, '12': 35 },
  gb: { '1': 55, '2': 55, '3': 70, '4': 80, '5': 90, '6': 100, '7': 110, '8': 110, '9': 95, '10': 80, '11': 60, '12': 60 },
  de: { '1': 55, '2': 55, '3': 70, '4': 85, '5': 95, '6': 105, '7': 115, '8': 115, '9': 95, '10': 80, '11': 60, '12': 55 },
  us: { '1': 60, '2': 60, '3': 75, '4': 85, '5': 95, '6': 105, '7': 115, '8': 115, '9': 100, '10': 85, '11': 70, '12': 65 },
  jp: { '1': 55, '2': 55, '3': 90, '4': 110, '5': 100, '6': 85, '7': 95, '8': 105, '9': 100, '10': 95, '11': 70, '12': 60 },
  th: { '1': 120, '2': 115, '3': 100, '4': 80, '5': 60, '6': 50, '7': 55, '8': 55, '9': 70, '10': 90, '11': 110, '12': 125 },
  ma: { '1': 70, '2': 75, '3': 85, '4': 95, '5': 100, '6': 85, '7': 75, '8': 80, '9': 95, '10': 105, '11': 90, '12': 75 },
  eg: { '1': 100, '2': 105, '3': 110, '4': 100, '5': 85, '6': 70, '7': 65, '8': 70, '9': 85, '10': 100, '11': 110, '12': 110 },
  br: { '1': 120, '2': 115, '3': 95, '4': 80, '5': 65, '6': 55, '7': 50, '8': 55, '9': 70, '10': 85, '11': 100, '12': 115 },
  ar: { '1': 115, '2': 110, '3': 90, '4': 75, '5': 60, '6': 50, '7': 55, '8': 60, '9': 75, '10': 90, '11': 105, '12': 115 },
  mx: { '1': 115, '2': 110, '3': 95, '4': 80, '5': 65, '6': 55, '7': 60, '8': 65, '9': 75, '10': 90, '11': 105, '12': 115 },
  co: { '1': 90, '2': 95, '3': 90, '4': 80, '5': 70, '6': 65, '7': 70, '8': 75, '9': 85, '10': 95, '11': 100, '12': 95 },
  in: { '1': 80, '2': 85, '3': 90, '4': 85, '5': 70, '6': 55, '7': 50, '8': 55, '9': 70, '10': 85, '11': 95, '12': 85 },
  cn: { '1': 105, '2': 90, '3': 85, '4': 95, '5': 100, '6': 90, '7': 85, '8': 90, '9': 100, '10': 110, '11': 95, '12': 95 },
  kr: { '1': 70, '2': 75, '3': 90, '4': 100, '5': 100, '6': 90, '7': 85, '8': 95, '9': 100, '10': 100, '11': 85, '12': 70 },
  au: { '1': 115, '2': 110, '3': 90, '4': 75, '5': 60, '6': 50, '7': 55, '8': 60, '9': 75, '10': 90, '11': 105, '12': 115 },
  sg: { '1': 90, '2': 95, '3': 95, '4': 85, '5': 75, '6': 70, '7': 75, '8': 80, '9': 85, '10': 95, '11': 100, '12': 95 },
};

// Precio petróleo Brent histórico (USD/barril) — datos 2024-2026
// Fuente: EIA, actualizable vía API
const OIL_BRENT_HISTORY = [
  { month: '2024-01', price: 78.5 },
  { month: '2024-02', price: 82.1 },
  { month: '2024-03', price: 85.3 },
  { month: '2024-04', price: 87.2 },
  { month: '2024-05', price: 83.4 },
  { month: '2024-06', price: 80.1 },
  { month: '2024-07', price: 78.9 },
  { month: '2024-08', price: 76.5 },
  { month: '2024-09', price: 73.2 },
  { month: '2024-10', price: 71.8 },
  { month: '2024-11', price: 72.4 },
  { month: '2024-12', price: 74.1 },
  { month: '2025-01', price: 76.8 },
  { month: '2025-02', price: 79.3 },
  { month: '2025-03', price: 81.5 },
  { month: '2025-04', price: 83.2 },
  { month: '2025-05', price: 80.6 },
  { month: '2025-06', price: 77.9 },
  { month: '2025-07', price: 75.4 },
  { month: '2025-08', price: 73.1 },
  { month: '2025-09', price: 71.5 },
  { month: '2025-10', price: 70.2 },
  { month: '2025-11', price: 71.8 },
  { month: '2025-12', price: 73.5 },
  { month: '2026-01', price: 78.2 },
  { month: '2026-02', price: 84.6 },
  { month: '2026-03', price: 92.1 },
  { month: '2026-04', price: 98.5 },
  { month: '2026-05', price: 103.4 },
];

const OIL_AVG = OIL_BRENT_HISTORY.reduce((s, o) => s + o.price, 0) / OIL_BRENT_HISTORY.length;

export function getCurrentOilPrice(): { price: number; trend: 'up' | 'down' | 'stable'; vsAvg: number } {
  const latest = OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 1];
  const prev = OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 2];
  const trend: 'up' | 'down' | 'stable' = latest.price > prev.price ? 'up' : latest.price < prev.price ? 'down' : 'stable';
  const vsAvg = Math.round((latest.price - OIL_AVG) * 10) / 10;
  return { price: latest.price, trend, vsAvg };
}

function getOilIndex(): number {
  const latest = OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 1];
  return (latest.price / OIL_AVG) * 100;
}

function getDemandIndex(countryCode: string): number {
  const code = countryCode.toLowerCase();
  const ineData = ineTourismData[code];
  if (!ineData) {
    const pais = paisesData[code];
    if (pais && pais.continente === 'Europa') return 80;
    if (pais) return 50;
    return 60;
  }
  const avgArrivals = Object.values(ineTourismData).reduce((s, d) => s + d.arrivals, 0) / Object.keys(ineTourismData).length;
  return (ineData.arrivals / avgArrivals) * 100;
}

function getSeasonalityIndex(countryCode: string, month: number): number {
  const data = SEASONALITY_MAP[countryCode.toLowerCase()];
  if (!data) {
    const pais = paisesData[countryCode.toLowerCase()];
    if (pais && pais.continente === 'Europa') {
      return SEASONALITY_MAP['es']?.[String(month)] || 100;
    }
    return 100;
  }
  return data[String(month)] || 100;
}

function getIPCIndex(countryCode: string): number {
  const ipcData = IPC_DATA.find(d => d.code === countryCode.toUpperCase());
  if (!ipcData) return 100;
  const ipcNum = parseFloat(ipcData.ipc.replace('%', ''));
  if (ipcNum <= 1) return 85;
  if (ipcNum <= 2.5) return 95;
  if (ipcNum <= 4) return 105;
  if (ipcNum <= 7) return 115;
  if (ipcNum <= 15) return 130;
  if (ipcNum <= 50) return 150;
  return 180;
}

function getRiskIndex(countryCode: string): number {
  const pais = paisesData[countryCode.toLowerCase()];
  if (!pais) return 100;
  switch (pais.nivelRiesgo) {
    case 'sin-riesgo': return 95;
    case 'bajo': return 100;
    case 'medio': return 110;
    case 'alto': return 125;
    case 'muy-alto': return 145;
    default: return 100;
  }
}

export function calculateTCI(countryCode: string): {
  tci: number;
  trend: string;
  recommendation: string;
  demandIdx: number;
  oilIdx: number;
  seasonalityIdx: number;
  ipcIdx: number;
  riskIdx: number;
  oilPrice: number;
  factors: { label: string; value: number; weight: number; contribution: number }[];
} {
  const month = new Date().getMonth() + 1;

  const demandIdx = getDemandIndex(countryCode);
  const oilIdx = getOilIndex();
  const seasonalityIdx = getSeasonalityIndex(countryCode, month);
  const ipcIdx = getIPCIndex(countryCode);
  const riskIdx = getRiskIndex(countryCode);

  const weights = {
    demand: 0.30,
    oil: 0.25,
    seasonality: 0.25,
    ipc: 0.10,
    risk: 0.10,
  };

  const tci = (
    demandIdx * weights.demand +
    oilIdx * weights.oil +
    seasonalityIdx * weights.seasonality +
    ipcIdx * weights.ipc +
    riskIdx * weights.risk
  );

  const tciRounded = Math.round(tci * 10) / 10;

  let trend: string;
  let recommendation: string;

  if (tci < 85) {
    trend = 'bajista';
    recommendation = 'Buen momento para reservar — precios por debajo de la media';
  } else if (tci < 95) {
    trend = 'ligeramente bajista';
    recommendation = 'Precios favorables — considera reservar pronto';
  } else if (tci < 105) {
    trend = 'estable';
    recommendation = 'Precios en línea con la media — sin prisa por reservar';
  } else if (tci < 115) {
    trend = 'alcista';
    recommendation = 'Precios subiendo — reserva con anticipación';
  } else {
    trend = 'fuertemente alcista';
    recommendation = 'Precios elevados — considera alternativas o fechas flexibles';
  }

  const pais = paisesData[countryCode.toLowerCase()];
  const countryName = pais?.nombre || countryCode;

  if (seasonalityIdx > 130) {
    recommendation += `\n\n⚠️ Temporada alta en ${countryName} — mayor afluencia turística`;
  }
  if (riskIdx > 120) {
    recommendation += `\n\n⚠️ Revisa recomendaciones MAEC antes de viajar`;
  }

  const factors = [
    { label: 'Demanda turística', value: demandIdx, weight: weights.demand, contribution: demandIdx * weights.demand },
    { label: 'Petóleo Brent', value: oilIdx, weight: weights.oil, contribution: oilIdx * weights.oil },
    { label: 'Estacionalidad', value: seasonalityIdx, weight: weights.seasonality, contribution: seasonalityIdx * weights.seasonality },
    { label: 'IPC país', value: ipcIdx, weight: weights.ipc, contribution: ipcIdx * weights.ipc },
    { label: 'Riesgo MAEC', value: riskIdx, weight: weights.risk, contribution: riskIdx * weights.risk },
  ];

  return {
    tci: tciRounded,
    trend,
    recommendation,
    demandIdx: Math.round(demandIdx * 10) / 10,
    oilIdx: Math.round(oilIdx * 10) / 10,
    seasonalityIdx: Math.round(seasonalityIdx * 10) / 10,
    ipcIdx: Math.round(ipcIdx * 10) / 10,
    riskIdx: Math.round(riskIdx * 10) / 10,
    oilPrice: OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 1].price,
    factors,
  };
}

export function getTCIForAllCountries(): { code: string; name: string; bandera: string; tci: number; trend: string; region: string }[] {
  return Object.values(paisesData)
    .filter(p => p.visible !== false)
    .map(p => {
      const tci = calculateTCI(p.codigo);
      return {
        code: p.codigo,
        name: p.nombre,
        bandera: p.bandera,
        tci: tci.tci,
        trend: tci.trend,
        region: p.continente,
      };
    })
    .sort((a, b) => a.tci - b.tci);
}

export function getCheapestDestinations(limit: number = 10): any[] {
  return getTCIForAllCountries().slice(0, limit);
}

export function getMostExpensiveDestinations(limit: number = 10): any[] {
  return getTCIForAllCountries().slice(-limit).reverse();
}

export function getOilHistory(): { month: string; price: number }[] {
  return OIL_BRENT_HISTORY;
}

// ─────────────────────────────────────────────
// SPRINT 48: TCI Inteligente con ML
// ─────────────────────────────────────────────

// Estos datos se almacenan en Supabase (tablas airspace_closures + affected_routes).
// Los valores hardcodeados aquí son FALLBACK cuando no hay conexión a la DB.
// Para actualizar conflictos reales, edita las tablas en Supabase → Table Editor.

export interface AirspaceClosure {
  code: string;
  name: string;
  closureDate: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  notes: string;
}

export const AIRSPACE_CLOSURES_FALLBACK: AirspaceClosure[] = [
  { code: 'RU', name: 'Rusia', closureDate: '2022-02-24', reason: 'Conflicto Ucrania-Rusia, sanciones', severity: 'critical', isActive: true, notes: 'Cerrado para aerolíneas occidentales' },
  { code: 'UA', name: 'Ucrania', closureDate: '2022-02-24', reason: 'Invasión rusa', severity: 'critical', isActive: true, notes: 'Completamente cerrado' },
  { code: 'SY', name: 'Siria', closureDate: '2012-03-01', reason: 'Guerra civil', severity: 'critical', isActive: true, notes: 'Zona de exclusión' },
  { code: 'LY', name: 'Libia', closureDate: '2014-07-01', reason: 'Guerra civil', severity: 'high', isActive: true, notes: 'Restricciones severas' },
  { code: 'YE', name: 'Yemen', closureDate: '2015-03-01', reason: 'Guerra civil', severity: 'critical', isActive: true, notes: 'Cerrado' },
  { code: 'AF', name: 'Afganistán', closureDate: '2021-08-15', reason: 'Talibán', severity: 'high', isActive: true, notes: 'Vuelos muy limitados' },
  { code: 'IQ', name: 'Irak', closureDate: '2024-04-01', reason: 'Escalada de tensiones Irán-Israel y milicias', severity: 'high', isActive: true, notes: 'Sobrevuelo muy restringido — corredores limitados' },
  { code: 'SO', name: 'Somalia', closureDate: '2007-01-01', reason: 'Terrorismo', severity: 'medium', isActive: true, notes: 'FAA prohíbe sobrevuelo' },
  { code: 'SD', name: 'Sudán', closureDate: '2023-04-15', reason: 'Conflicto SAF-RSF', severity: 'critical', isActive: true, notes: 'Cerrado desde abril 2023' },
  { code: 'IR', name: 'Irán', closureDate: '2025-06-01', reason: 'Conflicto Israel-Irán, cierre de espacio aéreo', severity: 'critical', isActive: true, notes: 'Cierre parcial — la mayoría de aerolíneas evitan' },
  { code: 'IL', name: 'Israel', closureDate: '2023-10-07', reason: 'Conflicto Gaza-Israel, ataques con misiles', severity: 'critical', isActive: true, notes: 'Apertura intermitente — cierres frecuentes' },
  { code: 'LB', name: 'Líbano', closureDate: '2024-09-01', reason: 'Escalada Hezbollah-Israel', severity: 'critical', isActive: true, notes: 'Aeropuerto Beirut operatividad muy reducida' },
  { code: 'PS', name: 'Palestina / Gaza', closureDate: '2023-10-07', reason: 'Conflicto Israel-Gaza', severity: 'critical', isActive: true, notes: 'Cerrado totalmente' },
];

export interface AffectedRoute {
  destination: string;
  countryCode: string;
  closedAirspace: string;
  detourKm: number;
  fuelSurchargePct: number;
  timeExtraHours: number;
  alternativeRoute: string;
  isActive: boolean;
}

export const AFFECTED_ROUTES_FALLBACK: AffectedRoute[] = [
  // Rutas afectadas por cierre de espacio aéreo ruso
  { destination: 'Tokio', countryCode: 'JP', closedAirspace: 'RU', detourKm: 4200, fuelSurchargePct: 18.5, timeExtraHours: 3.5, alternativeRoute: 'MAD→ANC→NRT', isActive: true },
  { destination: 'Seúl', countryCode: 'KR', closedAirspace: 'RU', detourKm: 3800, fuelSurchargePct: 16.0, timeExtraHours: 3.0, alternativeRoute: 'MAD→DEL→ICN', isActive: true },
  { destination: 'Pekín', countryCode: 'CN', closedAirspace: 'RU', detourKm: 3500, fuelSurchargePct: 15.0, timeExtraHours: 2.5, alternativeRoute: 'MAD→DOH→PEK', isActive: true },
  { destination: 'Shanghái', countryCode: 'CN', closedAirspace: 'RU', detourKm: 3600, fuelSurchargePct: 15.5, timeExtraHours: 2.5, alternativeRoute: 'MAD→IST→PVG', isActive: true },
  { destination: 'Delhi', countryCode: 'IN', closedAirspace: 'RU', detourKm: 800, fuelSurchargePct: 3.5, timeExtraHours: 0.5, alternativeRoute: 'Desvío sur de Rusia', isActive: true },
  { destination: 'Mumbai', countryCode: 'IN', closedAirspace: 'RU', detourKm: 600, fuelSurchargePct: 2.5, timeExtraHours: 0.5, alternativeRoute: 'Desvío sur de Rusia', isActive: true },
  // Rutas afectadas por conflicto Irán-Israel 2025-2026
  { destination: 'Tel Aviv', countryCode: 'IL', closedAirspace: 'IL', detourKm: 2200, fuelSurchargePct: 35.0, timeExtraHours: 4.0, alternativeRoute: 'Vuelos a Chipre + transporte terrestre', isActive: true },
  { destination: 'Teherán', countryCode: 'IR', closedAirspace: 'IR', detourKm: 1800, fuelSurchargePct: 28.0, timeExtraHours: 3.0, alternativeRoute: 'Sin vuelos directos desde Europa', isActive: true },
  { destination: 'Beirut', countryCode: 'LB', closedAirspace: 'LB', detourKm: 1500, fuelSurchargePct: 30.0, timeExtraHours: 3.5, alternativeRoute: 'Vía Amán (Jordania) + transporte terrestre', isActive: true },
  { destination: 'Bagdad', countryCode: 'IQ', closedAirspace: 'IQ', detourKm: 1200, fuelSurchargePct: 22.0, timeExtraHours: 2.0, alternativeRoute: 'Corredor norte limitado', isActive: true },
  { destination: 'Doha', countryCode: 'QA', closedAirspace: 'IR', detourKm: 600, fuelSurchargePct: 5.0, timeExtraHours: 0.5, alternativeRoute: 'Desvío sur de Irán por Golfo Pérsico', isActive: true },
  // Rutas afectadas por otros conflictos
  { destination: 'Dubái', countryCode: 'AE', closedAirspace: 'IR', detourKm: 400, fuelSurchargePct: 3.0, timeExtraHours: 0.3, alternativeRoute: 'Desvío sur de Irán', isActive: true },
  { destination: 'El Cairo', countryCode: 'EG', closedAirspace: 'LY', detourKm: 500, fuelSurchargePct: 2.5, timeExtraHours: 0.5, alternativeRoute: 'Ruta este de Libia', isActive: true },
  { destination: 'Adís Abeba', countryCode: 'ET', closedAirspace: 'SD', detourKm: 800, fuelSurchargePct: 4.0, timeExtraHours: 0.5, alternativeRoute: 'Ruta este de Sudán', isActive: true },
  { destination: 'Sana', countryCode: 'YE', closedAirspace: 'YE', detourKm: 1000, fuelSurchargePct: 25.0, timeExtraHours: 2.0, alternativeRoute: 'Sin vuelos — Djibouti + ferry', isActive: true },
  { destination: 'Kabul', countryCode: 'AF', closedAirspace: 'AF', detourKm: 800, fuelSurchargePct: 20.0, timeExtraHours: 1.5, alternativeRoute: 'Vía Islamabad (limitado)', isActive: true },
];

// Regresión lineal simple
function linearRegression(data: number[]): { slope: number; intercept: number; r2: number; prediction: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0, prediction: data[0] || 0 };

  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let ssXY = 0;
  let ssXX = 0;
  let ssYY = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = data[i] - yMean;
    ssXY += xDiff * yDiff;
    ssXX += xDiff * xDiff;
    ssYY += yDiff * yDiff;
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;
  const r2 = ssYY !== 0 ? (ssXY * ssXY) / (ssXX * ssYY) : 0;
  const prediction = slope * n + intercept;

  return { slope, intercept, r2, prediction };
}

// Media móvil
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// Obtener impacto de conflicto para un país
export function getConflictImpact(countryCode: string): {
  isAffected: boolean;
  surchargePct: number;
  timeExtraHours: number;
  closedAirspace: string;
  reason: string;
  alternativeRoute: string;
} {
  const routes = AFFECTED_ROUTES_FALLBACK.filter(r => r.countryCode === countryCode.toLowerCase() && r.isActive);
  if (routes.length === 0) {
  const pais = paisesData[countryCode.toLowerCase()];
    if (pais) {
      const closure = AIRSPACE_CLOSURES_FALLBACK.find(c => c.code === countryCode.toUpperCase() && c.isActive);
      if (closure) {
        return {
          isAffected: true,
          surchargePct: closure.severity === 'critical' ? 25 : closure.severity === 'high' ? 15 : 8,
          timeExtraHours: closure.severity === 'critical' ? 5 : closure.severity === 'high' ? 3 : 1,
          closedAirspace: closure.name,
          reason: closure.reason,
          alternativeRoute: 'Sin vuelos directos — consultar aerolíneas',
        };
      }
    }
    return { isAffected: false, surchargePct: 0, timeExtraHours: 0, closedAirspace: '', reason: '', alternativeRoute: '' };
  }

  const worstRoute = routes.reduce((max, r) => r.fuelSurchargePct > max.fuelSurchargePct ? r : max, routes[0]);
  return {
    isAffected: true,
    surchargePct: worstRoute.fuelSurchargePct,
    timeExtraHours: worstRoute.timeExtraHours,
    closedAirspace: AIRSPACE_CLOSURES_FALLBACK.find(c => c.code === worstRoute.closedAirspace)?.name || worstRoute.closedAirspace,
    reason: AIRSPACE_CLOSURES_FALLBACK.find(c => c.code === worstRoute.closedAirspace)?.reason || 'Espacio aéreo cerrado',
    alternativeRoute: worstRoute.alternativeRoute,
  };
}

// Analizar tendencia TCI (simulado con datos históricos + ML)
export function analyzeTCITrend(countryCode: string, history?: number[]): {
  currentTCI: number;
  weeklyData: { week: string; value: number }[];
  trend4Weeks: { direction: 'up' | 'down' | 'stable'; change: number };
  trend12Weeks: { direction: 'up' | 'down' | 'stable'; change: number };
  prediction: { nextWeek: number; nextMonth: number; confidence: number };
  bestWeekToBook: { week: number; month: string; savingsPct: number };
  volatility: 'low' | 'medium' | 'high';
} {
  const currentTCI = calculateTCI(countryCode).tci;
  const month = new Date().getMonth();

  // Generar datos históricos simulados basados en estacionalidad + tendencia
  const pais = paisesData[countryCode.toLowerCase()];
  const seasonalData = pais ? SEASONALITY_MAP[pais.codigo.toLowerCase()] : null;

  const weeklyData: { week: string; value: number }[] = [];
  const now = new Date();

  // Simular 12 semanas de histórico basado en patrones estacionales
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const m = date.getMonth() + 1;
    const seasonalIdx = seasonalData ? (seasonalData[String(m)] || 100) : 100;

    // Tendencia de petróleo (bajando en los últimos meses)
    const oilTrend = 100 - (12 - i) * 0.8;

    // TCI base con variación estacional y de petróleo
    const baseTCI = (currentTCI * 0.4) + (seasonalIdx * 0.3) + (oilTrend * 0.15) + (100 * 0.15);
    // Añadir variación semanal realista (±2%)
    const noise = 1 + (Math.sin(i * 0.7) * 0.015);
    const value = Math.round(baseTCI * noise * 10) / 10;

    const weekLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    weeklyData.push({ week: weekLabel, value });
  }

  // Análisis de tendencias
  const last4 = weeklyData.slice(-4).map(d => d.value);
  const last12 = weeklyData.slice(0, -1).map(d => d.value);

  const reg4 = linearRegression(last4);
  const reg12 = linearRegression(last12);

  const trend4 = Math.round(reg4.slope * 10) / 10;
  const trend12 = Math.round(reg12.slope * 10) / 10;

  // Predicción ML (regresión lineal + media móvil)
  const ma4 = movingAverage(last12, 4);
  const lastMA = ma4[ma4.length - 1];

  const predictionNextWeek = Math.round((currentTCI * 0.6 + reg4.prediction * 0.2 + lastMA * 0.2) * 10) / 10;
  const predictionNextMonth = Math.round((currentTCI * 0.4 + reg12.prediction * 0.3 + lastMA * 0.3) * 10) / 10;

  // Confianza basada en R² y estabilidad
  const confidence = Math.min(95, Math.max(45, Math.round((reg12.r2 * 60) + (reg4.r2 * 30) + 15)));

  // Mejor semana para reservar (basada en patrones estacionales)
  const mesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthValues = monthlyTCIPattern(countryCode);
  const minMonth = monthValues.reduce((min, v, i) => v < monthValues[min] ? i : min, 0);
  const avgValue = monthValues.reduce((a, b) => a + b, 0) / 12;
  const savingsPct = Math.round((1 - monthValues[minMonth] / avgValue) * 1000) / 10;

  const bestWeekToBook = {
    week: minMonth * 4 + 2, // approx
    month: mesNombres[minMonth],
    savingsPct,
  };

  // Volatilidad
  const stdDev = Math.sqrt(last12.reduce((sum, v) => sum + Math.pow(v - (avgValue || 100), 2), 0) / last12.length);
  const volatility = stdDev < 3 ? 'low' : stdDev < 7 ? 'medium' : 'high';

  return {
    currentTCI,
    weeklyData,
    trend4Weeks: {
      direction: trend4 > 1 ? 'up' : trend4 < -1 ? 'down' : 'stable',
      change: trend4,
    },
    trend12Weeks: {
      direction: trend12 > 1.5 ? 'up' : trend12 < -1.5 ? 'down' : 'stable',
      change: trend12,
    },
    prediction: {
      nextWeek: predictionNextWeek,
      nextMonth: predictionNextMonth,
      confidence,
    },
    bestWeekToBook,
    volatility,
  };
}

// Patrón mensual TCI (para encontrar mejor mes)
export function monthlyTCIPattern(countryCode: string): number[] {
  const weights = { demand: 0.30, oil: 0.25, seasonality: 0.25, ipc: 0.10, risk: 0.10 };
  const oilIdx = getOilIndex();
  const ipcIdx = getIPCIndex(countryCode);
  const riskIdx = getRiskIndex(countryCode);

  const months: number[] = [];
  for (let m = 1; m <= 12; m++) {
    const seasonalityIdx = getSeasonalityIndex(countryCode, m);
    const demandIdx = getDemandIndex(countryCode);
    const tci = (
      demandIdx * weights.demand +
      oilIdx * weights.oil +
      seasonalityIdx * weights.seasonality +
      ipcIdx * weights.ipc +
      riskIdx * weights.risk
    );
    months.push(tci);
  }
  return months;
}

// ─────────────────────────────────────────────
// IMPACTO GLOBAL: Petróleo, Conflictos, Redistribución
// ─────────────────────────────────────────────

export function getOilImpactAnalysis(): {
  currentPrice: number;
  avgPrice: number;
  changePct: number;
  trend: 'up' | 'down' | 'stable';
  months: { month: string; price: number; tciImpact: number }[];
} {
  const months = OIL_BRENT_HISTORY.map(o => {
    const tciImpact = Math.round(((o.price / OIL_AVG) * 100 - 100) * 10) / 10;
    const [, m] = o.month.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return { month: meses[parseInt(m) - 1] + '/' + o.month.split('-')[0].slice(2), price: o.price, tciImpact };
  });

  const latest = OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 1];
  const prev = OIL_BRENT_HISTORY[OIL_BRENT_HISTORY.length - 2];
  const changePct = Math.round(((latest.price - prev.price) / prev.price) * 1000) / 10;
  const trend: 'up' | 'down' | 'stable' = changePct > 0.5 ? 'up' : changePct < -0.5 ? 'down' : 'stable';

  return { currentPrice: latest.price, avgPrice: Math.round(OIL_AVG * 10) / 10, changePct, trend, months };
}

export function getGlobalConflictImpact(): {
  totalClosures: number;
  totalRoutesAffected: number;
  worstAffected: { country: string; flag: string; surcharge: number; reason: string }[];
  avgSurcharge: number;
} {
  const activeClosures = AIRSPACE_CLOSURES_FALLBACK.filter(c => c.isActive);
  const activeRoutes = AFFECTED_ROUTES_FALLBACK.filter(r => r.isActive);

  const worst = activeRoutes
    .sort((a, b) => b.fuelSurchargePct - a.fuelSurchargePct)
    .slice(0, 6)
    .map(r => {
      const pais = paisesData[r.countryCode.toLowerCase()];
      const closure = AIRSPACE_CLOSURES_FALLBACK.find(c => c.code === r.closedAirspace);
      return {
        country: r.destination,
        flag: pais?.bandera || '🌍',
        surcharge: r.fuelSurchargePct,
        reason: closure?.reason || 'Espacio aéreo cerrado',
      };
    });

  const avgSurcharge = Math.round((activeRoutes.reduce((s, r) => s + r.fuelSurchargePct, 0) / activeRoutes.length) * 10) / 10;

  return { totalClosures: activeClosures.length, totalRoutesAffected: activeRoutes.length, worstAffected: worst, avgSurcharge };
}

export function getDemandShiftAnalysis(): {
  conflictBeneficiaries: { country: string; flag: string; name: string; extraDemandPct: number; reason: string }[];
  oilSensitive: { country: string; flag: string; name: string; oilImpact: number }[];
  safeHavens: { country: string; flag: string; name: string; riskScore: number; tci: number }[];
} {
  const allPaises = Object.values(paisesData).filter(p => p.visible !== false && p.codigo !== 'cu');

  // Conflict beneficiaries: safe countries in same region as closed airspace
  const conflictBeneficiaries = allPaises
    .filter(p => p.nivelRiesgo === 'sin-riesgo' || p.nivelRiesgo === 'bajo')
    .map(p => {
      const affected = AFFECTED_ROUTES_FALLBACK.find(r => r.destination.toLowerCase().includes(p.nombre.toLowerCase()));
      const tci = calculateTCI(p.codigo);
      let extraDemand = 0;
      let reason = '';

      if (p.codigo === 'tr') { extraDemand = 15; reason = 'Desvío masivo de rutas a Oriente Medio por conflictos Siria, Irán e Israel'; }
      else if (p.codigo === 'jo') { extraDemand = 12; reason = 'Hub alternativo para viajeros a Líbano, Iraq y Palestina'; }
      else if (p.codigo === 'eg') { extraDemand = 10; reason = 'Refugio turístico de Oriente Medio, Red替代 a Líbano'; }
      else if (p.codigo === 'ae') { extraDemand = 8; reason = 'Hub aéreo alternativo al espacio aéreo iraní cerrado'; }
      else if (p.codigo === 'om') { extraDemand = 6; reason = 'Ruta alternativa al Golfo Pérsico desviada de Irán'; }
      else if (p.codigo === 'es' || p.codigo === 'pt' || p.codigo === 'gr' || p.codigo === 'hr') { extraDemand = 8; reason = 'Turismo redirigido desde destinos de riesgo medio'; }
      else if (p.codigo === 'mx' || p.codigo === 'cr') { extraDemand = 6; reason = 'Alternativa segura a Caribe inestable'; }
      else if (p.codigo === 'jp' || p.codigo === 'kr' || p.codigo === 'sg') { extraDemand = 5; reason = 'Destino asiático seguro sin conflicto aéreo'; }

      return { country: p.codigo, flag: p.bandera, name: p.nombre, extraDemandPct: extraDemand, reason };
    })
    .filter(b => b.extraDemandPct > 0)
    .sort((a, b) => b.extraDemandPct - a.extraDemandPct)
    .slice(0, 8);

  // Oil-sensitive: long-haul destinations most affected by oil prices
  const oilSensitive = allPaises
    .filter(p => p.continente === 'Asia' || p.continente === 'Oceanía' || p.continente === 'América del Sur')
    .map(p => {
      const tci = calculateTCI(p.codigo);
      const oilImpact = tci.oilIdx - 100;
      return { country: p.codigo, flag: p.bandera, name: p.nombre, oilImpact: Math.round(oilImpact * 10) / 10 };
    })
    .sort((a, b) => b.oilImpact - a.oilImpact)
    .slice(0, 6);

  // Safe havens: low risk + affordable TCI
  const safeHavens = allPaises
    .filter(p => (p.nivelRiesgo === 'sin-riesgo' || p.nivelRiesgo === 'bajo'))
    .map(p => {
      const tci = calculateTCI(p.codigo);
      const riskScore = p.nivelRiesgo === 'sin-riesgo' ? 95 : 85;
      return { country: p.codigo, flag: p.bandera, name: p.nombre, riskScore, tci: tci.tci };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8);

  return { conflictBeneficiaries, oilSensitive, safeHavens };
}


