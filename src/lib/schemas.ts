// src/lib/schemas.ts
// Schemas JSON-LD para SEO - Viaje con Inteligencia

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Viaje con Inteligencia',
    url: 'https://viajeconinteligencia.com',
    description: 'Planifica tu viaje con IA. Informacion actualizada sobre requisitos, seguridad y recomendaciones para viajar.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://viajeconinteligencia.com/buscar?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Viaje con Inteligencia',
    url: 'https://viajeconinteligencia.com',
    logo: 'https://viajeconinteligencia.com/logo.png',
    sameAs: [
      'https://t.me/viajeconinteligencia_bot'
    ]
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateCountryArticleSchema(country: {
  name: string
  slug: string
  description: string
  lastUpdated?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Viajar a ${country.name} - Requisitos y Recomendaciones 2026`,
    description: country.description,
    url: `https://viajeconinteligencia.com/pais/${country.slug}`,
    dateModified: country.lastUpdated || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Viaje con Inteligencia'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Viaje con Inteligencia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://viajeconinteligencia.com/logo.png'
      }
    }
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}