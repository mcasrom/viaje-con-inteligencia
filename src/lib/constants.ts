import { getTodosLosPaises } from '@/data/paises';

export const TOTAL_PORTESES_COUNT = getTodosLosPaises().filter(p => p.codigo !== 'cu').length;
export const SITE_URL = 'https://www.viajeinteligencia.com';
