'use client'

import { useState } from 'react'
import { IconSearch, IconQR } from './Icons'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showQR?: boolean
  onQRClick?: () => void
  className?: string
}

export function SearchBar({
  value = '',
  onChange,
  placeholder = '¿Qué estás buscando?',
  showQR = false,
  onQRClick,
  className = '',
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-1">
        <IconSearch
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={onChange ? value : internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="input-base pl-12"
        />
      </div>
      {showQR && (
        <button
          onClick={onQRClick}
          className="flex-shrink-0 p-3 rounded-full bg-neutral-100 text-neutral-700
                     transition-colors hover:bg-neutral-200 active:bg-neutral-300"
          aria-label="Escanear QR"
        >
          <IconQR size={24} />
        </button>
      )}
    </div>
  )
}
