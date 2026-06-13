import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // SOLO actúa si hay mayúsculas (mínimo impacto)
  const hasUpperCase = pathname !== pathname.toLowerCase()

  if (hasUpperCase) {
    url.pathname = pathname.toLowerCase()
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
