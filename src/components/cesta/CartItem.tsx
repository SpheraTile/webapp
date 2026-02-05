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
  const { producto, cantidad_m2, cantidad_cajas } = item

  // Calcular mínimo en cajas (evitar errores de precisión de punto flotante)
  const minimoM2 = producto.pedido_minimo_m2 || producto.m2_caja
  const minimoCajasExacto = minimoM2 / producto.m2_caja
  const minimoCajas = Math.abs(minimoCajasExacto - Math.round(minimoCajasExacto)) < 0.0001
    ? Math.round(minimoCajasExacto)
    : Math.ceil(minimoCajasExacto)

  // Calcular máximo en cajas
  const maxCajas = Math.floor(producto.stock_m2 / producto.m2_caja)

  const subtotal = cantidad_m2 * producto.precio_m2

  const incrementar = () => {
    if (cantidad_cajas < maxCajas) {
      actualizarCantidad(producto.id, cantidad_cajas + 1)
    }
  }

  const decrementar = () => {
    if (cantidad_cajas > minimoCajas) {
      actualizarCantidad(producto.id, cantidad_cajas - 1)
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
              disabled={cantidad_cajas <= minimoCajas}
              className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
            >
              <IconMinus size={16} />
            </button>
            <div className="text-center px-2">
              <span className="font-medium">{cantidad_cajas}</span>
              <span className="text-neutral-500 text-xs ml-1">cajas</span>
            </div>
            <button
              onClick={incrementar}
              disabled={cantidad_cajas >= maxCajas}
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

        {/* Mostrar m² calculados */}
        <p className="text-xs text-neutral-400 mt-1">
          = {cantidad_m2.toFixed(2)} m²
        </p>
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
