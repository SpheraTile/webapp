'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { PasswordInput } from '@/components/ui/PasswordInput'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
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
        setError(t('invalidCredentials'))
        return
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const session = await getSession()
      console.log('Session:', session)

      const isAdmin = session?.user?.role === 'ADMIN'

      let redirectUrl = '/cuenta'
      if (callbackUrl && !callbackUrl.startsWith('/almacen')) {
        redirectUrl = callbackUrl
      } else if (isAdmin) {
        redirectUrl = '/almacen'
      }

      window.location.href = redirectUrl
    } catch (err) {
      console.error('Login error:', err)
      setError(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {(error || errorParam === 'unauthorized') && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error || t('unauthorized')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            {t('email')}
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

        <PasswordInput
          id="password"
          label={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('loggingIn') : t('login')}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {t('forgotPassword')}
          </Link>
        </div>
      </form>
    </>
  )
}

function LoginContent() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Logo size="xl" href="/" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
          {t('login')}
        </h1>
        <p className="text-neutral-500 text-center mb-6">
          {t('loginSubtitle')}
        </p>

        <Suspense fallback={<div className="text-center py-4">{tCommon('loading')}</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">
          {t('backToStore')}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <LoginContent />
    </div>
  )
}
