'use client'

import { IconCheck } from '@/components/ui/Icons'

interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  count?: number
  disabled?: boolean
}

export function FilterCheckbox({ label, checked, onChange, count, disabled }: FilterCheckboxProps) {
  const isDisabled = disabled || (count === 0 && !checked)

  return (
    <label
      className={`flex items-center justify-between py-2 cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        if (!isDisabled) onChange(!checked)
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            transition-colors duration-200
            ${checked
              ? 'bg-primary-600 border-primary-600'
              : isDisabled
                ? 'border-neutral-200'
                : 'border-neutral-300 group-hover:border-neutral-400'
            }
          `}
        >
          {checked && <IconCheck size={14} className="text-white" />}
        </div>
        <span className={isDisabled ? 'text-neutral-400' : 'text-neutral-700'}>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-sm ${isDisabled ? 'text-neutral-300' : 'text-neutral-400'}`}>
          {count}
        </span>
      )}
    </label>
  )
}
