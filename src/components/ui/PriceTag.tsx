interface PriceTagProps {
  precio_m2: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PriceTag({ precio_m2, className = '', size = 'md' }: PriceTagProps) {
  // No mostrar nada si el precio es 0
  if (precio_m2 === 0) {
    return null
  }

  const precioFormateado = precio_m2.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }

  return (
    <div className={`font-semibold text-neutral-900 ${sizeClasses[size]} ${className}`}>
      {precioFormateado}€ <span className="text-neutral-500 font-normal">/m²</span>
    </div>
  )
}
