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

    // Verificar si intenta acceder a /almacen y no es ADMIN
    if (req.nextUrl.pathname.includes('/almacen') && req.nextauth.token?.role !== 'ADMIN') {
      const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/login?error=unauthorized`, req.url))
    }

    // Si next-intl retorna una respuesta, úsala
    if (response) {
      return response
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Permitir acceso público a estas rutas
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/productos') ||
          pathname.startsWith('/catalogo') ||
          pathname === '/' ||
          pathname.startsWith('/api')
        ) {
          return true
        }

        // Para /almacen, requiere token con rol ADMIN
        if (pathname.includes('/almacen')) {
          return !!token && token.role === 'ADMIN'
        }

        // Para otras rutas /cuenta, requiere cualquier token
        if (pathname.includes('/cuenta')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
