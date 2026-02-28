import { TipoAlmacen } from '@/types'

interface AlmacenIndicatorProps {
  almacen: TipoAlmacen
  show?: boolean
  className?: string
}

export function AlmacenIndicator({ almacen, show = true, className = '' }: AlmacenIndicatorProps) {
  // Si show es false, no renderizar nada
  if (!show) {
    return null
  }

  // PRINCIPAL = punto verde (10x10px)
  // LOGISTICS = punto azul (10x10px)
  const colorClass = almacen === 'PRINCIPAL'
    ? 'bg-green-500'
    : 'bg-blue-500'

  return (
    <span
      className={`inline-block w-[10px] h-[10px] rounded-full ${colorClass} ${className}`}
      title={`Almacén: ${almacen === 'PRINCIPAL' ? 'Principal' : 'Logistics'}`}
    />
  )
}
