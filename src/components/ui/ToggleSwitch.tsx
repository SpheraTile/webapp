import { TipoAlmacen } from '@/types'

interface ToggleSwitchProps {
  value: TipoAlmacen
  onChange: (value: TipoAlmacen) => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ value, onChange, disabled = false, className = '' }: ToggleSwitchProps) {
  const isPrincipal = value === 'PRINCIPAL'

  return (
    <button
      type="button"
      onClick={() => onChange(isPrincipal ? 'LOGISTICS' : 'PRINCIPAL')}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
        isPrincipal ? 'bg-green-500' : 'bg-blue-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={isPrincipal ? 'Principal - Click para cambiar a Logistics' : 'Logistics - Click para cambiar a Principal'}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
          isPrincipal ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
