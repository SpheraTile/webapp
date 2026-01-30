'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const errorParam = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (!result?.ok) {
        setError('Credenciales incorrectas')
        return
      }

      // Esperar un momento para que la sesión se actualice
      await new Promise(resolve => setTimeout(resolve, 100))

      // Obtener sesión para saber el rol
      const session = await getSession()
      console.log('Session:', session)

      // Redirigir según el rol
      // No usar callbackUrl si es /almacen y el usuario no es admin
      const isAdmin = session?.user?.role === 'ADMIN'

      let redirectUrl = '/cuenta'
      if (callbackUrl && !callbackUrl.startsWith('/almacen')) {
        redirectUrl = callbackUrl
      } else if (isAdmin) {
        redirectUrl = '/almacen'
      }

      // Usar window.location para forzar recarga completa
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Login error:', err)
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Error messages */}
      {(error || errorParam === 'unauthorized') && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error || 'No tienes permisos para acceder a esta sección'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="xl" href="/" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-neutral-500 text-center mb-6">
            Introduce tus credenciales para acceder a tu cuenta
          </p>

          <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Link volver */}
        <div className="text-center mt-6">
          <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
