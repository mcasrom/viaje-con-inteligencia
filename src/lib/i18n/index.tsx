'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Locale = 'es' | 'en';

interface Translation {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translation = {
  // Navigation
  'nav.backToMap': {
    es: 'Volver al mapa',
    en: 'Back to map',
  },
  'nav.checklist': {
    es: 'Checklist',
    en: 'Checklist',
  },
  'nav.premium': {
    es: 'Premium',
    en: 'Premium',
  },
  'nav.blog': {
    es: 'Blog',
    en: 'Blog',
  },
  'nav.telegramBot': {
    es: 'Bot IA',
    en: 'AI Bot',
  },
  
  // Homepage
  'home.title': {
    es: 'Viaje con Inteligencia',
    en: 'Travel with Intelligence',
  },
  'home.subtitle': {
    es: 'Riesgo Zero',
    en: 'Risk Zero',
  },
  'home.mapTitle': {
    es: 'Mapa de Riesgos por País',
    en: 'Country Risk Map',
  },
  'home.mapSubtitle': {
    es: 'Consulta el nivel de riesgo, requisitos de entrada y recomendaciones para cada destino.',
    en: 'Check risk levels, entry requirements and recommendations for each destination.',
  },
  'home.searchPlaceholder': {
    es: 'Buscar país...',
    en: 'Search country...',
  },
  'home.filterRisk': {
    es: 'Filtrar por riesgo',
    en: 'Filter by risk',
  },
  'home.showingCountries': {
    es: 'Mostrando',
    en: 'Showing',
  },
  'home.countries': {
    es: 'países',
    en: 'countries',
  },
  'home.seeDetails': {
    es: 'Ver detalles',
    en: 'See details',
  },
  
  // Risk labels
  'risk.noRisk': {
    es: 'Sin riesgo',
    en: 'No risk',
  },
  'risk.low': {
    es: 'Riesgo bajo',
    en: 'Low risk',
  },
  'risk.medium': {
    es: 'Riesgo medio',
    en: 'Medium risk',
  },
  'risk.high': {
    es: 'Riesgo alto',
    en: 'High risk',
  },
  'risk.veryHigh': {
    es: 'Muy alto',
    en: 'Very high',
  },
  
  // Country page
  'country.capital': {
    es: 'Capital',
    en: 'Capital',
  },
  'country.riskLevel': {
    es: 'Nivel de Riesgo',
    en: 'Risk Level',
  },
  'country.embassies': {
    es: 'Embajadas y Consulados de España',
    en: 'Spanish Embassies and Consulates',
  },
  'country.requirements': {
    es: 'Requisitos de Entrada',
    en: 'Entry Requirements',
  },
  'country.toDo': {
    es: 'Qué Hacer',
    en: 'What to Do',
  },
  'country.notToDo': {
    es: 'Qué NO Hacer',
    en: 'What NOT to Do',
  },
  'country.reviews': {
    es: 'Reviews de Viajeros',
    en: 'Traveler Reviews',
  },
  'country.writeReview': {
    es: 'Escribir Review',
    en: 'Write Review',
  },
  
  // Premium
  'premium.title': {
    es: 'Viaja más inteligente con Premium',
    en: 'Travel smarter with Premium',
  },
  'premium.subtitle': {
    es: 'IA Groq para planificar viajes, mapa de seismos en tiempo real, alertas de conflictos y más',
    en: 'Groq AI to plan trips, real-time earthquake map, conflict alerts and more',
  },
  'premium.monthly': {
    es: 'Premium Mensual',
    en: 'Monthly Premium',
  },
  'premium.yearly': {
    es: 'Premium Anual',
    en: 'Yearly Premium',
  },
  'premium.perMonth': {
    es: 'mes',
    en: 'month',
  },
  'premium.perYear': {
    es: 'año',
    en: 'year',
  },
  'premium.subscribe': {
    es: 'Suscribirse',
    en: 'Subscribe',
  },
  'premium.seismos': {
    es: 'Sismos',
    en: 'Earthquakes',
  },
  'premium.planner': {
    es: 'Planificador IA',
    en: 'AI Planner',
  },
  'premium.chat': {
    es: 'Chat IA',
    en: 'AI Chat',
  },
  
  // Footer
  'footer.copyright': {
    es: 'M.Castillo - Viaje con Inteligencia',
    en: 'M.Castillo - Travel with Intelligence',
  },
  'footer.dataSource': {
    es: 'Datos basados en información oficial del MAEC',
    en: 'Data based on official MAEC information',
  },
  'footer.aboutProject': {
    es: 'Sobre el proyecto',
    en: 'About the project',
  },
  'footer.bio.p1': {
    es: 'Soy M. Castillo y este es un proyecto personal donde exploro cómo la inteligencia artificial puede aplicarse al turismo de forma práctica.',
    en: "I'm M. Castillo and this is a personal project where I explore how artificial intelligence can be applied to tourism in a practical way.",
  },
  'footer.bio.p2': {
    es: 'Desde España, desarrollo herramientas que combinan automatización y análisis para simplificar la planificación de viajes. No es un producto corporativo, sino una iniciativa independiente.',
    en: 'From Spain, I develop tools that combine automation and analysis to simplify travel planning. This is not a corporate product, but an independent initiative.',
  },
  'footer.bio.p3': {
    es: 'El objetivo es claro: crear soluciones útiles, simple y accesibles que ayuden a viajar mejor, reduciendo tiempo, coste y complejidad.',
    en: 'The goal is clear: create useful, simple, and accessible solutions that help people travel better, reducing time, cost, and complexity.',
  },
  
  // Testimonials
  'testimonials.title': {
    es: 'Lo que dicen nuestros viajeros',
    en: 'What our travelers say',
  },
  'testimonials.subtitle': {
    es: 'Miles de viajeros confían en Viaje con Inteligencia',
    en: 'Thousands of travelers trust Travel with Intelligence',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[locale] || translation.es;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export const locales: Locale[] = ['es', 'en'];
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};
