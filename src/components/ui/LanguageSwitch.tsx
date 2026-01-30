'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const languages = [
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
]

interface LanguageSwitchProps {
  variant?: 'light' | 'dark'
}

export function LanguageSwitch({ variant = 'dark' }: LanguageSwitchProps) {
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(l => l.code === locale) || languages[0]
  const otherLanguages = languages.filter(l => l.code !== locale)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLocale = async (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    setLoading(true)
    setIsOpen(false)

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

  const buttonStyles = variant === 'light'
    ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current language button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 rounded-full border ${buttonStyles}`}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="uppercase">{locale}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden min-w-[140px] z-50">
          {otherLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLocale(lang.code)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-neutral-100 transition-colors text-neutral-800"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
