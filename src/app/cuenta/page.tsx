'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconUser, IconChevronDown, IconPackage, IconReceipt, IconMapPin, IconBell, IconHelp, IconLogout } from '@/components/ui/Icons'

interface UserProfile {
  id: string
  email: string
  nombre: string
  role: string
  telefono?: string
  empresa?: string
  nif_cif?: string
  direccion?: string
  ciudad?: string
  provincia?: string
  codigo_postal?: string
}

export default function CuentaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const t = useTranslations('account')
  const tAuth = useTranslations('auth')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      if (session?.user) {
        try {
          const [profileRes, pedidosRes] = await Promise.all([
            fetch('/api/perfil'),
            fetch('/api/mis-pedidos'),
          ])

          if (profileRes.ok) {
            const profileData = await profileRes.json()
            setProfile(profileData)
          }

          if (pedidosRes.ok) {
            const pedidosData = await pedidosRes.json()
            setPedidosCount(pedidosData.pedidos?.length || 0)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || loading) {
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
        <Header titulo={t('title')} />
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">{t('title')}</h1>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Sidebar con perfil */}
          <div className="lg:col-span-1">
            <div className="p-4 border-b border-neutral-200 lg:border-none lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-6">
              <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <IconUser size={32} className="text-primary-600 lg:w-12 lg:h-12" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900 lg:text-xl lg:mt-4">
                    {profile?.nombre || session.user?.name}
                  </h2>
                  <p className="text-sm text-neutral-500">{profile?.email || session.user?.email}</p>
                  {profile?.empresa && (
                    <p className="text-sm text-neutral-500">{profile.empresa}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Info rápida (desktop) */}
            <div className="hidden lg:block mt-6 p-6 bg-white rounded-2xl shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-3">{t('information')}</h3>
              {profile?.telefono && (
                <p className="text-sm text-neutral-600">{profile.telefono}</p>
              )}
              {profile?.nif_cif && (
                <p className="text-sm text-neutral-500">{t('nifCif')}: {profile.nif_cif}</p>
              )}
              {profile?.ciudad && (
                <p className="text-sm text-neutral-500">{profile.ciudad}{profile.provincia ? `, ${profile.provincia}` : ''}</p>
              )}
              <Link
                href="/cuenta/perfil"
                className="mt-4 block w-full py-2 px-4 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors text-center"
              >
                {t('editProfile')}
              </Link>
            </div>
          </div>

          {/* Opciones de cuenta */}
          <div className="lg:col-span-2">
            {/* Acceso rápido al almacén para admins */}
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/almacen"
                className="flex items-center gap-4 p-4 mb-4 bg-neutral-900 text-white rounded-xl lg:rounded-2xl hover:bg-neutral-800 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t('warehousePanel')}</h3>
                  <p className="text-sm text-neutral-400">{t('warehouseDesc')}</p>
                </div>
                <IconChevronDown size={20} className="text-neutral-400 -rotate-90" />
              </Link>
            )}

            <div className="divide-y divide-neutral-100 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden lg:divide-neutral-200">
              <MenuOption
                href="/cuenta/pedidos"
                icon={<IconPackage size={22} />}
                label={t('orders')}
                badge={pedidosCount > 0 ? String(pedidosCount) : undefined}
              />
              <MenuOption
                href="/cuenta/facturas"
                icon={<IconReceipt size={22} />}
                label={t('invoices')}
              />
              <MenuOption
                href="/cuenta/facturacion"
                icon={<IconReceipt size={22} />}
                label={t('billing')}
              />
              <MenuOption
                href="/cuenta/direcciones"
                icon={<IconMapPin size={22} />}
                label={t('addresses')}
              />
              <MenuOption
                href="/cuenta/notificaciones"
                icon={<IconBell size={22} />}
                label={t('notifications')}
              />
              <MenuOption
                href="/cuenta/ayuda"
                icon={<IconHelp size={22} />}
                label={t('help')}
              />
            </div>

            {/* Editar perfil (mobile) */}
            <div className="lg:hidden p-4 mt-4">
              <Link
                href="/cuenta/perfil"
                className="block w-full py-3 text-center bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
              >
                {t('editProfile')}
              </Link>
            </div>

            {/* Cerrar sesión */}
            <div className="p-4 mt-4 lg:mt-6">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-3 text-center text-red-600 font-medium lg:bg-white lg:rounded-xl lg:shadow-sm lg:hover:bg-red-50 transition-colors"
              >
                <IconLogout size={20} />
                {tAuth('logout')}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 py-4 lg:py-8">
          SPHERA TILE v1.0.0
        </p>
      </div>
    </div>
  )
}

function MenuOption({
  href,
  icon,
  label,
  badge,
}: {
  href: string
  icon: React.ReactNode
  label: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between w-full px-4 py-4 lg:px-6 lg:py-5 text-left hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-neutral-500">{icon}</span>
        <span className="text-neutral-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
            {badge}
          </span>
        )}
        <IconChevronDown size={20} className="text-neutral-400 -rotate-90" />
      </div>
    </Link>
  )
}
