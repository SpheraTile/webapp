import { TipoAlmacen } from '@/types'

interface ToggleSwitchProps {
  value: TipoAlmacen
  onChange: (value: TipoAlmacen) => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ value, onChange, disabled = false, className = '' }: ToggleSwitchProps) {
  // 3 estados: PRINCIPAL -> LOGISTICS -> AMBOS -> PRINCIPAL
  const getNextValue = (): TipoAlmacen => {
    if (value === 'PRINCIPAL') return 'LOGISTICS'
    if (value === 'LOGISTICS') return 'AMBOS'
    return 'PRINCIPAL'
  }

  const isPrincipal = value === 'PRINCIPAL'
  const isLogistics = value === 'LOGISTICS'
  const isAmbos = value === 'AMBOS'

  // Color de fondo según el estado
  const bgColors = {
    PRINCIPAL: 'bg-green-500',
    LOGISTICS: 'bg-blue-500',
    AMBOS: 'bg-gradient-to-r from-green-500 to-blue-500',
  }

  // Posición del toggle (3 posiciones para 3 estados)
  const togglePosition = isPrincipal ? 'translate-x-0.5' : isLogistics ? 'translate-x-2.5' : 'translate-x-5'

  const titleText = {
    PRINCIPAL: 'Principal - Click para cambiar a Logistics',
    LOGISTICS: 'Logistics - Click para cambiar a Ambos',
    AMBOS: 'Ambos - Click para cambiar a Principal',
  }

  return (
    <button
      type="button"
      onClick={() => onChange(getNextValue())}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out ${
        bgColors[value]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={titleText[value]}
    >
      <span
        className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${togglePosition}`}
      />
      {/* Indicador visual extra para AMBOS - dos pequeños puntos */}
      {isAmbos && (
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
      )}
    </button>
  )
}
