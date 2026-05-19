import { describe, it, expect } from '@jest/globals'
import { generateInfografiaSVG, generateInfografiaHTML } from '@/lib/infografia/template'
import type { InfografiaData } from '@/lib/infografia/data'

function mockData(overrides?: Partial<InfografiaData>): InfografiaData {
  const base: InfografiaData = {
    weekStart: '2026-05-18',
    weekEnd: '2026-05-24',
    edition: 20,
    title: 'Informe Semanal #20',
    subtitle: '18 May — 24 May 2026',
    stats: {
      totalPaises: 120,
      totalContinentes: 6,
      sinRiesgo: 42,
      riesgoBajo: 47,
      riesgoMedio: 9,
      riesgoAlto: 12,
      riesgoMuyAlto: 0,
      seguroOBajo: 89,
      altoOMuyAlto: 12,
    },
    riskDistribution: { sinRiesgo: 42, bajo: 47, medio: 9, alto: 12, muyAlto: 0 },
    topRiskCountries: [
      { code: 'AF', name: 'Afganistán', flag: '🇦🇫', region: 'Asia', riskLevel: 'alto', riskScore: 4 },
      { code: 'HT', name: 'Haití', flag: '🇭🇹', region: 'América', riskLevel: 'alto', riskScore: 4 },
      { code: 'IR', name: 'Irán', flag: '🇮🇷', region: 'Asia', riskLevel: 'alto', riskScore: 4 },
      { code: 'LB', name: 'Líbano', flag: '🇱🇧', region: 'Asia', riskLevel: 'alto', riskScore: 4 },
      { code: 'LY', name: 'Libia', flag: '🇱🇾', region: 'África', riskLevel: 'alto', riskScore: 4 },
    ],
    topSafeCountries: [
      { code: 'IS', name: 'Islandia', flag: '🇮🇸', region: 'Europa', riskLevel: 'sin-riesgo', riskScore: 1 },
      { code: 'CH', name: 'Suiza', flag: '🇨🇭', region: 'Europa', riskLevel: 'sin-riesgo', riskScore: 1 },
    ],
    gwi: {
      riskScore: 10.9,
      gpiScore: 10.9,
      gtiScore: 34.0,
      hdiScore: 14.2,
      ipcScore: 50,
      incidentScore: 0,
      total: 27.0,
    },
    gwiTrend: 0,
    incidentsThisWeek: 0,
    countriesChanged: [],
    timestamp: '2026-05-18T03:00:00.000Z',
  }
  return { ...base, ...overrides }
}

describe('generateInfografiaSVG', () => {
  it('returns valid SVG with root element', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('viewBox="0 0 1200 1500"')
  })

  it('contains brand and edition', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('VIAJE CON INTELIGENCIA')
    expect(svg).toContain('Edicion #20')
    expect(svg).toContain('2026-05-18')
    expect(svg).toContain('2026-05-24')
  })

  it('renders GWI score', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('GLOBAL WEEKLY INDEX (GWI)')
    expect(svg).toContain('27.0')
  })

  it('renders sub-index bars', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('GPI')
    expect(svg).toContain('GTI')
    expect(svg).toContain('INCIDENTS')
    expect(svg).toContain('HDI')
  })

  it('renders Top 5 countries WITHOUT flag emojis', () => {
    const svg = generateInfografiaSVG(mockData())
    // Flag emoji regex: regional indicator symbols or any multi-emoji sequence
    const flagPattern = /[\u{1F1E6}-\u{1F1FF}]/u
    expect(svg).not.toMatch(flagPattern)
  })

  it('renders Top 5 with risk dots and country codes', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('<circle') // risk indicator dots
    expect(svg).toContain('AF')
    expect(svg).toContain('HT')
    expect(svg).toContain('IR')
    expect(svg).toContain('Afganistán')
    expect(svg).toContain('Haití')
  })

  it('renders Top 5 countries sorted by risk', () => {
    const svg = generateInfografiaSVG(mockData({ topRiskCountries: [
      { code: 'AF', name: 'Afganistán', flag: '', region: 'Asia', riskLevel: 'muy-alto', riskScore: 5 },
      { code: 'HT', name: 'Haití', flag: '', region: 'América', riskLevel: 'alto', riskScore: 4 },
    ] }))
    // First entry (index 0) should be the highest risk
    const afIndex = svg.indexOf('Afganistán')
    const htIndex = svg.indexOf('Haití')
    expect(afIndex).toBeGreaterThan(0)
    expect(htIndex).toBeGreaterThan(afIndex)
  })

  it('renders risk distribution bars', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('RIESGO GLOBAL - DISTRIBUCION')
    expect(svg).toContain('Sin riesgo')
    expect(svg).toContain('Bajo')
    expect(svg).toContain('Medio')
    expect(svg).toContain('Alto')
  })

  it('renders region breakdown without flag emojis', () => {
    const svg = generateInfografiaSVG(mockData())
    const flagPattern = /[\u{1F1E6}-\u{1F1FF}]/u
    expect(svg).not.toMatch(flagPattern)
  })

  it('renders headline with changes count', () => {
    const data = mockData({ countriesChanged: [{ code: 'ES', from: 'bajo', to: 'medio' }] })
    const svg = generateInfografiaSVG(data)
    expect(svg).toContain('1 PAISES CAMBIARON')
  })

  it('renders headline with high alert count', () => {
    const data = mockData({ riskDistribution: { sinRiesgo: 10, bajo: 10, medio: 10, alto: 10, muyAlto: 10 } })
    const svg = generateInfografiaSVG(data)
    expect(svg).toContain('PAISES EN ALERTA')
  })

  it('renders default headline when no changes or alerts', () => {
    const data = mockData({ countriesChanged: [], riskDistribution: { sinRiesgo: 42, bajo: 47, medio: 9, alto: 0, muyAlto: 0 } })
    const svg = generateInfografiaSVG(data)
    expect(svg).toContain('PANORAMA GLOBAL')
  })

  it('does NOT contain any emoji characters', () => {
    const svg = generateInfografiaSVG(mockData())
    // Common emoji ranges
    const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    expect(svg).not.toMatch(emojiPattern)
  })

  it('renders metrics section', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('METRICAS CLAVE')
    expect(svg).toContain('89') // seguroOBajo
    expect(svg).toContain('12') // altoOMuyAlto
  })

  it('renders CTA banner without emoji', () => {
    const svg = generateInfografiaSVG(mockData())
    expect(svg).toContain('viajeinteligencia.com/infografias')
    expect(svg).not.toContain('📊')
  })

  it('renders trend arrow when gwiTrend provided', () => {
    const up = generateInfografiaSVG(mockData({ gwiTrend: 2.5 }))
    expect(up).toContain('[up]')
    expect(up).toContain('+2.5')

    const down = generateInfografiaSVG(mockData({ gwiTrend: -1.3 }))
    expect(down).toContain('[dn]')
    expect(down).toContain('-1.3')

    const flat = generateInfografiaSVG(mockData({ gwiTrend: 0 }))
    expect(flat).toContain('0.0')
  })

  it('handles zero countries safely', () => {
    // Should handle gracefully even with weird data
    const svg = generateInfografiaSVG(mockData({ topRiskCountries: [] }))
    expect(svg).toContain('TOP 5 - MAYOR RIESGO')
    expect(svg).toContain('</svg>')
  })
})

describe('generateInfografiaHTML', () => {
  it('returns valid HTML', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
    expect(html).toContain('VIAJE CON INTELIGENCIA')
  })

  it('contains edition and week range', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('#20')
    expect(html).toContain('2026-05-18')
    expect(html).toContain('2026-05-24')
  })

  it('renders GWI with sub-indices', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('27.0')
    expect(html).toContain('GPI')
    expect(html).toContain('GTI')
  })

  it('renders Top 5 entries', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('Afganistán')
    expect(html).toContain('Haití')
  })

  it('renders risk distribution', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('Sin riesgo')
    expect(html).toContain('Bajo')
    expect(html).toContain('Alto')
  })

  it('renders CTA link', () => {
    const html = generateInfografiaHTML(mockData())
    expect(html).toContain('viajeinteligencia.com/infografias')
  })
})
