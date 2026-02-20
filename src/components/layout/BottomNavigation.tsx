'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  IconHome,
  IconSearch,
  IconCeramoteca,
  IconCart,
  IconUser,
} from '@/components/ui/Icons'
import { Bot } from 'lucide-react'
import { useCesta } from '@/context/CestaContext'
import { useChat } from '@/context/ChatContext'
import { AddToHomeScreen } from '@/components/ui/AddToHomeScreen'

export function BottomNavigation() {
  const pathname = usePathname()
  const { items } = useCesta()
  const { toggleChat, isOpen: isChatOpen, isEnabled: isChatEnabled } = useChat()
  const t = useTranslations('nav')

  const navItems = [
    { href: '/', label: t('home'), icon: IconHome },
    { href: '/productos', label: t('products'), icon: IconSearch },
    { href: '/ceramoteca', label: t('ceramoteca'), icon: IconCeramoteca },
    { href: '/cesta', label: t('cart'), icon: IconCart, showBadge: true },
  ]

  const totalItems = items.length

  // No mostrar en rutas de almacén
  if (pathname.startsWith('/almacen')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 pb-safe lg:hidden print:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex-1 py-2 ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon size={24} />
                {item.showBadge && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}

        {/* Show Chat button or Mi cuenta based on chat enabled setting */}
        {isChatEnabled ? (
          <button
            onClick={toggleChat}
            className={`nav-item flex-1 py-2 ${isChatOpen ? 'active' : ''}`}
          >
            <Bot size={24} />
            <span className="text-xs mt-1">{t('chat')}</span>
          </button>
        ) : (
          <>
            <Link
              href="/cuenta"
              className={`nav-item flex-1 py-2 ${pathname.startsWith('/cuenta') ? 'active' : ''}`}
            >
              <IconUser size={24} />
              <span className="text-xs mt-1">{t('account')}</span>
            </Link>
            <AddToHomeScreen />
          </>
        )}
      </div>
    </nav>
  )
}
