import { Producto } from '@/types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  productos: Producto[]
  className?: string
  columnas?: number
}

export function ProductGrid({ productos, className = '', columnas }: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-neutral-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <p className="text-neutral-600 text-center">
          No se encontraron productos con los filtros seleccionados
        </p>
      </div>
    )
  }

  // Si columnas === 1, vista lista
  if (columnas === 1) {
    return (
      <div className={`space-y-4 ${className}`}>
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} variant="list" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`
        grid grid-cols-2 gap-4
        md:grid-cols-3
        lg:grid-cols-4
        grid-auto-flow: dense
        auto-rows-min
        ${className}
      `}
    >
      {productos.map((producto) => {
        // Detectar productos alargados (22.5x119.5 o similar)
        const esAlargado = producto.formato.includes('22.5') && producto.formato.includes('119')

        return (
          <div
            key={producto.id}
            className={`
              ${esAlargado ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}
              break-inside-avoid
              page-break-inside-avoid
            `}
          >
            <ProductCard producto={producto} esAlargado={esAlargado} />
          </div>
        )
      })}
    </div>
  )
}
