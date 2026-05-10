import { NextRequest, NextResponse } from 'next/server'
import { findRoutes, getRouteRecommendation } from '@/lib/routes'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const date = searchParams.get('date') || undefined

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'origin y destination son requeridos (códigos ISO país, ej: es, fr)' },
      { status: 400 }
    )
  }

  if (origin === destination) {
    return NextResponse.json(
      { error: 'origin y destination deben ser diferentes' },
      { status: 400 }
    )
  }

  try {
    const routes = await findRoutes(origin, destination, date)
    const recommendation = getRouteRecommendation(routes)

    return NextResponse.json({
      origin: origin.toLowerCase(),
      destination: destination.toLowerCase(),
      date: date || null,
      routes,
      recommendation,
      total: routes.length,
    })
  } catch (error) {
    console.error('[API Routes] Error:', error)
    return NextResponse.json(
      { error: 'Error al calcular rutas' },
      { status: 500 }
    )
  }
}
