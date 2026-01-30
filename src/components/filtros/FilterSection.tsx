'use client'

import { useState } from 'react'
import { IconChevronDown, IconChevronUp } from '@/components/ui/Icons'

interface FilterSectionProps {
  titulo: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function FilterSection({ titulo, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="font-semibold text-neutral-900">{titulo}</span>
        {isOpen ? (
          <IconChevronUp size={20} className="text-neutral-500" />
        ) : (
          <IconChevronDown size={20} className="text-neutral-500" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  )
}
