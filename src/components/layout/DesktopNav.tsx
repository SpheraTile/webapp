'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitch } from '@/components/ui/LanguageSwitch'
import { useCesta } from '@/context/CestaContext'

interface DesktopNavProps {
  transparent?: boolean
}

export function DesktopNav({ transparent = false }: DesktopNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { items } = useCesta()
  const t = useTranslations('nav')
  const totalItems = items.length
  const isAdmin = session?.user?.role === 'ADMIN'

  const navLinks = [
    { href: '/productos', label: t('products') },
    { href: '/ceramoteca', label: t('ceramoteca') },
    { href: '/cuenta', label: t('account') },
  ]

  return (
    <nav
      className={`
        hidden lg:block fixed top-0 left-0 right-0 z-50 border-b transition-colors
        ${transparent
          ? 'bg-transparent border-transparent'
          : 'bg-white/95 backdrop-blur-sm border-neutral-100'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" />

        {/* Links de navegación */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  font-medium transition-colors
                  ${transparent
                    ? isActive
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                    : isActive
                      ? 'text-primary-600'
                      : 'text-neutral-700 hover:text-primary-600'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/almacen"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${transparent
                  ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }
              `}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('warehouse')}
            </Link>
          )}
          <LanguageSwitch variant={transparent ? 'light' : 'dark'} />
          <Link
            href="/cesta"
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors relative
              ${transparent
                ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30'
                : 'bg-primary-600 text-white hover:bg-primary-700'
              }
            `}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('cart')}
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
