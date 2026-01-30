'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Enlace inválido
        </h1>
        <p className="text-neutral-500 mb-6">
          El enlace para restablecer la contraseña no es válido o ha expirado.
        </p>

        <Link
          href="/forgot-password"
          className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Contraseña actualizada!
        </h1>
        <p className="text-neutral-500 mb-6">
          Tu contraseña ha sido restablecida correctamente.
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>

        <Link
          href="/login"
          className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
        Nueva contraseña
      </h1>
      <p className="text-neutral-500 text-center mb-6">
        Introduce tu nueva contraseña
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="xl" href="/" />
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-neutral-500 hover:text-primary-600 transition-colors"
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
