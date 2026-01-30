'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ItemCesta } from '@/types'
import { useCesta } from '@/context/CestaContext'
import { IconPlus, IconMinus, IconTrash } from '@/components/ui/Icons'

interface CartItemProps {
  item: ItemCesta
}

export function CartItem({ item }: CartItemProps) {
  const { actualizarCantidad, eliminarItem } = useCesta()
  const { producto, cantidad_m2 } = item

  const subtotal = cantidad_m2 * producto.precio_m2

  const incrementar = () => {
    if (cantidad_m2 < producto.stock_m2) {
      actualizarCantidad(producto.id, cantidad_m2 + 1)
    }
  }

  const decrementar = () => {
    if (cantidad_m2 > 1) {
      actualizarCantidad(producto.id, cantidad_m2 - 1)
    }
  }

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-b-0">
      {/* Imagen */}
      <Link
        href={`/productos/${producto.slug}`}
        className="relative w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden"
      >
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/productos/${producto.slug}`}
          className="font-semibold text-neutral-900 text-sm uppercase tracking-wide line-clamp-2 hover:text-primary-600"
        >
          {producto.nombre}
        </Link>
        <p className="text-sm text-neutral-500 mt-1">{producto.formato}</p>
        <p className="text-sm text-neutral-500">
          {producto.precio_m2.toFixed(2)}€/m²
        </p>

        {/* Controles de cantidad */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-neutral-100 rounded-lg">
            <button
              onClick={decrementar}
              className="p-2 text-neutral-600 hover:text-neutral-900"
            >
              <IconMinus size={16} />
            </button>
            <span className="w-16 text-center font-medium">
              {cantidad_m2} m²
            </span>
            <button
              onClick={incrementar}
              disabled={cantidad_m2 >= producto.stock_m2}
              className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
            >
              <IconPlus size={16} />
            </button>
          </div>

          <button
            onClick={() => eliminarItem(producto.id)}
            className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
          >
            <IconTrash size={20} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <span className="font-semibold text-neutral-900">
          {subtotal.toFixed(2)}€
        </span>
      </div>
    </div>
  )
}
