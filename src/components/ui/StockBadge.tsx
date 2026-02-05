import { IconStock } from './Icons'

interface StockBadgeProps {
  stock_m2: number
  m2_caja?: number
  className?: string
}

export function StockBadge({ stock_m2, m2_caja, className = '' }: StockBadgeProps) {
  const stockFormateado = stock_m2.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const sinStock = stock_m2 <= 0
  const stockBajo = stock_m2 > 0 && stock_m2 < 50

  // Calcular cajas disponibles si se proporciona m2_caja
  const cajasDisponibles = m2_caja ? Math.floor(stock_m2 / m2_caja) : null

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
        ${sinStock
          ? 'bg-red-50 text-red-700'
          : stockBajo
            ? 'bg-amber-50 text-amber-700'
            : 'bg-neutral-100 text-neutral-700'
        }
        ${className}
      `}
    >
      <IconStock size={16} />
      <span>
        {sinStock
          ? 'Sin stock'
          : cajasDisponibles !== null
            ? `Disponible: ${stockFormateado} m² (${cajasDisponibles} cajas)`
            : `Disponible: ${stockFormateado} m²`
        }
      </span>
    </div>
  )
}
