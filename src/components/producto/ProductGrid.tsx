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
  // Filtrar productos con stock y optimizar orden
  const displayProducts = useMemo(() => {
    const productosConStock = productos.filter(p => p.stock_m2 > 0)
    if (columnas === 1) return productosConStock // Vista lista, no optimizar
    return optimizeGridLayout(productosConStock)
  }, [productos, columnas])

  if (displayProducts.length === 0) {
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
        {displayProducts.map((producto) => (
          <ProductCard key={producto.id} producto={producto} variant="list" />
        ))}
      </div>
    )
  }

  // Agrupar productos por formato para que no se mezclen diferentes tamaños
  const productsByFormat = useMemo(() => {
    const groups: Record<string, Producto[]> = {}
    displayProducts.forEach(producto => {
      const formato = producto.formato
      if (!groups[formato]) {
        groups[formato] = []
      }
      groups[formato].push(producto)
    })
    return groups
  }, [displayProducts])

  // Determinar si un formato es alargado (22.5x119 o similar)
  const isElongatedFormat = (formato: string) => {
    return formato.includes('22.5') && formato.includes('119')
  }

  // Calcular el aspect ratio correcto basado en el formato (ancho/alto)
  const getAspectRatio = (formato: string): string | undefined => {
    const match = formato.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i)
    if (!match) return undefined

    const ancho = parseFloat(match[1])
    const alto = parseFloat(match[2])

    if (ancho > 0 && alto > 0) {
      // Simplificar la fracción ancho/alto
      const gcd = (a: number, b: number): number => {
        return b === 0 ? a : gcd(b, a % b)
      }
      const divisor = gcd(ancho, alto)
      const simpleAncho = Math.round(ancho / divisor)
      const simpleAlto = Math.round(alto / divisor)
      return `${simpleAncho}/${simpleAlto}`
    }

    return undefined
  }

  return (
    <div className={`flex flex-col gap-8 py-4 ${className}`}>
      {Object.entries(productsByFormat).map(([formato, productos]) => (
        <div key={formato} className="flex flex-col gap-3">
          {/* Header del formato con línea gris debajo */}
          <div className="flex flex-col gap-2 px-1">
            <h3 className="text-sm font-semibold text-neutral-900">{formato}</h3>
            <div className="h-px bg-neutral-300"></div>
          </div>

          {/* Productos de este formato */}
          <div className="flex flex-col gap-4">
            {chunkArray(productos, isElongatedFormat(formato) ? 2 : 4).map((row, rowIndex) => (
              <div
                key={`${formato}-${rowIndex}`}
                className={`grid gap-4 justify-items-center ${
                  isElongatedFormat(formato)
                    ? 'grid-cols-2'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {row.map((producto) => {
                  const aspectRatio = getAspectRatio(producto.formato)
                  // Si la proporción es muy alargada (≥1.5), usar max-w-lg, si no, max-w-xs
                  const isVeryElongated = aspectRatio && parseFloat(aspectRatio.split('/')[0]) / parseFloat(aspectRatio.split('/')[1]) >= 1.5

                  return (
                    <div
                      key={producto.id}
                      className={`col-span-1 break-inside-avoid page-break-inside-avoid w-full ${
                        isVeryElongated ? 'max-w-lg' : 'max-w-xs'
                      }`}
                    >
                      <ProductCard
                        producto={producto}
                        esAlargado={isElongatedFormat(formato)}
                        aspectRatio={aspectRatio}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
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
