import { getTodosLosPaises } from '@/data/paises';

export interface GlobalStats {
  totalPaises: number;
  totalContinentes: number;
  sinRiesgo: number;
  riesgoBajo: number;
  riesgoMedio: number;
  riesgoAlto: number;
  riesgoMuyAlto: number;
  seguroOBajo: number;
  altoOMuyAlto: number;
}

export function getGlobalStats(): GlobalStats {
  const paises = getTodosLosPaises();
  
  const sinRiesgo = paises.filter(p => p.nivelRiesgo === 'sin-riesgo').length;
  const riesgoBajo = paises.filter(p => p.nivelRiesgo === 'bajo').length;
  const riesgoMedio = paises.filter(p => p.nivelRiesgo === 'medio').length;
  const riesgoAlto = paises.filter(p => p.nivelRiesgo === 'alto').length;
  const riesgoMuyAlto = paises.filter(p => p.nivelRiesgo === 'muy-alto').length;
  
  return {
    totalPaises: paises.length,
    totalContinentes: [...new Set(paises.map(p => p.continente))].length,
    sinRiesgo,
    riesgoBajo,
    riesgoMedio,
    riesgoAlto,
    riesgoMuyAlto,
    seguroOBajo: sinRiesgo + riesgoBajo,
    altoOMuyAlto: riesgoAlto + riesgoMuyAlto,
  };
}