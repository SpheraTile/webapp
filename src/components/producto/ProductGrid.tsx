import { useMemo } from 'react'
import { Producto } from '@/types'
import { ProductCard } from './ProductCard'
import { optimizeGridLayout } from '@/lib/gridOptimizer'

interface ProductGridProps {
  productos: Producto[]
  className?: string
  columnas?: number
}

export function ProductGrid({ productos, className = '', columnas }: ProductGridProps) {
  // Optimizar orden de productos para minimizar huecos en el grid
  const displayProducts = useMemo(() => {
    if (columnas === 1) return productos // Vista lista, no optimizar
    return optimizeGridLayout(productos)
  }, [productos, columnas])
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

  // Separar productos por tipo para organizar en filas separadas
  const elongatedProducts = displayProducts.filter(p =>
    p.formato.includes('22.5') && p.formato.includes('119')
  )
  const normalProducts = displayProducts.filter(p =>
    !(p.formato.includes('22.5') && p.formato.includes('119'))
  )

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Filas de productos alargados (2 por fila) */}
      {elongatedProducts.length > 0 && (
        <div className="flex flex-col gap-4">
          {chunkArray(elongatedProducts, 2).map((row, rowIndex) => (
            <div key={`elongated-${rowIndex}`} className="grid grid-cols-2 gap-4 justify-items-center">
              {row.map((producto) => (
                <div
                  key={producto.id}
                  className="col-span-1 break-inside-avoid page-break-inside-avoid w-full max-w-lg"
                >
                  <ProductCard producto={producto} esAlargado={true} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Filas de productos normales (4 por fila en desktop) */}
      {normalProducts.length > 0 && (
        <div className="flex flex-col gap-4">
          {chunkArray(normalProducts, 4).map((row, rowIndex) => (
            <div key={`normal-${rowIndex}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
              {row.map((producto) => (
                <div
                  key={producto.id}
                  className="col-span-1 break-inside-avoid page-break-inside-avoid w-full max-w-xs"
                >
                  <ProductCard producto={producto} esAlargado={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Función auxiliar para dividir array en chunks
  function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}
