import { supabaseAdmin } from '@/lib/supabase-admin';
import { paisesData, type NivelRiesgo } from '@/data/paises';

export interface ManualPais {
  code: string;
  nombre: string;
  nivelRiesgo: NivelRiesgo;
  capital: string;
  continente: string;
}

export interface ManualEvent {
  name: string;
  country: string;
  month: string;
  impact: string;
}

export interface ManualSeguroCoverage {
  name: string;
  desc: string;
}

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthName(m: number, lang: string): string {
  return lang === 'en' ? MONTHS_EN[m - 1] : MONTHS_ES[m - 1];
}

export function getManualPaises(): ManualPais[] {
  return Object.entries(paisesData).map(([code, p]) => ({
    code,
    nombre: p.nombre,
    nivelRiesgo: p.nivelRiesgo,
    capital: p.capital || '-',
    continente: p.continente,
  }));
}

export function getPaisByCode(code: string): ManualPais | null {
  const p = paisesData[code.toLowerCase() as keyof typeof paisesData];
  if (!p) return null;
  return {
    code: code.toLowerCase(),
    nombre: p.nombre,
    nivelRiesgo: p.nivelRiesgo,
    capital: p.capital || '-',
    continente: p.continente,
  };
}

export async function getManualEvents(lang: string): Promise<ManualEvent[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('title, country, start_date, impact_traveler, category')
      .gte('start_date', today)
      .lte('start_date', future)
      .in('impact_traveler', ['high', 'critical'])
      .order('start_date', { ascending: true })
      .limit(30);

    if (error) throw error;

    if (data && data.length >= 5) {
      return data.map(ev => {
        const month = ev.start_date ? new Date(ev.start_date).getMonth() + 1 : 1;
        return {
          name: ev.title,
          country: ev.country,
          month: getMonthName(month, lang),
          impact: ev.impact_traveler === 'critical' ? (lang === 'en' ? 'Extreme' : 'Extremo') : (lang === 'en' ? 'High' : 'Alto'),
        };
      });
    }
  } catch {
    // fallback a hardcoded
  }

  return getFallbackEvents(lang);
}

function getFallbackEvents(lang: string): ManualEvent[] {
  return [
    { name: lang === 'en' ? 'Davos (World Economic Forum)' : 'Davos (Foro Económico)', country: lang === 'en' ? 'Switzerland' : 'Suiza', month: getMonthName(1, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Chinese New Year' : 'Año Nuevo Chino', country: lang === 'en' ? 'China' : 'China', month: lang === 'en' ? 'Jan/Feb' : 'Ene/Feb', impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Rio Carnival' : 'Carnaval de Río', country: lang === 'en' ? 'Brazil' : 'Brasil', month: getMonthName(2, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: 'MWC Barcelona', country: lang === 'en' ? 'Spain' : 'España', month: getMonthName(2, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Fallas Valencia' : 'Fallas de Valencia', country: lang === 'en' ? 'Spain' : 'España', month: getMonthName(3, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Ramadan' : 'Ramadán', country: lang === 'en' ? 'Worldwide' : 'Mundial', month: getMonthName(3, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Easter Week' : 'Semana Santa', country: lang === 'en' ? 'Spain/Mexico' : 'España/México', month: lang === 'en' ? 'Mar/Apr' : 'Mar/Abr', impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Songkran' : 'Songkran', country: lang === 'en' ? 'Thailand' : 'Tailandia', month: getMonthName(4, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'F1 Monaco Grand Prix' : 'F1 Gran Premio Mónaco', country: lang === 'en' ? 'Monaco' : 'Mónaco', month: getMonthName(5, lang), impact: lang === 'en' ? 'Extreme' : 'Extremo' },
    { name: lang === 'en' ? 'FIFA World Cup 2026' : 'Mundial Fútbol 2026', country: 'EE.UU./MX/CA', month: 'Jun-Jul', impact: lang === 'en' ? 'Extreme' : 'Extremo' },
    { name: 'Tomorrowland', country: lang === 'en' ? 'Belgium' : 'Bélgica', month: getMonthName(7, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'San Fermin' : 'San Fermín', country: lang === 'en' ? 'Spain' : 'España', month: getMonthName(7, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: 'Oktoberfest', country: lang === 'en' ? 'Germany' : 'Alemania', month: getMonthName(9, lang), impact: lang === 'en' ? 'Extreme' : 'Extremo' },
    { name: 'Web Summit', country: lang === 'en' ? 'Portugal' : 'Portugal', month: getMonthName(10, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: 'Diwali', country: lang === 'en' ? 'India' : 'India', month: getMonthName(11, lang), impact: lang === 'en' ? 'High' : 'Alto' },
    { name: lang === 'en' ? 'Christmas Markets' : 'Mercados Navideños', country: lang === 'en' ? 'Germany' : 'Alemania', month: getMonthName(12, lang), impact: lang === 'en' ? 'High' : 'Alto' },
  ];
}

export async function getManualSeguros(): Promise<{ name: string; desc: string }[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('seguros_catalog')
      .select('coberturas')
      .limit(1);

    if (!error && data && data.length > 0) {
      return [
        { name: 'Médica / Medical', desc: 'Hospitalización, consultas, medicamentos' },
        { name: 'Evacuación / Evacuation', desc: 'Repatriación o traslado a centro médico' },
        { name: 'Cancelación / Cancellation', desc: 'Reembolso por cancelación del viaje' },
        { name: 'Equipaje / Baggage', desc: 'Pérdida, robo o daño del equipaje' },
        { name: 'RC / Liability', desc: 'Responsabilidad civil a terceros' },
        { name: 'Deportes / Sports', desc: 'Deportes básicos o de aventura' },
        { name: 'Covid', desc: 'Gastos médicos COVID-19' },
      ];
    }
  } catch {
    // fallback
  }

  return [
    { name: 'Médica / Medical', desc: 'Hospitalización, consultas, medicamentos' },
    { name: 'Evacuación / Evacuation', desc: 'Repatriación o traslado a centro médico' },
    { name: 'Cancelación / Cancellation', desc: 'Reembolso por cancelación del viaje' },
    { name: 'Equipaje / Baggage', desc: 'Pérdida, robo o daño del equipaje' },
    { name: 'RC / Liability', desc: 'Responsabilidad civil a terceros' },
    { name: 'Deportes / Sports', desc: 'Deportes básicos o de aventura' },
    { name: 'Covid', desc: 'Gastos médicos COVID-19' },
  ];
}
