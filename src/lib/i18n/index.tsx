'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createLogger } from '@/lib/logger';

const log = createLogger('I18n');

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

  // Slogans
  'slogan.tagline': {
    es: 'Tu radar de seguridad global impulsado por IA.',
    en: 'Your AI-powered global travel safety radar.',
  },
  'slogan.full': {
    es: 'Viaje con Inteligencia: Tu radar de seguridad global impulsado por IA.',
    en: 'Smart Traveler: AI-Driven Global Risk Radar for the Conscious Explorer.',
  },
  'premium.upsell': {
    es: 'Desbloquea análisis por IA, alertas en tiempo real, chat IA ilimitado y herramientas exclusivas.',
    en: 'Unlock AI analysis, real-time alerts, unlimited AI chat and exclusive tools.',
  },

  // TopBar
  'topbar.countries': {
    es: 'países',
    en: 'countries',
  },
  'topbar.updated': {
    es: 'Datos actualizados',
    en: 'Live data',
  },
  'topbar.maecLabel': {
    es: 'MAEC May 2026',
    en: 'MAEC May 2026',
  },
  'topbar.decide': {
    es: 'Decidir',
    en: 'Decide',
  },
  'topbar.blog': {
    es: 'Blog',
    en: 'Blog',
  },
  'topbar.cost': {
    es: 'Coste',
    en: 'Cost',
  },
  'topbar.analysis': {
    es: 'Análisis',
    en: 'Analysis',
  },
  'topbar.routes': {
    es: 'Rutas',
    en: 'Routes',
  },
  'topbar.route': {
    es: 'Ruta',
    en: 'Route',
  },
  'topbar.radius': {
    es: 'Radius',
    en: 'Radius',
  },
  'topbar.alerts': {
    es: 'Alertas',
    en: 'Alerts',
  },
  'topbar.premium': {
    es: 'Premium',
    en: 'Premium',
  },
  // Mobile menu
  'mobile.decide30': {
    es: 'Decide en 30 seg',
    en: 'Decide in 30s',
  },
  'mobile.blogOsint': {
    es: 'Blog OSINT',
    en: 'OSINT Blog',
  },
  'mobile.tripCost': {
    es: 'Coste del Viaje',
    en: 'Trip Cost',
  },
  'mobile.globalAi': {
    es: 'Análisis Global IA',
    en: 'Global AI Analysis',
  },
  'mobile.safeRoutes': {
    es: 'Rutas Seguras',
    en: 'Safe Routes',
  },
  'mobile.smartRadius': {
    es: 'Radio Inteligente',
    en: 'Smart Radius',
  },
  'mobile.maecAlerts': {
    es: 'Alertas MAEC',
    en: 'MAEC Alerts',
  },
  'mobile.dashboardKpis': {
    es: 'Dashboard KPIs',
    en: 'Dashboard KPIs',
  },
  'mobile.allCountries': {
    es: 'Todos los países',
    en: 'All countries',
  },
  'mobile.checklist': {
    es: 'Checklist Viaje',
    en: 'Trip Checklist',
  },
  // Aria
  'aria.closeMenu': {
    es: 'Cerrar menú',
    en: 'Close menu',
  },
  'aria.openMenu': {
    es: 'Abrir menú',
    en: 'Open menu',
  },
  'aria.closePanel': {
    es: 'Cerrar panel',
    en: 'Close panel',
  },
  'aria.openPanel': {
    es: 'Abrir panel explorar',
    en: 'Open explore panel',
  },

  // Map
  'map.loading': {
    es: 'Cargando mapa interactivo...',
    en: 'Loading interactive map...',
  },

  // Side panel
  'panel.explore': {
    es: 'Explorar',
    en: 'Explore',
  },
  'panel.search': {
    es: 'Buscar país...',
    en: 'Search country...',
  },
  'panel.filterRisk': {
    es: 'Filtrar por riesgo',
    en: 'Filter by risk',
  },
  'panel.safe': {
    es: 'Seguro',
    en: 'Safe',
  },
  'panel.low': {
    es: 'Bajo',
    en: 'Low',
  },
  'panel.medium': {
    es: 'Medio',
    en: 'Medium',
  },
  'panel.high': {
    es: 'Alto',
    en: 'High',
  },
  'panel.alertsTitle': {
    es: 'Alertas MAEC activas',
    en: 'Active MAEC alerts',
  },
  'alert.medium': {
    es: 'Revisar recomendaciones antes de viajar',
    en: 'Check recommendations before traveling',
  },
  'alert.high': {
    es: 'Viaje no esencial desaconsejado',
    en: 'Non-essential travel discouraged',
  },
  'alert.veryHigh': {
    es: 'Evitar todo viaje — zona de conflicto',
    en: 'Avoid all travel — conflict zone',
  },
  'alert.fallback': {
    es: 'Consultar advertencias',
    en: 'Check warnings',
  },
  'panel.viewAll': {
    es: 'Ver todas las alertas →',
    en: 'View all alerts →',
  },
  'panel.tools': {
    es: 'Herramientas',
    en: 'Tools',
  },
  'panel.recentPosts': {
    es: 'Últimos análisis',
    en: 'Latest analysis',
  },
  'panel.all': {
    es: 'Todos',
    en: 'All',
  },
  // Tools
  'tool.costCalc': {
    es: 'Calculadora Coste Viajes',
    en: 'Trip Cost Calculator',
  },
  'tool.safeRoutes': {
    es: 'Rutas Seguras',
    en: 'Safe Routes',
  },
  'tool.checklist': {
    es: 'Checklist',
    en: 'Checklist',
  },
  'tool.kpis': {
    es: 'Dashboard KPIs',
    en: 'KPIs Dashboard',
  },
  'tool.insurance': {
    es: 'Seguro Viaje',
    en: 'Travel Insurance',
  },

  // CTA
  'cta.decide': {
    es: 'Decide tu viaje en 30 segundos',
    en: 'Decide your trip in 30 seconds',
  },

  // Hero
  'hero.title': {
    es: '¿Es seguro viajar a...?',
    en: 'Is it safe to travel to...?',
  },
  'hero.subtitle': {
    es: 'Riesgo país en tiempo real + alertas OSINT + fuentes oficiales.',
    en: 'Real-time country risk + OSINT alerts + official sources.',
  },
  'hero.searchPlaceholder': {
    es: 'Busca un país...',
    en: 'Search a country...',
  },
  'hero.viewMap': {
    es: 'Ver mapa global',
    en: 'View global map',
  },
  'hero.alerts': {
    es: 'Recibir alertas gratis',
    en: 'Get free alerts',
  },

  // Trust band
  'trust.title': {
    es: 'Cómo funciona Viaje Inteligencia',
    en: 'How Viaje Inteligencia works',
  },
  'trust.subtitle': {
    es: 'Datos oficiales, IA asistida y transparencia total — sin cajas negras.',
    en: 'Official data, assisted AI and full transparency — no black boxes.',
  },
  'trust.officialData': {
    es: 'Datos oficiales',
    en: 'Official data',
  },
  'trust.officialDataDesc': {
    es: 'MAEC + US State Dept + 73 fuentes OSINT en tiempo real',
    en: 'MAEC + US State Dept + 73 real-time OSINT sources',
  },
  'trust.aiAssisted': {
    es: 'IA asistida',
    en: 'AI assisted',
  },
  'trust.aiAssistedDesc': {
    es: 'Groq analiza, no decide. Las alertas las validamos con fuentes',
    en: 'Groq analyzes, doesn\'t decide. Alerts are validated with sources',
  },
  'trust.openMethod': {
    es: 'Metodología abierta',
    en: 'Open methodology',
  },
  'trust.openMethodDesc': {
    es: 'Cada riesgo, cada score, cada fuente — explicado y auditable',
    en: 'Every risk, every score, every source — explained and auditable',
  },
  'trust.privacy': {
    es: 'Privacidad por diseño',
    en: 'Privacy by design',
  },
  'trust.privacyDesc': {
    es: 'No almacenamos ubicación. Sin tracking. Tus pólizas de seguro solo en tu navegador',
    en: 'We don\'t store location. No tracking. Your insurance policies stay in your browser',
  },
  'trust.independent': {
    es: 'Proyecto independiente',
    en: 'Independent project',
  },
  'trust.independentDesc': {
    es: 'Desarrollado en España. Sin venture capital. Sin venta de datos',
    en: 'Built in Spain. No venture capital. No data selling',
  },
  'trust.metodologia': {
    es: 'Metodología completa',
    en: 'Full methodology',
  },
  'trust.transparencia': {
    es: 'Centro de Transparencia',
    en: 'Transparency Center',
  },
  'trust.fuentes': {
    es: 'Fuentes y limitaciones',
    en: 'Sources and limitations',
  },
  'trust.seguridad': {
    es: 'Cómo protegemos tus datos',
    en: 'How we protect your data',
  },

  // Home section
  'home.travelSafe': {
    es: 'Viaja informado, viaja seguro',
    en: 'Travel informed, travel safe',
  },
  'home.subtitle2': {
    es: 'Mapa interactivo con datos oficiales MAEC, análisis por IA y herramientas inteligentes para planificar tu viaje.',
    en: 'Interactive map with official MAEC data, AI analysis and smart tools to plan your trip.',
  },
  'home.countriesLink': {
    es: 'Países',
    en: 'Countries',
  },
  'home.costCalc': {
    es: 'Calculadora Coste',
    en: 'Cost Calculator',
  },
  'home.analysis': {
    es: 'Análisis',
    en: 'Analysis',
  },
  'home.routes': {
    es: 'Rutas',
    en: 'Routes',
  },
  'home.seoTitle': {
    es: 'Mapa de Riesgos de Viaje con Inteligencia Artificial',
    en: 'AI-Powered Travel Risk Map',
  },
  'home.seoP1': {
    es: 'Viaje con Inteligencia es la primera plataforma que combina el índice de riesgo MAEC español con análisis de Machine Learning para {n} países. El índice IRV (Indicador de Riesgo de Viaje) cruza 16 KPIs — desde seguridad y terrorismo hasta coste de vida e inflación — para darte una puntuación única y actualizada.',
    en: 'Viaje Inteligencia is the first platform combining the Spanish MAEC risk index with Machine Learning analysis for {n} countries. The IRV index (Travel Risk Indicator) cross-references 16 KPIs — from security and terrorism to cost of living and inflation — giving you a unique, up-to-date score.',
  },
  'home.seoP2': {
    es: 'El motor de análisis inteligente agrupa destinos según tu perfil: presupuesto, tipo de viaje y preferencias. El Chat IA con Groq te da recomendaciones personalizadas en segundos. El sistema OSINT monitoriza 73+ fuentes en tiempo real: GDELT, USGS, GDACS, Reddit y RSS.',
    en: 'The smart analysis engine groups destinations by your profile: budget, trip type and preferences. The AI Chat with Groq gives personalized recommendations in seconds. The OSINT system monitors 73+ real-time sources: GDELT, USGS, GDACS, Reddit and RSS.',
  },
  'home.seoP3': {
    es: 'Herramientas adicionales: calculadora de coste de viaje ajustada al petróleo, rutas temáticas de España, alertas de cambio de riesgo MAEC, generador de reclamaciones para aerolíneas y dashboard con KPIs globales de 6 índices internacionales.',
    en: 'Additional tools: oil-adjusted trip cost calculator, Spanish thematic routes, MAEC risk change alerts, airline claims generator and global KPIs dashboard from 6 international indices.',
  },
  'home.riskSummary': {
    es: '{riskCount} países en riesgo alto o muy alto — consulta las alertas activas antes de viajar',
    en: '{riskCount} countries at high or very high risk — check active alerts before traveling',
  },

  // About
  'about.title': {
    es: 'Sobre el proyecto',
    en: 'About the project',
  },
  'about.text': {
    es: 'Soy Miguel Castillo y desarrollo Viaje Inteligencia como plataforma independiente de travel intelligence, OSINT y análisis de riesgo para viajeros. Stack: Next.js, Supabase, Groq, OpenStreetMap, datos MAEC + US State Dept + GDELT + USGS + GDACS.',
    en: 'I\'m Miguel Castillo and I build Viaje Inteligencia as an independent travel intelligence, OSINT and risk analysis platform for travelers. Stack: Next.js, Supabase, Groq, OpenStreetMap, MAEC + US State Dept + GDELT + USGS + GDACS data.',
  },
  'about.independent': {
    es: 'Proyecto 100% independiente, desarrollado en España. Sin venture capital, sin publicidad, sin venta de datos.',
    en: '100% independent project, built in Spain. No venture capital, no ads, no data selling.',
  },
  'about.metodologia': {
    es: 'Metodología →',
    en: 'Methodology →',
  },
  'about.manifiesto': {
    es: 'Manifiesto →',
    en: 'Manifesto →',
  },
  'about.transparencia': {
    es: 'Transparencia →',
    en: 'Transparency →',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/en') ? 'en' : 'es';
    }
    return 'es';
  });

  useEffect(() => {
    const urlLocale = pathname.startsWith('/en') ? 'en' : 'es';
    setLocale(urlLocale);
    document.documentElement.lang = urlLocale;
  }, [pathname]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[key];
    if (!translation) {
      log.warn(`Translation missing for key: ${key}`);
      return key;
    }
    let text = translation[locale] || translation.es;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
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
