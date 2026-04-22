import { NextResponse } from 'next/server';

interface CityPattern {
  name: string;
  code: string;
  country: string;
  countryCode: string;
  seasonMultiplier: number;
  basePriceIndex: number;
  events: { name: string; month: number; impact: number }[];
}

const CITY_PATTERNS: Record<string, CityPattern> = {
  barcelona: {
    name: 'Barcelona',
    code: 'barcelona',
    country: 'España',
    countryCode: 'ES',
    seasonMultiplier: 1.3,
    basePriceIndex: 1.5,
    events: [
      { name: 'Mobile World Congress', month: 2, impact: 25 },
      { name: 'Sant Joan', month: 6, impact: 20 },
      { name: 'La Mercè', month: 9, impact: 20 },
      { name: 'Festa Major Gràcia', month: 8, impact: 15 },
    ],
  },
  roma: {
    name: 'Roma',
    code: 'roma',
    country: 'Italia',
    countryCode: 'IT',
    seasonMultiplier: 1.4,
    basePriceIndex: 1.4,
    events: [
      { name: 'Semana Santa', month: 4, impact: 30 },
      { name: 'Ferragosto', month: 8, impact: 25 },
      { name: 'Natale', month: 12, impact: 20 },
    ],
  },
  paris: {
    name: 'París',
    code: 'paris',
    country: 'Francia',
    countryCode: 'FR',
    seasonMultiplier: 1.35,
    basePriceIndex: 1.6,
    events: [
      { name: 'Fashion Week', month: 2, impact: 20 },
      { name: 'Fashion Week', month: 9, impact: 20 },
      { name: 'Juegos Olímpicos', month: 7, impact: 35 },
      { name: 'Fête de la Musique', month: 6, impact: 15 },
    ],
  },
  madrid: {
    name: 'Madrid',
    code: 'madrid',
    country: 'España',
    countryCode: 'ES',
    seasonMultiplier: 1.2,
    basePriceIndex: 1.3,
    events: [
      { name: 'San Isidro', month: 5, impact: 20 },
      { name: 'Navidad', month: 12, impact: 25 },
      { name: 'Semana Santa', month: 4, impact: 20 },
    ],
  },
  lisboa: {
    name: 'Lisboa',
    code: 'lisboa',
    country: 'Portugal',
    countryCode: 'PT',
    seasonMultiplier: 1.25,
    basePriceIndex: 1.2,
    events: [
      { name: 'Festas de Lisboa', month: 6, impact: 25 },
      { name: 'Santo António', month: 6, impact: 25 },
    ],
  },
  vencia: {
    name: 'Venecia',
    code: 'vencia',
    country: 'Italia',
    countryCode: 'IT',
    seasonMultiplier: 1.5,
    basePriceIndex: 1.7,
    events: [
      { name: 'Carnaval', month: 2, impact: 25 },
      { name: 'Festa del Redentore', month: 7, impact: 20 },
    ],
  },
  amsterdam: {
    name: 'Ámsterdam',
    code: 'amsterdam',
    country: 'Países Bajos',
    countryCode: 'NL',
    seasonMultiplier: 1.2,
    basePriceIndex: 1.4,
    events: [
      { name: 'Koningsdag', month: 4, impact: 30 },
      { name: 'Grachtenfestival', month: 8, impact: 15 },
    ],
  },
  munich: {
    name: 'Múnich',
    code: 'munich',
    country: 'Alemania',
    countryCode: 'DE',
    seasonMultiplier: 1.15,
    basePriceIndex: 1.35,
    events: [
      { name: 'Oktoberfest', month: 9, impact: 35 },
      { name: 'Navidad', month: 12, impact: 25 },
    ],
  },
};

const MONTH_SEASONALITY: Record<number, number> = {
  1: 0.4,
  2: 0.45,
  3: 0.55,
  4: 0.7,
  5: 0.8,
  6: 0.9,
  7: 1.0,
  8: 1.0,
  9: 0.85,
  10: 0.7,
  11: 0.45,
  12: 0.6,
};

function calculateIST(cityCode: string, date: Date): {
  ist: number;
  level: string;
  recommendation: string;
  factors: {
    season: number;
    price: number;
    events: number;
    weekday: number;
  };
} {
  const city = CITY_PATTERNS[cityCode.toLowerCase()];
  
  if (!city) {
    return {
      ist: 35,
      level: 'baja',
      recommendation: 'Datos no disponibles para esta ciudad',
      factors: { season: 35, price: 35, events: 35, weekday: 35 },
    };
  }

  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();
  
  const seasonScore = MONTH_SEASONALITY[month] * 100 * 0.35 * city.seasonMultiplier;
  
  const priceMultiplier = month >= 6 && month <= 9 ? 1.3 : 1.0;
  const priceScore = city.basePriceIndex * priceMultiplier * 50;
  
  const monthEvents = city.events.filter(e => e.month === month);
  const eventScore = monthEvents.reduce((sum, e) => sum + e.impact, 0) * 2;
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekdayScore = isWeekend ? 60 : 40;
  
  const rawIST = (seasonScore * 0.35) + (priceScore * 0.25) + (eventScore * 0.2) + (weekdayScore * 0.2);
  const ist = Math.min(100, Math.max(0, Math.round(rawIST)));
  
  let level: string;
  let recommendation: string;
  
  if (ist <= 20) {
    level = 'muy_baja';
    recommendation = `Ideal para visitar. ${city.name} está tranquila con precios contenidos.`;
  } else if (ist <= 40) {
    level = 'baja';
    recommendation = `Buena opción. Pocos turistas y precios razonables.`;
  } else if (ist <= 60) {
    level = 'moderada';
    recommendation = `Visitável com planeamento. Reserve com antecedência.`;
  } else if (ist <= 80) {
    level = 'alta';
    recommendation = `Altamente saturado. Considere datas alternativas ou llegue temprano.`;
  } else {
    level = 'extrema';
    recommendation = `Evite se possível. Masse críticas e preços elevados.`;
  }
  
  return {
    ist,
    level,
    recommendation,
    factors: {
      season: Math.round(seasonScore),
      price: Math.round(priceScore),
      events: Math.round(eventScore),
      weekday: weekdayScore,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'barcelona';
  const date = searchParams.get('date');
  
  let targetDate: Date;
  if (date) {
    targetDate = new Date(date);
  } else {
    targetDate = new Date();
  }
  
  const cityCode = city.toLowerCase();
  const result = calculateIST(cityCode, targetDate);
  
  const cityData = CITY_PATTERNS[cityCode];
  
  return NextResponse.json({
    city: cityData ? {
      name: cityData.name,
      country: cityData.country,
      code: cityData.code,
    } : { name: city, code: city },
    date: targetDate.toISOString().split('T')[0],
    ist: result.ist,
    level: result.level,
    recommendation: result.recommendation,
    factors: result.factors,
    methodology: 'IST = 0.35×Season + 0.25×Price + 0.20×Events + 0.20×Weekday',
    note: 'Índice basado en patrones históricos. No sustituye datos en tiempo real.',
  });
}
