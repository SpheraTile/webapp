import createMiddleware from 'next-intl/middleware'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/request'

// Crear middleware de next-intl
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
})

// Middleware combinado para next-auth y next-intl
export default withAuth(
  function middleware(req) {
    // Primero manejar los locales con next-intl
    const response = intlMiddleware(req)

    // Si la respuesta es una redirección de intl, retornarla
    if (response) {
      // Verificar si intenta acceder a /almacen y no es ADMIN
      if (req.nextUrl.pathname.includes('/almacen') && req.nextauth.token?.role !== 'ADMIN') {
        const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale
        return NextResponse.redirect(new URL(`/${locale}/login?error=unauthorized`, req.url))
      }
      return response
    }

    // Si intenta acceder a /almacen y no es ADMIN
    if (req.nextUrl.pathname.includes('/almacen') && req.nextauth.token?.role !== 'ADMIN') {
      const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/login?error=unauthorized`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a /login sin autenticación
        const pathname = req.nextUrl.pathname
        const localePath = `/${pathname.split('/')[1]}`

        if (pathname.endsWith('/login') || pathname.includes('/login?')) {
          return true
        }
        // Para /almacen, requiere token
        if (pathname.includes('/almacen')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/login', '/almacen/:path*'],
}
