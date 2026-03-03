import { useMemo } from 'react'
import { Producto } from '@/types'
import { ProductCard } from './ProductCard'
import { sortGridProducts, getGridFormatType, GridFormatType } from '@/lib/gridOptimizer'

interface ProductGridProps {
  productos: Producto[]
  className?: string
  columnas?: number
  onAlmacenChange?: (productoId: string, nuevoAlmacen: 'PRINCIPAL' | 'LOGISTICS' | 'AMBOS') => void
  onEstadoChange?: (productoId: string, nuevoEstado: 'normal' | 'oferta' | 'novedad') => void
}

export function ProductGrid({ productos, className = '', columnas, onAlmacenChange, onEstadoChange }: ProductGridProps) {
  // Filtrar productos con stock > 0 (no filtrar por precio)
  const displayProducts = useMemo(() => {
    return productos.filter(p => p.stock_m2 > 0)
  }, [productos])

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
          <ProductCard
            key={producto.id}
            producto={producto}
            variant="list"
            onAlmacenChange={onAlmacenChange}
            onEstadoChange={onEstadoChange}
          />
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

    // Convertir de record a array para poder ordenarlo
    const groupsArray = Object.entries(groups).map(([formato, list]) => ({
      formato,
      productos: sortGridProducts(list)
    }))

    // Ordenar los GRUPOS completos basándonos en el primer producto de cada grupo
    // de esta manera aseguramos que los grupos 60x60 aparezcan primero, luego 60.5, etc.
    return groupsArray.sort((a, b) => {
      // Usamos el listado original ordenado por sortGridProducts para saber
      // la posición global de cada formato
      const globalSorted = sortGridProducts(displayProducts)
      const indexA = globalSorted.findIndex(p => p.formato === a.formato)
      const indexB = globalSorted.findIndex(p => p.formato === b.formato)
      return indexA - indexB
    })
  }, [displayProducts])

  return (
    <div className={`flex flex-col gap-8 py-4 ${className}`}>
      {productsByFormat.map(({ formato, productos }) => {
        const formatType = getGridFormatType(formato)

        // Determinar las clases del contenedor padre del grid basándonos en el tipo principal.
        // Base es grid-cols-2 en móvil, y md:grid-cols-4 en desktop.
        // Esto permite que items 'col-span-2' ocupen todo el ancho en móvil y la mitad en desktop.
        // Los items 'col-span-1' ocuparán mitad en móvil y un cuarto en desktop.
        const gridClass = "grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center"

        return (
          <div key={formato} className="flex flex-col gap-3">
            {/* Header del formato con línea gris debajo */}
            <div className="flex flex-col gap-2 px-1">
              <h3 className="text-sm font-semibold text-neutral-900">{formato}</h3>
              <div className="h-px bg-neutral-300"></div>
            </div>

            {/* Productos de este formato */}
            <div className={gridClass}>
              {productos.map((producto) => {
                // Asignar el col-span por tipo de formato.
                // Requerimiento: alargados y 60x120 ocupan 2 columnas siempre.
                // Resto ocupan 1 columna.
                const colSpanClass = (formatType === 'elongated' || formatType === '60x120')
                  ? 'col-span-2'
                  : 'col-span-1'

                return (
                  <div
                    key={producto.id}
                    className={`${colSpanClass} break-inside-avoid page-break-inside-avoid w-full`}
                  >
                    <ProductCard
                      producto={producto}
                      formatType={formatType}
                      onAlmacenChange={onAlmacenChange}
                      onEstadoChange={onEstadoChange}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
