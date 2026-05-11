import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/data/paises', () => ({
  paisesData: {
    es: {
      codigo: 'es',
      nombre: 'España',
      capital: 'Madrid',
      continente: 'Europa',
      mapaCoordenadas: [40.4168, -3.7038],
      nivelRiesgo: 'bajo',
      visible: true,
    },
    fr: {
      codigo: 'fr',
      nombre: 'Francia',
      capital: 'París',
      continente: 'Europa',
      mapaCoordenadas: [48.8566, 2.3522],
      nivelRiesgo: 'bajo',
      visible: true,
    },
  },
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return function MockDynamic() {
      return null
    }
  },
}))

const mockFetch = jest.fn<typeof fetch>()
global.fetch = mockFetch as unknown as typeof fetch

const mockClipboard = {
  writeText: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
})

import RoutePlannerClient from '@/components/RoutePlanner/RoutePlannerClient'

describe('RoutePlannerClient', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockClipboard.writeText.mockClear()
  })

  it('renders the form with origin and destination selects', () => {
    render(<RoutePlannerClient />)
    expect(screen.getByText('Planificador de Rutas')).toBeTruthy()
    expect(screen.getByText('Origen')).toBeTruthy()
    expect(screen.getByText('Destino')).toBeTruthy()
    expect(screen.getByText('Buscar rutas')).toBeTruthy()
  })

  it('shows country options in selects', () => {
    render(<RoutePlannerClient />)
    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
    const options = selects[0].querySelectorAll('option')
    const optionTexts = Array.from(options).map((o) => o.textContent)
    expect(optionTexts).toContain('España')
    expect(optionTexts).toContain('Francia')
  })

  it('submit button is disabled when origin or destination missing', () => {
    render(<RoutePlannerClient />)
    const button = screen.getByText('Buscar rutas').closest('button')!
    expect(button.disabled).toBe(true)
  })

  it('calls API on form submit and renders results', async () => {
    const mockResponse = {
      origin: 'es',
      destination: 'fr',
      date: null,
      total: 2,
      recommendation: 'Destino seguro para viajar. Coste bajo. Mejor opción: Vuelo • Directo • 90 min',
      routes: [
        {
          mode: 'flight',
          durationMinutes: 90,
          distanceKm: 0,
          costEur: 120,
          costRange: [120, 120],
          summary: 'Iberia • Directo • 90 min',
          riskLevel: 'Bajo',
          riskScore: 25,
          source: 'serpapi',
        },
        {
          mode: 'driving',
          durationMinutes: 600,
          distanceKm: 1000,
          costEur: 120,
          costRange: [84, 180],
          summary: 'Coche • 1000 km • 600 min',
          riskLevel: 'Bajo',
          riskScore: 25,
          source: 'fallback',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    render(<RoutePlannerClient />)

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'es')
    await userEvent.selectOptions(selects[1], 'fr')

    fireEvent.click(screen.getByText('Buscar rutas'))

    await waitFor(() => {
      expect(screen.getByText('Recomendación')).toBeTruthy()
    })

    expect(screen.getByText(/Iberia/)).toBeTruthy()
    expect(screen.getByText(/600 min/)).toBeTruthy()
  })

  it('displays error message when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error de prueba' }),
    } as Response)

    render(<RoutePlannerClient />)

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'es')
    await userEvent.selectOptions(selects[1], 'fr')

    fireEvent.click(screen.getByText('Buscar rutas'))

    await waitFor(() => {
      expect(screen.getByText('Error de prueba')).toBeTruthy()
    })
  })

  it('shows source badges for each route type', async () => {
    const mockResponse = {
      origin: 'es',
      destination: 'fr',
      date: null,
      total: 3,
      recommendation: 'Destino seguro para viajar.',
      routes: [
        {
          mode: 'flight',
          durationMinutes: 90,
          distanceKm: 0,
          costEur: 120,
          costRange: [120, 120],
          summary: 'Vuelo directo',
          riskLevel: 'Bajo',
          riskScore: 25,
          source: 'serpapi',
        },
        {
          mode: 'driving',
          durationMinutes: 600,
          distanceKm: 1000,
          costEur: 120,
          costRange: [84, 180],
          summary: 'Coche',
          riskLevel: 'Bajo',
          riskScore: 25,
          source: 'openroute',
          details: {
            steps: [{ instruction: 'Salir', distance: '1 km', duration: '1 min' }],
          },
        },
        {
          mode: 'transit',
          durationMinutes: 900,
          distanceKm: 1200,
          costEur: 80,
          costRange: [56, 120],
          summary: 'Transporte público',
          riskLevel: 'Bajo',
          riskScore: 25,
          source: 'fallback',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    render(<RoutePlannerClient />)

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'es')
    await userEvent.selectOptions(selects[1], 'fr')

    fireEvent.click(screen.getByText('Buscar rutas'))

    await waitFor(() => {
      expect(screen.getByText('Precio real')).toBeTruthy()
      expect(screen.getByText('Ruta real')).toBeTruthy()
      expect(screen.getByText('Estimado')).toBeTruthy()
    })
  })
})
