'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const flags: Record<string, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
}

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

  const nextLocale = locale === 'es' ? 'en' : 'es'

  return (
    <button
      onClick={toggleLocale}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 hover:scale-105 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-lg">{flags[locale]}</span>
      <span className="uppercase">{locale}</span>
      <span className="text-xs opacity-60">→</span>
      <span className="text-lg">{flags[nextLocale]}</span>
    </button>
  )
}
