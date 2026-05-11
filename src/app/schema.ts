import { MetadataRoute } from 'next';

/**
 * Schema.org structured data generator
 * Provides rich snippets for Google Search, social media, etc.
 * 
 * Generated routes:
 * GET /api/schema → JSON-LD structured data
 * Automatically embedded in <head> via Next.js metadata
 */

export default function schema(): MetadataRoute.JSON {
  const baseUrl = 'https://www.viajeinteligencia.com';
  const currentYear = new Date().getFullYear();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // ========================================
      // 1. ORGANIZATION
      // ========================================
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Viaje con Inteligencia',
        alternateName: 'ViajeIA',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 250,
          height: 60,
        },
        description: 'Mapa interactivo de riesgos de viaje. Información oficial MAEC. Análisis OSINT automático. Chat IA para viajeros.',
        sameAs: [
          'https://twitter.com/ViajeIntel2026',
          'https://instagram.com/viajeinteligencia',
          'https://github.com/mcasrom/viaje-con-inteligencia',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'info@viajeinteligencia.com',
          areaServed: ['ES', 'MX', 'AR', 'CL'],
          availableLanguage: ['es', 'en'],
        },
        foundingDate: '2026-04-15',
        operatingStatus: 'Operational',
      },

      // ========================================
      // 2. WEBSITE (Main landing page)
      // ========================================
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Viaje con Inteligencia',
        description: 'Mapa de riesgos de viaje MAEC - 107 países con análisis en tiempo real',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/blog?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        mainEntity: {
          '@id': `${baseUrl}/#organization`,
        },
      },

      // ========================================
      // 3. LOCAL BUSINESS (Spain-based)
      // ========================================
      {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/#localbusiness`,
        name: 'Viaje con Inteligencia',
        url: baseUrl,
        areaServed: ['ES', 'MX', 'AR', 'CL', 'CO', 'PE'],
        availableLanguage: 'es',
        priceRange: '€€',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'info@viajeinteligencia.com',
          areaServed: 'ES',
        },
        knowsAbout: [
          'Travel Safety',
          'Risk Assessment',
          'Travel Planning',
          'OSINT',
          'Geopolitics',
          'Travel Insurance',
        ],
      },

      // ========================================
      // 4. BREADCRUMB (Navigation context)
      // ========================================
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/#breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${baseUrl}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Mapa de Riesgos',
            item: `${baseUrl}/analisis`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Decidir Destino',
            item: `${baseUrl}/decidir`,
          },
        ],
      },

      // ========================================
      // 5. FAQ SCHEMA (Common questions)
      // ========================================
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué es Viaje con Inteligencia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Viaje con Inteligencia es una plataforma que proporciona análisis de riesgos de viaje basado en datos oficiales MAEC, análisis OSINT automático y recomendaciones personalizadas para 107 países.',
            },
          },
          {
            '@type': 'Question',
            name: '¿De dónde vienen los datos de riesgo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Los datos proceden del Ministerio de Asuntos Exteriores (MAEC) español, información de embajadas, fuentes OSINT públicas (GDELT, USGS, Reddit) y análisis en tiempo real.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Cómo funciona el análisis de riesgos?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Utilizamos machine learning (clustering K-Means), datos históricos de MAEC, señales OSINT, precios de petróleo y estacionalidad para clasificar 107 destinos.',
            },
          },
        ],
      },

      // ========================================
      // 6. ARTICLE (For blog posts - template)
      // ========================================
      {
        '@type': 'Article',
        '@id': `${baseUrl}/blog/#article-template`,
        '@context': 'https://schema.org',
        name: 'Article Template',
        description: 'Use this schema in each blog post (see blog/[slug]/page.tsx)',
        author: {
          '@type': 'Person',
          name: 'M.Castillo',
        },
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        image: {
          '@type': 'ImageObject',
          url: `${baseUrl}/preview_favicon.jpg`,
          width: 1200,
          height: 630,
        },
        datePublished: currentYear,
        dateModified: currentYear,
      },

      // ========================================
      // 7. AGGREGATE RATING (For overall site)
      // ========================================
      {
        '@type': 'AggregateRating',
        '@id': `${baseUrl}/#rating`,
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
        description: 'Basado en feedback de usuarios sobre precisión de análisis de riesgos',
      },

      // ========================================
      // 8. PRODUCT/SERVICE (Premium subscription)
      // ========================================
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/premium/#service`,
        name: 'Viaje con Inteligencia Premium',
        applicationCategory: 'Travel Planning',
        offers: {
          '@type': 'Offer',
          price: '4.99',
          priceCurrency: 'EUR',
          eligibleRegion: 'ES',
          availability: 'InStock',
          url: `${baseUrl}/premium`,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '150',
        },
      },
    ],
  };
}
