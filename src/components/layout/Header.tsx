'use client'

import Link from 'next/link'
import { IconChevronLeft, IconSearch } from '@/components/ui/Icons'

interface HeaderProps {
  titulo?: string
  showBack?: boolean
  backHref?: string
  showSearch?: boolean
  onSearchClick?: () => void
  className?: string
  sticky?: boolean
}

export function Header({
  titulo,
  showBack = false,
  backHref = '/',
  showSearch = false,
  onSearchClick,
  className = '',
  sticky = true,
}: HeaderProps) {
  return (
    <header
      className={`
        ${sticky ? 'sticky top-0 z-30' : ''} bg-white border-b border-neutral-100
        ${className}
      `}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Izquierda */}
        <div className="flex items-center gap-2 min-w-[48px]">
          {showBack ? (
            <Link
              href={backHref}
              className="p-2 -ml-2 text-neutral-700 hover:text-neutral-900"
            >
              <IconChevronLeft size={24} />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              {/* Logo SPHERA TILE */}
              <div className="flex items-center">
                <svg width="32" height="32" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#1b5e20" />
                  <text
                    x="20"
                    y="26"
                    textAnchor="middle"
                    fill="white"
                    fontSize="20"
                    fontWeight="bold"
                  >
                    S
                  </text>
                </svg>
                <span className="ml-2 font-bold text-primary-600 tracking-tight hidden sm:block">
                  SPHERA<span className="text-primary-800">TILE</span>
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Centro - Título */}
        {titulo && (
          <h1 className="text-lg font-semibold text-neutral-900 truncate">
            {titulo}
          </h1>
        )}

        {/* Derecha */}
        <div className="flex items-center gap-2 min-w-[48px] justify-end">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="p-2 -mr-2 text-neutral-700 hover:text-neutral-900"
            >
              <IconSearch size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
