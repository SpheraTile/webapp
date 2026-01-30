import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Si intenta acceder a /almacen y no es ADMIN, redirigir
    if (req.nextUrl.pathname.startsWith('/almacen') && req.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a /login sin autenticación
        if (req.nextUrl.pathname === '/login') {
          return true
        }
        // Para /almacen, requiere token
        if (req.nextUrl.pathname.startsWith('/almacen')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/almacen/:path*', '/login'],
}
