import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const authed = request.cookies.get('studymap:authenticated')
  const { pathname } = request.nextUrl

  if (authed && (pathname === '/' || pathname === '/es' || pathname === '/en')) {
    const locale = pathname.startsWith('/en') ? 'en' : 'es'
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
