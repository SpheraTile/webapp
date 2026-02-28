import { TipoAlmacen } from '@/types'

interface AlmacenIndicatorProps {
  almacen: TipoAlmacen
  className?: string
}

export function AlmacenIndicator({ almacen, className = '' }: AlmacenIndicatorProps) {
  // PRINCIPAL = punto verde (3x3px)
  // LOGISTICS = punto azul (3x3px)
  const colorClass = almacen === 'PRINCIPAL'
    ? 'bg-green-500'
    : 'bg-blue-500'

  return (
    <span
      className={`inline-block w-[3px] h-[3px] rounded-full ${colorClass} ${className}`}
      title={`Almacén: ${almacen === 'PRINCIPAL' ? 'Principal' : 'Logistics'}`}
    />
  )
}
