'use client'

import { useState } from 'react'
import { Producto } from '@/types'
import { useCesta } from '@/context/CestaContext'
import { IconPlus, IconMinus, IconCart } from '@/components/ui/Icons'

interface AddToCartButtonProps {
  producto: Producto
  className?: string
}

export function AddToCartButton({ producto, className = '' }: AddToCartButtonProps) {
  const [cantidad, setCantidad] = useState(1)
  const [mostrarInput, setMostrarInput] = useState(false)
  const { agregarItem, items } = useCesta()

  // Verificar cantidad ya en cesta
  const itemEnCesta = items.find((i) => i.producto.id === producto.id)
  const cantidadEnCesta = itemEnCesta?.cantidad_m2 || 0
  const stockDisponible = producto.stock_m2 - cantidadEnCesta

  const handleAgregar = () => {
    if (cantidad > 0 && cantidad <= stockDisponible) {
      agregarItem(producto, cantidad)
      setCantidad(1)
      setMostrarInput(false)
    }
  }

  const incrementar = () => {
    if (cantidad < stockDisponible) {
      setCantidad((prev) => prev + 1)
    }
  }

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad((prev) => prev - 1)
    }
  }

  if (stockDisponible <= 0) {
    return (
      <button
        disabled
        className={`btn-secondary opacity-50 cursor-not-allowed w-full ${className}`}
      >
        Sin stock disponible
      </button>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selector de cantidad */}
      <div className="flex items-center justify-between bg-neutral-100 rounded-lg p-2">
        <button
          onClick={decrementar}
          disabled={cantidad <= 1}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
        >
          <IconMinus size={20} />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={cantidad}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              if (!isNaN(val) && val > 0 && val <= stockDisponible) {
                setCantidad(val)
              }
            }}
            className="w-20 text-center bg-white rounded-lg py-2 font-medium
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            min={1}
            max={stockDisponible}
            step={0.01}
          />
          <span className="text-neutral-500">m²</span>
        </div>

        <button
          onClick={incrementar}
          disabled={cantidad >= stockDisponible}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
        >
          <IconPlus size={20} />
        </button>
      </div>

      {/* Info de stock disponible */}
      <p className="text-sm text-neutral-500 text-center">
        Máximo disponible: {stockDisponible.toFixed(2)} m²
      </p>

      {/* Botón agregar */}
      <button onClick={handleAgregar} className="btn-primary w-full flex items-center justify-center gap-2">
        <IconCart size={20} />
        <span>Añadir a la cesta</span>
        <span className="text-primary-200">
          ({(cantidad * producto.precio_m2).toFixed(2)}€)
        </span>
      </button>
    </div>
  )
}
