'use client'

import { IconCheck } from '@/components/ui/Icons'

interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  return (
    <label
      className="flex items-center gap-3 py-2 cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center
          transition-colors duration-200
          ${checked
            ? 'bg-primary-600 border-primary-600'
            : 'border-neutral-300 group-hover:border-neutral-400'
          }
        `}
      >
        {checked && <IconCheck size={14} className="text-white" />}
      </div>
      <span className="text-neutral-700">{label}</span>
    </label>
  )
}
