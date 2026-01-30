'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LanguageSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggleLocale = async () => {
    const newLocale = locale === 'es' ? 'en' : 'es'
    setLoading(true)

    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })

      router.refresh()
    } catch (error) {
      console.error('Error changing locale:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleLocale}
      disabled={loading}
      className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium transition-colors disabled:opacity-50 hover:opacity-80"
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={`fi fi-${locale === 'es' ? 'es' : 'gb'} rounded-sm`} />
      <span className="uppercase">{locale}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-3 h-3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </button>
  )
}
