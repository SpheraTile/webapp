'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitch } from '@/components/ui/LanguageSwitch'
import { IconUser } from '@/components/ui/Icons'
import { useChat } from '@/context/ChatContext'

interface HeroConfig {
  tipo: 'imagen' | 'video'
  url: string
}

// Imagen por defecto si no hay configuración
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80'

export function HeroSectionMobile() {
  const [config, setConfig] = useState<HeroConfig | null>(null)
  const [, setLoading] = useState(true)
  const t = useTranslations('home')
  const { isEnabled: isChatEnabled } = useChat()

  useEffect(() => {
    fetch('/api/configuracion?clave=hero_mobile')
      .then((res) => res.json())
      .then((data) => {
        if (data.valor) {
          setConfig(JSON.parse(data.valor))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const backgroundUrl = config?.url || DEFAULT_IMAGE
  const isVideo = config?.tipo === 'video'

  return (
    <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {/* Fondo fijo - ocupa toda la pantalla menos el menú inferior */}
      {isVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="fixed top-0 left-0 right-0 h-[calc(100dvh-4rem)] w-full object-cover"
          poster={DEFAULT_IMAGE}
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          className="fixed top-0 left-0 right-0 h-[calc(100dvh-4rem)] w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundUrl}')` }}
        />
      )}

      {/* Overlay oscuro fijo */}
      <div className="fixed top-0 left-0 right-0 h-[calc(100dvh-4rem)] bg-black/50" />

      {/* Header con logo y selector de idioma */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6">
        <div className="flex items-center justify-between">
          {/* Show user icon only when chat is enabled (Mi cuenta is in header instead of bottom nav) */}
          {isChatEnabled ? (
            <Link
              href="/cuenta"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all rounded-full border bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <IconUser size={20} />
            </Link>
          ) : (
            <div className="w-10" />
          )}
          <Logo size="lg" href={undefined} />
          <div className="text-white">
            <LanguageSwitch variant="light" />
          </div>
        </div>
      </div>

      {/* Contenido del Hero */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center text-white px-6 pb-8">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">
          {t('heroTitle')} <span className="text-primary-300">{t('heroTitleHighlight')}</span>
        </h1>
        <p className="text-white/90 text-sm mb-6 max-w-xs">
          {t('heroSubtitleMobile')}
        </p>

        {/* Botones */}
        <div className="w-full max-w-xs space-y-3">
          <Link
            href="/productos?estado_producto=novedad"
            className="block w-full py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-center transition-all active:scale-95 border border-white/30"
          >
            {t('news')}
          </Link>
          <Link
            href="/productos?estado_producto=oferta"
            className="block w-full py-3.5 bg-primary-600 text-white rounded-full font-semibold text-center transition-all active:scale-95"
          >
            {t('offers')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function HeroSectionDesktop() {
  const [config, setConfig] = useState<HeroConfig | null>(null)
  const [, setLoading] = useState(true)
  const t = useTranslations('home')

  useEffect(() => {
    fetch('/api/configuracion?clave=hero_desktop')
      .then((res) => res.json())
      .then((data) => {
        if (data.valor) {
          setConfig(JSON.parse(data.valor))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const backgroundUrl = config?.url || DEFAULT_IMAGE
  const isVideo = config?.tipo === 'video'

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Fondo */}
      {isVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={DEFAULT_IMAGE}
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundUrl}')` }}
        />
      )}

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenido del Hero */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          {t('heroTitle')} <span className="text-primary-300">{t('heroTitleHighlight')}</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-10">
          {t('heroSubtitleDesktop')}
        </p>
        <div className="flex gap-4">
          <Link
            href="/productos"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
          >
            {t('exploreCatalog')}
          </Link>
          <Link
            href="/ceramoteca"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all border border-white/30"
          >
            {t('ceramoteca')}
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  )
}
