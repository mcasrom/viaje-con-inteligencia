import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EVENTS_FALLBACK, type FallbackEvent } from '@/lib/events-fallback';

interface CityPattern {
  name: string;
  code: string;
  country: string;
  countryCode: string;
  seasonMultiplier: number;
  basePriceIndex: number;
}

const CITY_PATTERNS: Record<string, CityPattern> = {
  barcelona: { name: 'Barcelona', code: 'barcelona', country: 'España', countryCode: 'ES', seasonMultiplier: 1.3, basePriceIndex: 1.5 },
  roma: { name: 'Roma', code: 'roma', country: 'Italia', countryCode: 'IT', seasonMultiplier: 1.4, basePriceIndex: 1.4 },
  paris: { name: 'París', code: 'paris', country: 'Francia', countryCode: 'FR', seasonMultiplier: 1.35, basePriceIndex: 1.6 },
  madrid: { name: 'Madrid', code: 'madrid', country: 'España', countryCode: 'ES', seasonMultiplier: 1.2, basePriceIndex: 1.3 },
  lisboa: { name: 'Lisboa', code: 'lisboa', country: 'Portugal', countryCode: 'PT', seasonMultiplier: 1.25, basePriceIndex: 1.2 },
  vencia: { name: 'Venecia', code: 'vencia', country: 'Italia', countryCode: 'IT', seasonMultiplier: 1.5, basePriceIndex: 1.7 },
  amsterdam: { name: 'Ámsterdam', code: 'amsterdam', country: 'Países Bajos', countryCode: 'NL', seasonMultiplier: 1.2, basePriceIndex: 1.4 },
  munich: { name: 'Múnich', code: 'munich', country: 'Alemania', countryCode: 'DE', seasonMultiplier: 1.15, basePriceIndex: 1.35 },
};

const MONTH_SEASONALITY: Record<number, number> = {
  1: 0.4, 2: 0.45, 3: 0.55, 4: 0.7, 5: 0.8, 6: 0.9,
  7: 1.0, 8: 1.0, 9: 0.85, 10: 0.7, 11: 0.45, 12: 0.6,
};

async function getEventsForCountryMonth(countryCode: string, month: number): Promise<{ name: string; impact: number }[]> {
  // Primero intentar desde Supabase
  try {
    const monthStr = String(month).padStart(2, '0');
    const result = await supabaseAdmin
      .from('events')
      .select('title, impact_traveler, start_date')
      .eq('country', countryCode.toLowerCase())
      .or(`start_date.ilike.%-${monthStr}-%,end_date.ilike.%-${monthStr}-%`)
      .limit(20);

    if (result.data && result.data.length > 0) {
      return result.data.map(e => ({
        name: e.title,
        impact: e.impact_traveler === 'high' ? 25 : e.impact_traveler === 'medium' ? 15 : 5,
      }));
    }
  } catch {}

  // Fallback a eventos hardcodeados del calendario global
  const monthStr = String(month).padStart(2, '0');
  return EVENTS_FALLBACK
    .filter(e => e.code.toUpperCase() === countryCode.toUpperCase() && e.start_date.startsWith(`2026-${monthStr}`))
    .map(e => ({
      name: e.title,
      impact: e.impact_traveler === 'high' ? 25 : e.impact_traveler === 'medium' ? 15 : 5,
    }));
}

async function calculateIST(cityCode: string, date: Date) {
  const city = CITY_PATTERNS[cityCode.toLowerCase()];
  
  if (!city) {
    return {
      ist: 35, level: 'baja', recommendation: 'Datos no disponibles para esta ciudad',
      factors: { season: 35, price: 35, events: 35, weekday: 35 }, activeEvents: [] as { name: string; impact: number }[],
    };
  }

  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();
  
  const seasonScore = MONTH_SEASONALITY[month] * 100 * 0.35 * city.seasonMultiplier;
  const priceMultiplier = month >= 6 && month <= 9 ? 1.3 : 1.0;
  const priceScore = city.basePriceIndex * priceMultiplier * 50;
  
  const activeEvents = await getEventsForCountryMonth(city.countryCode, month);
  const eventScore = activeEvents.reduce((sum, e) => sum + e.impact, 0) * 2;
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekdayScore = isWeekend ? 60 : 40;
  
  const rawIST = (seasonScore * 0.35) + (priceScore * 0.25) + (eventScore * 0.2) + (weekdayScore * 0.2);
  const ist = Math.min(100, Math.max(0, Math.round(rawIST)));
  
  let level: string;
  let recommendation: string;
  
  if (ist <= 20) { level = 'muy_baja'; recommendation = `Ideal para visitar. ${city.name} está tranquila con precios contenidos.`; }
  else if (ist <= 40) { level = 'baja'; recommendation = 'Buena opción. Pocos turistas y precios razonables.'; }
  else if (ist <= 60) { level = 'moderada'; recommendation = 'Visitável com planeamento. Reserve com antecedência.'; }
  else if (ist <= 80) { level = 'alta'; recommendation = 'Altamente saturado. Considere datas alternativas.'; }
  else { level = 'extrema'; recommendation = 'Evite se possível. Mássimas críticas e preços elevados.'; }
  
  return {
    ist, level, recommendation,
    factors: { season: Math.round(seasonScore), price: Math.round(priceScore), events: Math.min(100, eventScore), weekday: weekdayScore },
    activeEvents,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'barcelona';
  const date = searchParams.get('date');
  
  let targetDate: Date;
  if (date) targetDate = new Date(date);
  else targetDate = new Date();
  
  const cityCode = city.toLowerCase();
  const result = await calculateIST(cityCode, targetDate);
  const cityData = CITY_PATTERNS[cityCode];
  
  return NextResponse.json({
    city: cityData ? { name: cityData.name, country: cityData.country, code: cityData.code } : { name: city, code: city },
    date: targetDate.toISOString().split('T')[0],
    ist: result.ist, level: result.level, recommendation: result.recommendation,
    factors: result.factors, activeEvents: result.activeEvents,
    methodology: 'IST = 0.35×Season + 0.25×Price + 0.20×Events + 0.20×Weekday',
    note: 'Eventos desde Wikidata+GDELT con fallback a calendario global de 85+ eventos anuales.',
  });
}
