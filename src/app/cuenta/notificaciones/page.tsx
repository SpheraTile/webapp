'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconBell } from '@/components/ui/Icons'

export default function NotificacionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Notificaciones" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-2xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Notificaciones</h1>
            <p className="text-neutral-500 mt-1">Configura tus preferencias de notificación</p>
          </div>
          <Link
            href="/cuenta"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm">
          <div className="p-8 lg:p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconBell size={32} className="text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Próximamente</h2>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Las preferencias de notificación estarán disponibles pronto. Te avisaremos cuando puedas configurar alertas de stock, ofertas y novedades.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
