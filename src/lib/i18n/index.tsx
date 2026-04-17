'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Locale = 'es' | 'en' | 'pt';

interface Translation {
  [key: string]: {
    es: string;
    en: string;
    pt: string;
  };
}

const translations: Translation = {
  // Navigation
  'nav.backToMap': {
    es: 'Volver al mapa',
    en: 'Back to map',
    pt: 'Voltar ao mapa',
  },
  'nav.checklist': {
    es: 'Checklist',
    en: 'Checklist',
    pt: 'Checklist',
  },
  'nav.premium': {
    es: 'Premium',
    en: 'Premium',
    pt: 'Premium',
  },
  'nav.blog': {
    es: 'Blog',
    en: 'Blog',
    pt: 'Blog',
  },
  'nav.telegramBot': {
    es: 'Bot IA',
    en: 'AI Bot',
    pt: 'Bot IA',
  },
  
  // Homepage
  'home.title': {
    es: 'Viaje con Inteligencia',
    en: 'Travel with Intelligence',
    pt: 'Viaje com Inteligência',
  },
  'home.subtitle': {
    es: 'Riesgo Zero',
    en: 'Risk Zero',
    pt: 'Risco Zero',
  },
  'home.mapTitle': {
    es: 'Mapa de Riesgos por País',
    en: 'Country Risk Map',
    pt: 'Mapa de Riscos por País',
  },
  'home.mapSubtitle': {
    es: 'Consulta el nivel de riesgo, requisitos de entrada y recomendaciones para cada destino.',
    en: 'Check risk levels, entry requirements and recommendations for each destination.',
    pt: 'Consulte níveis de risco, requisitos de entrada e recomendações para cada destino.',
  },
  'home.searchPlaceholder': {
    es: 'Buscar país...',
    en: 'Search country...',
    pt: 'Pesquisar país...',
  },
  'home.filterRisk': {
    es: 'Filtrar por riesgo',
    en: 'Filter by risk',
    pt: 'Filtrar por risco',
  },
  'home.showingCountries': {
    es: 'Mostrando',
    en: 'Showing',
    pt: 'Mostrando',
  },
  'home.countries': {
    es: 'países',
    en: 'countries',
    pt: 'países',
  },
  'home.seeDetails': {
    es: 'Ver detalles',
    en: 'See details',
    pt: 'Ver detalhes',
  },
  
  // Risk labels
  'risk.noRisk': {
    es: 'Sin riesgo',
    en: 'No risk',
    pt: 'Sem risco',
  },
  'risk.low': {
    es: 'Riesgo bajo',
    en: 'Low risk',
    pt: 'Risco baixo',
  },
  'risk.medium': {
    es: 'Riesgo medio',
    en: 'Medium risk',
    pt: 'Risco médio',
  },
  'risk.high': {
    es: 'Riesgo alto',
    en: 'High risk',
    pt: 'Risco alto',
  },
  'risk.veryHigh': {
    es: 'Muy alto',
    en: 'Very high',
    pt: 'Muito alto',
  },
  
  // Country page
  'country.capital': {
    es: 'Capital',
    en: 'Capital',
    pt: 'Capital',
  },
  'country.riskLevel': {
    es: 'Nivel de Riesgo',
    en: 'Risk Level',
    pt: 'Nível de Risco',
  },
  'country.embassies': {
    es: 'Embajadas y Consulados de España',
    en: 'Spanish Embassies and Consulates',
    pt: 'Embaixadas e Consulados da Espanha',
  },
  'country.requirements': {
    es: 'Requisitos de Entrada',
    en: 'Entry Requirements',
    pt: 'Requisitos de Entrada',
  },
  'country.toDo': {
    es: 'Qué Hacer',
    en: 'What to Do',
    pt: 'O Que Fazer',
  },
  'country.notToDo': {
    es: 'Qué NO Hacer',
    en: 'What NOT to Do',
    pt: 'O Que NÃO Fazer',
  },
  'country.reviews': {
    es: 'Reviews de Viajeros',
    en: 'Traveler Reviews',
    pt: 'Avaliações de Viajantes',
  },
  'country.writeReview': {
    es: 'Escribir Review',
    en: 'Write Review',
    pt: 'Escrever Avaliação',
  },
  
  // Premium
  'premium.title': {
    es: 'Viaja más inteligente con Premium',
    en: 'Travel smarter with Premium',
    pt: 'Viaje de forma mais inteligente com Premium',
  },
  'premium.subtitle': {
    es: 'IA Groq para planificar viajes, mapa de seismos en tiempo real, alertas de conflictos y más',
    en: 'Groq AI to plan trips, real-time earthquake map, conflict alerts and more',
    pt: 'IA Groq para planejar viagens, mapa de terremotos em tempo real, alertas de conflitos e mais',
  },
  'premium.monthly': {
    es: 'Premium Mensual',
    en: 'Monthly Premium',
    pt: 'Premium Mensal',
  },
  'premium.yearly': {
    es: 'Premium Anual',
    en: 'Yearly Premium',
    pt: 'Premium Anual',
  },
  'premium.perMonth': {
    es: 'mes',
    en: 'month',
    pt: 'mês',
  },
  'premium.perYear': {
    es: 'año',
    en: 'year',
    pt: 'ano',
  },
  'premium.subscribe': {
    es: 'Suscribirse',
    en: 'Subscribe',
    pt: 'Inscrever-se',
  },
  'premium.seismos': {
    es: 'Sismos',
    en: 'Earthquakes',
    pt: 'Terremotos',
  },
  'premium.planner': {
    es: 'Planificador IA',
    en: 'AI Planner',
    pt: 'Planejador IA',
  },
  'premium.chat': {
    es: 'Chat IA',
    en: 'AI Chat',
    pt: 'Chat IA',
  },
  
  // Footer
  'footer.copyright': {
    es: 'M.Castillo - Viaje con Inteligencia',
    en: 'M.Castillo - Travel with Intelligence',
    pt: 'M.Castillo - Viaje com Inteligência',
  },
  'footer.dataSource': {
    es: 'Datos basados en información oficial del MAEC',
    en: 'Data based on official MAEC information',
    pt: 'Dados baseados em informações oficiais do MAEC',
  },
  'footer.aboutProject': {
    es: 'Sobre el proyecto',
    en: 'About the project',
    pt: 'Sobre o projeto',
  },
  'footer.bio.p1': {
    es: 'Soy M. Castillo y este es un proyecto personal donde exploro cómo la inteligencia artificial puede aplicarse al turismo de forma práctica.',
    en: "I'm M. Castillo and this is a personal project where I explore how artificial intelligence can be applied to tourism in a practical way.",
    pt: 'Sou M. Castillo e este é um projeto pessoal onde exploro como a inteligência artificial pode ser aplicada ao turismo de forma prática.',
  },
  'footer.bio.p2': {
    es: 'Desde España, desarrollo herramientas que combinan automatización y análisis para simplificar la planificación de viajes. No es un producto corporativo, sino una iniciativa independiente.',
    en: 'From Spain, I develop tools that combine automation and analysis to simplify travel planning. This is not a corporate product, but an independent initiative.',
    pt: 'Da Espanha, desenvolvo ferramentas que combinam automação e análise para simplificar o planejamento de viagens. Não é um produto corporativo, mas uma iniciativa independente.',
  },
  'footer.bio.p3': {
    es: 'El objetivo es claro: crear soluciones útiles, simples y accesibles que ayuden a viajar mejor, reduciendo tiempo, coste y complejidad.',
    en: 'The goal is clear: create useful, simple, and accessible solutions that help people travel better, reducing time, cost, and complexity.',
    pt: 'O objetivo é claro: criar soluções úteis, simples e acessíveis que ajudem a viajar melhor, reduzindo tempo, custo e complexidade.',
  },
  
  // Testimonials
  'testimonials.title': {
    es: 'Lo que dicen nuestros viajeros',
    en: 'What our travelers say',
    pt: 'O que nossos viajantes dizem',
  },
  'testimonials.subtitle': {
    es: 'Miles de viajeros confían en Viaje con Inteligencia',
    en: 'Thousands of travelers trust Travel with Intelligence',
    pt: 'Milhares de viajantes confiam em Viaje com Inteligência',
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

export const locales: Locale[] = ['es', 'en', 'pt'];
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};
