import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Middleware de next-auth para protección de rutas
export default withAuth(
  function middleware(req) {
    // Verificar si intenta acceder a /almacen y no es ADMIN
    if (req.nextUrl.pathname.includes('/almacen') && req.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
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
          pathname.startsWith('/forgot-password') ||
          pathname.startsWith('/reset-password') ||
          pathname.startsWith('/productos') ||
          pathname.startsWith('/catalogo') ||
          pathname.startsWith('/ceramoteca') ||
          pathname === '/' ||
          pathname.startsWith('/api')
        ) {
          return true
        }

        // Para /almacen, requiere token con rol ADMIN
        if (pathname.includes('/almacen')) {
          return !!token && token.role === 'ADMIN'
        }

        // Para otras rutas /cuenta, /cesta, requiere cualquier token
        if (pathname.includes('/cuenta') || pathname.includes('/cesta')) {
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
