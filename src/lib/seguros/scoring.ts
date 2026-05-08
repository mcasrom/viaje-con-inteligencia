import segurosData from '@/data/seguros.json';
import { paisesData, type NivelRiesgo } from '@/data/paises';

export interface SeguroInput {
  destino: string;
  fechaIda?: string;
  fechaVuelta?: string;
  edades: number[];
  actividades: string[];
  costeViaje: number;
  tipoViaje: 'individual' | 'familiar' | 'grupo';
  residencia: 'ES' | 'EU';
}

export interface SeguroScore {
  id: string;
  nombre: string;
  aseguradora: string;
  web: string;
  precio_min: number;
  precio_max: number;
  score: number;
  score_max: number;
  coberturas: {
    medica: number;
    evacuacion: number;
    cancelacion: number;
    repatriacion: boolean;
    covid: boolean;
    deportes_basicos: boolean;
    deportes_aventura: boolean;
    electronica: boolean;
    equipaje: number;
    responsabilidad_civil: number;
  };
  exclusiones: string[];
  alerta_osint: string | null;
  recomendado_para: string[];
  afiliado: string;
}

const riskLevelNum: Record<NivelRiesgo, number> = {
  'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5,
};

const ACTIVIDAD_PESO: Record<string, number> = {
  senderismo: 0.05, trekking: 0.08, buceo: 0.15, snorkel: 0.03,
  esquí: 0.12, snowboard: 0.12, surf: 0.08, kitesurf: 0.15,
  moto: 0.10, ciclismo: 0.05, puenting: 0.20, paracaidismo: 0.20,
  rafting: 0.15, escalada: 0.15, safari: 0.08, voluntariado: 0.03,
};

export function resolvePais(input: string): { codigo: string; nombre: string } | null {
  const lower = input.toLowerCase().trim().replace(/^es$/, 'es');
  const direct = paisesData[lower as keyof typeof paisesData];
  if (direct) return { codigo: direct.codigo.toUpperCase(), nombre: direct.nombre };
  for (const p of Object.values(paisesData)) {
    if (p.nombre.toLowerCase() === lower) return { codigo: p.codigo.toUpperCase(), nombre: p.nombre };
  }
  for (const p of Object.values(paisesData)) {
    if (p.nombre.toLowerCase().includes(lower)) return { codigo: p.codigo.toUpperCase(), nombre: p.nombre };
  }
  return null;
}

export function listCountries(): { codigo: string; nombre: string }[] {
  return Object.values(paisesData).map(p => ({ codigo: p.codigo.toUpperCase(), nombre: p.nombre }));
}

function getDangerLevel(codigo: string): { nivel: number; irv: number; nombre: string } {
  const pais = paisesData[codigo.toLowerCase() as keyof typeof paisesData];
  if (!pais) return { nivel: 2, irv: 80, nombre: codigo.toUpperCase() };
  const nivel = riskLevelNum[pais.nivelRiesgo] || 2;
  const irv = Math.max(40, Math.min(100, 100 - nivel * 10));
  return { nivel, irv, nombre: pais.nombre };
}

function calcularPesos(input: SeguroInput, dangerLevel: number, duracionDias: number) {
  const irv = dangerLevel;
  const duracionBonus = Math.min(0.15, duracionDias / 200);
  const pesoMedica = irv > 70 ? 0.35 + duracionBonus : irv > 60 ? 0.25 + duracionBonus : 0.20 + duracionBonus;
  const pesoEvacuacion = irv > 70 ? 0.30 : irv > 60 ? 0.20 : 0.10;
  const pesoCancelacion = input.costeViaje > 3000 ? 0.25 : input.costeViaje > 1500 ? 0.20 : 0.15;
  const pesoDeportes = input.actividades.length > 0 ? 0.20 : 0.05;
  const pesoGeneral = 1 - pesoMedica - pesoEvacuacion - pesoCancelacion - pesoDeportes;

  return { pesoMedica, pesoEvacuacion, pesoCancelacion, pesoDeportes, pesoGeneral };
}

export function scoreSeguros(input: SeguroInput): {
  destino_nombre: string;
  resultados: SeguroScore[];
  alerta_osint: string | null;
  irv: number;
  cobertura_recomendada: { medica: number; evacuacion: number };
} {
  const { nivel, irv, nombre } = getDangerLevel(input.destino);
  const duracionEstimada = input.fechaIda && input.fechaVuelta
    ? Math.ceil((new Date(input.fechaVuelta).getTime() - new Date(input.fechaIda).getTime()) / 86400000)
    : 14;
  const pesos = calcularPesos(input, irv, duracionEstimada);

  const tieneActividadesAventura = input.actividades.some(
    a => (ACTIVIDAD_PESO[a.toLowerCase()] || 0) > 0.10
  );
  const numViajeros = input.edades.length;

  // Duración impacta cobertura recomendada y precio
  const duracionFactor = Math.max(0.5, Math.min(3, duracionEstimada / 14));
  const duracionPremium = duracionEstimada > 30 ? 0.2 : duracionEstimada > 14 ? 0.1 : 0;

  const coberturaRecomendada = {
    medica: Math.round((irv > 65 ? 1000000 : irv > 50 ? 500000 : 300000) * duracionFactor),
    evacuacion: Math.round((irv > 65 ? 2000000 : irv > 50 ? 1000000 : 500000) * duracionFactor),
  };

  let alertaOsint: string | null = null;
  if (input.actividades.length > 0 && !tieneActividadesAventura) {
    const deportesAventura = Object.entries(ACTIVIDAD_PESO)
      .filter(([, p]) => p > 0.10)
      .map(([k]) => k);
    const noCubiertas = input.actividades.filter(
      a => deportesAventura.includes(a.toLowerCase())
    );
    if (noCubiertas.length > 0) {
      alertaOsint = `Actividades como ${noCubiertas.join(', ')} requieren cobertura específica. Verifica exclusiones.`;
    }
  }
  if (!alertaOsint && irv > 65) {
    alertaOsint = `IRV ${irv}/100 — se recomienda cobertura médica ≥${(coberturaRecomendada.medica / 1000000).toFixed(0)}M€ y evacuación ≥${(coberturaRecomendada.evacuacion / 1000000).toFixed(0)}M€.`;
  }
  if (duracionEstimada > 30) {
    alertaOsint = (alertaOsint ? alertaOsint + ' ' : '') + `Viaje largo (${duracionEstimada}d). Verifica cobertura para estancias prolongadas.`;
  }

  const resultados: SeguroScore[] = (segurosData.productos as any[]).map(p => {
    const c = p.coberturas;
    let score = 0;
    const maxScore = 100;

    const puntMedica = Math.min(1, c.medica / coberturaRecomendada.medica);
    score += puntMedica * pesos.pesoMedica * 100;

    const puntEvacuacion = Math.min(1, c.evacuacion / coberturaRecomendada.evacuacion);
    score += puntEvacuacion * pesos.pesoEvacuacion * 100;

    const puntCancelacion = c.cancelacion >= 100 ? 1 : c.cancelacion / 100;
    score += puntCancelacion * pesos.pesoCancelacion * 100;

    if (tieneActividadesAventura) {
      score += (c.deportes_aventura ? 1 : 0) * pesos.pesoDeportes * 100;
    } else if (input.actividades.length > 0) {
      score += (c.deportes_basicos ? 0.8 : 0.3) * pesos.pesoDeportes * 100;
    }

    const extras = [
      c.repatriacion ? 0.15 : 0,
      c.covid ? 0.10 : 0,
      duracionEstimada > 30 && c.electronica ? 0.10 : 0,
      input.costeViaje > 3000 ? Math.min(0.10, c.equipaje / 2000 * 0.10) : 0,
    ];
    const extraTotal = extras.reduce((a, b) => a + b, 0);

    score += extraTotal * pesos.pesoGeneral * 100;
    score = Math.round(Math.min(maxScore, Math.max(0, score)));

    const recomendadoPara = p.recomendado_para || [];

    return {
      id: p.id,
      nombre: p.nombre,
      aseguradora: p.aseguradora,
      web: p.web,
      precio_min: p.precio_min,
      precio_max: p.precio_max,
      score,
      score_max: maxScore,
      coberturas: {
        medica: c.medica,
        evacuacion: c.evacuacion,
        cancelacion: c.cancelacion,
        repatriacion: c.repatriacion,
        covid: c.covid,
        deportes_basicos: c.deportes_basicos,
        deportes_aventura: c.deportes_aventura,
        electronica: c.electronica,
        equipaje: c.equipaje,
        responsabilidad_civil: c.responsabilidad_civil || 0,
      },
      exclusiones: p.exclusiones || [],
      alerta_osint: null,
      recomendado_para: recomendadoPara,
      afiliado: p.afiliado,
    };
  });

  resultados.sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...resultados.map(r => r.score));
  if (alertaOsint) {
    resultados[0].alerta_osint = alertaOsint;
  }

  return {
    destino_nombre: nombre,
    resultados,
    alerta_osint: alertaOsint,
    irv,
    cobertura_recomendada: coberturaRecomendada,
  };
}
